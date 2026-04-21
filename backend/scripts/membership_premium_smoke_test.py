from __future__ import annotations

import argparse
import hashlib
import hmac
import json
import os
from pathlib import Path
import secrets
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
        os.environ[key] = value.strip().strip('"').strip("'")


def env_flag(name: str, default: bool = False) -> bool:
    value = (os.getenv(name) or "").strip().lower()
    if not value:
        return default
    return value in {"1", "true", "yes", "on"}


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
    payload: Optional[Any] = None,
    *,
    raw_body: Optional[bytes] = None,
    headers: Optional[Dict[str, str]] = None,
    timeout: int = 20,
) -> Any:
    if payload is not None and raw_body is not None:
        raise RuntimeError("Provide either payload or raw_body, not both.")

    body = None
    request_headers = {"Accept": "application/json"}

    if payload is not None:
        body = json.dumps(payload).encode("utf-8")
        request_headers["Content-Type"] = "application/json"
    elif raw_body is not None:
        body = raw_body
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


def require(condition: bool, message: str) -> None:
    if not condition:
        raise RuntimeError(message)


def require_token(payload: Any, field_name: str) -> str:
    if not isinstance(payload, dict):
        raise RuntimeError(f"Expected JSON object with {field_name}, got: {payload}")
    token = str(payload.get(field_name) or "").strip()
    if not token:
        raise RuntimeError(f"Response did not contain {field_name}.")
    return token


def pick_premium_plan(plans_payload: Any) -> Dict[str, Any]:
    if not isinstance(plans_payload, list) or not plans_payload:
        raise RuntimeError("Premium plans endpoint returned no plans.")

    premium_plans = [
        item
        for item in plans_payload
        if isinstance(item, dict) and str(item.get("code") or "").upper().startswith("PREMIUM")
    ]
    candidates = premium_plans or [item for item in plans_payload if isinstance(item, dict)]
    if not candidates:
        raise RuntimeError("No valid plan rows found in premium plans response.")

    return candidates[0]


def build_webhook_signature(body: bytes, secret: str) -> str:
    digest = hmac.new(secret.encode("utf-8"), body, hashlib.sha256).hexdigest()
    return digest


def main() -> None:
    parser = argparse.ArgumentParser(
        description=(
            "Run premium membership smoke checks against a running backend instance "
            "(checkout, webhook activation, admin renew/refund, events)."
        ),
    )
    parser.add_argument(
        "--base-url",
        default=os.getenv("MEMBERSHIP_PREMIUM_SMOKE_BASE_URL", "http://127.0.0.1:8000/api"),
        help="Base API URL, default: http://127.0.0.1:8000/api",
    )
    parser.add_argument(
        "--dotenv",
        default="",
        help="Optional path to .env file for credentials/settings (defaults to backend/.env)",
    )
    parser.add_argument(
        "--billing-cycle",
        choices=["monthly", "yearly"],
        default="monthly",
        help="Billing cycle used for checkout and renew flow (default: monthly)",
    )
    parser.add_argument(
        "--skip-webhook",
        action="store_true",
        help="Skip webhook payment activation and premium analytics entitlement verification.",
    )
    parser.add_argument(
        "--skip-admin-ops",
        action="store_true",
        help="Skip admin renew/refund operation checks.",
    )
    args = parser.parse_args()

    base_url = args.base_url.rstrip("/")

    default_dotenv = Path(__file__).resolve().parents[1] / ".env"
    dotenv_path = Path(args.dotenv) if args.dotenv else default_dotenv
    load_dotenv(dotenv_path)

    admin_username = require_env("ADMIN_USERNAME")
    admin_password = require_env("ADMIN_PASSWORD")

    configured_provider = (os.getenv("MEMBERSHIP_PAYMENT_PROVIDER") or "sandbox").strip().lower() or "sandbox"
    webhook_secret = (os.getenv("MEMBERSHIP_PAYMENT_WEBHOOK_SECRET") or "").strip()
    webhook_header = (
        (os.getenv("MEMBERSHIP_PAYMENT_WEBHOOK_SIGNATURE_HEADER") or "x-membership-signature")
        .strip()
        .lower()
    )
    allow_unsigned_webhooks = env_flag("MEMBERSHIP_PAYMENT_ALLOW_UNSIGNED_WEBHOOKS", False)

    stamp = str(int(time.time() * 1000))
    nonce = secrets.token_hex(3)
    email = f"premium.e2e.{stamp}.{nonce}@example.com"
    mobile_suffix = str(secrets.randbelow(10000)).rjust(4, "0")
    mobile = f"9{stamp[-5:]}{mobile_suffix}"
    password = "Strong@123A"

    print(f"[1/15] Checking health at {base_url}/health")
    health = http_json("GET", f"{base_url}/health")
    if not isinstance(health, dict) or health.get("status") != "ok":
        raise RuntimeError(f"Unexpected health response: {health}")

    print("[2/15] Submitting membership registration")
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
    require(isinstance(register_response, dict), f"Unexpected register response payload: {register_response}")
    request_id = int(register_response.get("request_id") or 0)
    require(request_id > 0, f"Registration response missing request_id: {register_response}")

    print("[3/15] Logging in as admin")
    admin_login_response = http_json(
        "POST",
        f"{base_url}/auth/login",
        payload={"username": admin_username, "password": admin_password},
    )
    admin_token = require_token(admin_login_response, "access_token")
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    print("[4/15] Approving membership request")
    http_json(
        "PATCH",
        f"{base_url}/membership/{request_id}/status",
        payload={"status": "approved", "review_notes": "Premium smoke approval"},
        headers=admin_headers,
    )

    print("[5/15] Logging in as approved member")
    member_login_response = http_json(
        "POST",
        f"{base_url}/login",
        payload={"identifier": email, "password": password},
    )
    member_token = require_token(member_login_response, "access_token")
    member_headers = {"Authorization": f"Bearer {member_token}"}

    print("[6/15] Loading premium plans")
    plans_payload = http_json("GET", f"{base_url}/membership-premium/plans", headers=member_headers)
    plan = pick_premium_plan(plans_payload)
    plan_code = str(plan.get("code") or "").strip()
    require(bool(plan_code), f"Selected plan is missing code: {plan}")

    print("[7/15] Starting checkout session")
    checkout_payload_in = {"plan_code": plan_code, "billing_cycle": args.billing_cycle}
    checkout_response = http_json(
        "POST",
        f"{base_url}/membership-portal/subscription/checkout",
        payload=checkout_payload_in,
        headers=member_headers,
    )
    require(isinstance(checkout_response, dict), f"Unexpected checkout payload: {checkout_response}")

    provider = str(checkout_response.get("provider") or configured_provider).strip().lower()
    subscription = checkout_response.get("subscription") or {}
    invoice = checkout_response.get("invoice") or {}
    checkout_payload = checkout_response.get("checkout_payload") or {}
    checkout_reference = str(checkout_response.get("checkout_reference") or "")
    invoice_number = str(invoice.get("invoice_number") or "")
    subscription_id = int(subscription.get("id") or 0)

    require(subscription_id > 0, f"Checkout response missing subscription id: {checkout_response}")
    require(bool(invoice_number), f"Checkout response missing invoice number: {checkout_response}")
    require(bool(checkout_reference), f"Checkout response missing checkout reference: {checkout_response}")
    require(isinstance(checkout_payload, dict), f"checkout_payload should be an object: {checkout_payload}")
    require(
        str(checkout_payload.get("checkout_reference") or "") == checkout_reference,
        "Checkout payload checkout_reference did not match checkout response.",
    )
    require(
        str(checkout_payload.get("invoice_number") or "") == invoice_number,
        "Checkout payload invoice_number did not match checkout response invoice.",
    )

    if provider == "stripe":
        require("publishable_key" in checkout_payload, "Stripe checkout payload is missing publishable_key.")
    if provider == "razorpay":
        require("key_id" in checkout_payload, "Razorpay checkout payload is missing key_id.")

    webhook_result: Any = {"skipped": True}

    if args.skip_webhook:
        print("[8/15] Skipping webhook activation (--skip-webhook)")
    else:
        print("[8/15] Sending signed payment webhook (paid)")
        if not webhook_secret and not allow_unsigned_webhooks:
            raise RuntimeError(
                "Webhook secret is not configured and unsigned webhooks are disabled. "
                "Set MEMBERSHIP_PAYMENT_WEBHOOK_SECRET or enable MEMBERSHIP_PAYMENT_ALLOW_UNSIGNED_WEBHOOKS=true, "
                "or run with --skip-webhook."
            )

        webhook_payload = {
            "provider": provider,
            "event_id": f"smoke.{int(time.time())}.{secrets.token_hex(4)}",
            "event_type": "payment.updated",
            "invoice_number": invoice_number,
            "status": "paid",
            "payment_reference": f"smoke-paid-{secrets.token_hex(4)}",
        }
        raw_body = json.dumps(webhook_payload).encode("utf-8")
        webhook_headers = {}
        if webhook_secret:
            webhook_headers[webhook_header] = build_webhook_signature(raw_body, webhook_secret)

        webhook_result = http_json(
            "POST",
            f"{base_url}/membership-premium/payment/webhook",
            raw_body=raw_body,
            headers=webhook_headers,
        )
        require(isinstance(webhook_result, dict), f"Unexpected webhook response payload: {webhook_result}")
        require(bool(webhook_result.get("processed")), f"Webhook was not processed: {webhook_result}")

        print("[9/15] Verifying active subscription and premium analytics entitlement")
        subscription_state = http_json(
            "GET",
            f"{base_url}/membership-portal/subscription",
            headers=member_headers,
        )
        require(isinstance(subscription_state, dict), f"Unexpected subscription payload: {subscription_state}")
        require(
            str(subscription_state.get("status") or "") in {"active", "trialing", "past_due"},
            f"Subscription did not transition to entitlement-eligible status: {subscription_state}",
        )

        analytics_payload = http_json(
            "GET",
            f"{base_url}/membership-portal/cpd-analytics",
            headers=member_headers,
        )
        require(isinstance(analytics_payload, dict), f"Unexpected analytics payload: {analytics_payload}")
        require("total_activities" in analytics_payload, "Analytics response missing total_activities field.")

    print("[10/15] Loading admin metrics")
    metrics_payload = http_json(
        "GET",
        f"{base_url}/membership-premium/admin/metrics",
        headers=admin_headers,
    )
    require(isinstance(metrics_payload, dict), f"Unexpected metrics payload: {metrics_payload}")

    print("[11/15] Loading admin payment events")
    events_payload = http_json(
        "GET",
        f"{base_url}/membership-premium/admin/events?limit=150",
        headers=admin_headers,
    )
    require(isinstance(events_payload, list), f"Unexpected events payload: {events_payload}")

    related_checkout_events = [
        item
        for item in events_payload
        if isinstance(item, dict) and str(item.get("invoice_number") or "") == invoice_number
    ]
    if not args.skip_webhook:
        require(bool(related_checkout_events), f"No payment events found for checkout invoice {invoice_number}.")

    renew_invoice_number = ""
    refund_result: Any = {"skipped": True}

    if args.skip_admin_ops:
        print("[12/15] Skipping admin renew/refund checks (--skip-admin-ops)")
    else:
        print("[12/15] Running admin renew + activate")
        renew_payload = {
            "billing_cycle": args.billing_cycle,
            "activate_now": True,
        }
        renew_result = http_json(
            "POST",
            f"{base_url}/membership-premium/admin/subscriptions/{subscription_id}/renew",
            payload=renew_payload,
            headers=admin_headers,
        )
        require(isinstance(renew_result, dict), f"Unexpected renew response: {renew_result}")
        renew_invoice = renew_result.get("invoice") or {}
        renew_invoice_id = int(renew_invoice.get("id") or 0)
        renew_invoice_number = str(renew_invoice.get("invoice_number") or "")
        require(renew_invoice_id > 0, f"Renew response missing invoice id: {renew_result}")
        require(
            str(renew_invoice.get("status") or "") == "paid",
            f"Renew invoice should be paid when activate_now=true: {renew_result}",
        )

        print("[13/15] Running admin refund for renewed invoice")
        refund_payload = {
            "reason": "Premium smoke refund",
            "payment_reference": "",
        }
        refund_result = http_json(
            "POST",
            f"{base_url}/membership-premium/admin/invoices/{renew_invoice_id}/refund",
            payload=refund_payload,
            headers=admin_headers,
        )
        require(isinstance(refund_result, dict), f"Unexpected refund response: {refund_result}")
        refunded_invoice = refund_result.get("invoice") or {}
        require(
            str(refunded_invoice.get("status") or "") == "refunded",
            f"Refund endpoint did not return refunded invoice: {refund_result}",
        )

        print("[14/15] Verifying admin billing events after renew/refund")
        final_events = http_json(
            "GET",
            f"{base_url}/membership-premium/admin/events?limit=200",
            headers=admin_headers,
        )
        require(isinstance(final_events, list), f"Unexpected final events payload: {final_events}")

        renew_related = [
            item
            for item in final_events
            if isinstance(item, dict)
            and str(item.get("invoice_number") or "") == renew_invoice_number
        ]
        event_types = {str(item.get("event_type") or "") for item in renew_related}
        require("admin.subscription.renew" in event_types, "Missing admin.subscription.renew event.")
        require("admin.invoice.refund" in event_types, "Missing admin.invoice.refund event.")

    print("[15/15] Premium smoke test summary")
    summary = {
        "provider": provider,
        "plan_code": plan_code,
        "billing_cycle": args.billing_cycle,
        "checkout_reference": checkout_reference,
        "checkout_invoice_number": invoice_number,
        "webhook_result": webhook_result,
        "admin_refund_result": refund_result,
        "metrics_snapshot": {
            "total_subscriptions": metrics_payload.get("total_subscriptions"),
            "active_subscriptions": metrics_payload.get("active_subscriptions"),
            "pending_subscriptions": metrics_payload.get("pending_subscriptions"),
            "total_invoices": metrics_payload.get("total_invoices"),
            "paid_invoices": metrics_payload.get("paid_invoices"),
            "refunded_invoices": metrics_payload.get("refunded_invoices"),
        },
    }
    print(json.dumps(summary, indent=2))
    print("Premium smoke test completed successfully.")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"PREMIUM SMOKE TEST FAILED: {exc}")
        raise