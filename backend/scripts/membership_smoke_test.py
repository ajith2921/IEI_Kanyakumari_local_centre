from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
import time
from typing import Any, Dict, Optional
from urllib import error, request


class ApiRequestError(Exception):
    def __init__(self, method: str, url: str, status_code: int, detail: str):
        super().__init__(f"{method} {url} failed ({status_code}): {detail}")
        self.method = method
        self.url = url
        self.status_code = status_code
        self.detail = detail


def load_dotenv(dotenv_path: Path) -> None:
    if not dotenv_path.exists():
        return

    for line in dotenv_path.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or "=" not in stripped:
            continue
        key, value = stripped.split("=", 1)
        key = key.strip()
        if not key or key in os.environ:
            continue
        normalized_value = value.strip().strip('"').strip("'")
        os.environ[key] = normalized_value


def parse_error_detail(raw_text: str) -> str:
    if not raw_text:
        return "No error detail returned."

    try:
        payload = json.loads(raw_text)
    except json.JSONDecodeError:
        return raw_text

    detail = payload.get("detail") if isinstance(payload, dict) else payload
    if isinstance(detail, str):
        return detail
    return json.dumps(detail)


def http_json(
    method: str,
    url: str,
    payload: Optional[Dict[str, Any]] = None,
    headers: Optional[Dict[str, str]] = None,
    timeout: int = 15,
) -> Dict[str, Any]:
    body = None
    request_headers = {"Accept": "application/json"}

    if payload is not None:
        body = json.dumps(payload).encode("utf-8")
        request_headers["Content-Type"] = "application/json"

    if headers:
        request_headers.update(headers)

    req = request.Request(url=url, method=method, data=body, headers=request_headers)

    try:
        with request.urlopen(req, timeout=timeout) as response:
            raw_text = response.read().decode("utf-8")
            if not raw_text:
                return {}
            try:
                return json.loads(raw_text)
            except json.JSONDecodeError:
                return {"raw": raw_text}
    except error.HTTPError as exc:
        raw_text = exc.read().decode("utf-8", errors="replace")
        raise ApiRequestError(method, url, exc.code, parse_error_detail(raw_text)) from exc
    except error.URLError as exc:
        raise RuntimeError(f"{method} {url} failed to connect: {exc.reason}") from exc


def require_env(name: str) -> str:
    value = (os.getenv(name) or "").strip()
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


def expect_refresh_token(rotation_input: Dict[str, Any]) -> str:
    token = str(rotation_input.get("refresh_token") or "").strip()
    if not token:
        raise RuntimeError("Refresh token was missing in response.")
    return token


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Run membership portal smoke checks against a running backend instance.",
    )
    parser.add_argument(
        "--base-url",
        default=os.getenv("MEMBERSHIP_SMOKE_BASE_URL", "http://127.0.0.1:8000/api"),
        help="Base API URL, default: http://127.0.0.1:8000/api",
    )
    parser.add_argument(
        "--dotenv",
        default="",
        help="Optional path to .env file for admin credentials (defaults to backend/.env)",
    )
    parser.add_argument(
        "--require-reset-token",
        action="store_true",
        help="Fail if forgot-password response does not include reset_token.",
    )
    args = parser.parse_args()

    base_url = args.base_url.rstrip("/")

    default_dotenv = Path(__file__).resolve().parents[1] / ".env"
    dotenv_path = Path(args.dotenv) if args.dotenv else default_dotenv
    load_dotenv(dotenv_path)

    admin_username = require_env("ADMIN_USERNAME")
    admin_password = require_env("ADMIN_PASSWORD")

    stamp = str(int(time.time()))
    mobile_tail = stamp[-9:].rjust(9, "0")
    email = f"premium.smoke.{stamp}@example.com"
    mobile = f"9{mobile_tail}"
    password = "Strong@123A"
    new_password = "NewStrong@123A"

    print(f"[1/10] Checking health at {base_url}/health")
    health = http_json("GET", f"{base_url}/health")
    if health.get("status") != "ok":
        raise RuntimeError(f"Unexpected health response: {health}")

    print("[2/10] Submitting membership registration request")
    register_payload = {
        "existing_member": False,
        "membership_no": "",
        "name": f"Premium Smoke {stamp}",
        "email": email,
        "mobile": mobile,
        "password": password,
        "confirm_password": password,
        "membership_type": "AMIE",
        "interest_area": "Automation",
    }
    register_response = http_json("POST", f"{base_url}/register", payload=register_payload)
    request_id = int(register_response.get("request_id") or 0)
    if request_id <= 0:
        raise RuntimeError(f"Registration response missing request_id: {register_response}")

    print("[3/10] Authenticating admin")
    admin_login_payload = {"username": admin_username, "password": admin_password}
    admin_login_response = http_json("POST", f"{base_url}/auth/login", payload=admin_login_payload)
    admin_token = str(admin_login_response.get("access_token") or "").strip()
    if not admin_token:
        raise RuntimeError("Admin login did not return access_token.")

    print("[4/10] Approving membership request")
    status_payload = {"status": "approved", "review_notes": "Smoke test approval"}
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    http_json(
        "PATCH",
        f"{base_url}/membership/{request_id}/status",
        payload=status_payload,
        headers=admin_headers,
    )

    print("[5/10] Logging in as approved member")
    login_payload = {"identifier": email, "password": password}
    login_response = http_json("POST", f"{base_url}/login", payload=login_payload)
    member_access_token = str(login_response.get("access_token") or "").strip()
    first_refresh_token = expect_refresh_token(login_response)
    if not member_access_token:
        raise RuntimeError("Member login did not return access_token.")

    member_headers = {"Authorization": f"Bearer {member_access_token}"}

    print("[6/10] Accessing protected profile endpoint")
    profile_response = http_json("GET", f"{base_url}/membership-portal/profile", headers=member_headers)
    if int(profile_response.get("id") or 0) <= 0:
        raise RuntimeError(f"Profile response missing member id: {profile_response}")

    print("[7/10] Refreshing session token and validating rotation")
    refresh_response = http_json(
        "POST",
        f"{base_url}/membership-portal/token/refresh",
        payload={"refresh_token": first_refresh_token},
    )
    rotated_refresh_token = expect_refresh_token(refresh_response)

    try:
        http_json(
            "POST",
            f"{base_url}/membership-portal/token/refresh",
            payload={"refresh_token": first_refresh_token},
        )
    except ApiRequestError as exc:
        if exc.status_code != 401:
            raise
    else:
        raise RuntimeError("Old refresh token was unexpectedly accepted after rotation.")

    print("[8/10] Requesting forgot-password reset token")
    forgot_response = http_json(
        "POST",
        f"{base_url}/forgot-password",
        payload={"identifier": email},
    )
    reset_token = str(forgot_response.get("reset_token") or "").strip()

    if not reset_token and args.require_reset_token:
        raise RuntimeError(
            "Reset token is hidden by configuration. Set MEMBERSHIP_EXPOSE_RESET_TOKEN=true for full reset validation."
        )

    if reset_token:
        print("[9/10] Resetting password and validating new login")
        reset_payload = {
            "token": reset_token,
            "password": new_password,
            "confirm_password": new_password,
        }
        http_json("POST", f"{base_url}/membership-portal/reset-password", payload=reset_payload)

        relogin_response = http_json(
            "POST",
            f"{base_url}/login",
            payload={"identifier": email, "password": new_password},
        )
        member_access_token = str(relogin_response.get("access_token") or "").strip()
        if not member_access_token:
            raise RuntimeError("Post-reset login did not return access_token.")
    else:
        print("[9/10] Skipping reset-password execution because reset token is intentionally hidden")

    print("[10/10] Logging out")
    logout_headers = {"Authorization": f"Bearer {member_access_token}"}
    http_json("POST", f"{base_url}/membership-portal/logout", payload={}, headers=logout_headers)

    print("Membership smoke test completed successfully.")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"SMOKE TEST FAILED: {exc}")
        raise
