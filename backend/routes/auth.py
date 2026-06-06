import os
from fastapi import APIRouter, HTTPException, status, Response, Depends, Request

from auth import (
    create_access_token,
    verify_password,
    get_current_active_user,
    _lookup_user,
    invalidate_user_cache,
)
from supabase_db import admin_db
from schemas import LoginRequest, TokenResponse
from limiter import limiter
from audit import log_login, log_logout

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login", response_model=TokenResponse)
@limiter.limit("5/minute")
def login(request: Request, payload: LoginRequest, response: Response) -> TokenResponse:
    user = _lookup_user(payload.username)

    if not user or not verify_password(payload.password, user.get("hashed_password", "") or user.get("password_hash", "")):
        # Log failed attempt
        log_login(
            request=request,
            admin_id=user.get("id") if user else None,
            admin_name=payload.username,
            status="failed",
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    # Check account is active
    is_active = user.get("is_active", True)
    acct_status = user.get("status", "active")
    if not is_active or acct_status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive or suspended.",
        )

    # Update last_login in admin_users (best effort)
    try:
        from datetime import datetime, timezone
        if "admin_users" in str(type(user)):
            pass
        admin_db.update(
            "admin_users",
            {"last_login": datetime.now(timezone.utc).isoformat()},
            {"username": user["username"]},
        )
    except Exception:
        pass

    # Log successful login — store login_log_id in cookie for logout tracking
    login_log_id = log_login(
        request=request,
        admin_id=user.get("id"),
        admin_name=user.get("name") or user.get("username", ""),
        status="success",
    )

    token = create_access_token(data={"sub": user["username"]})

    is_prod = os.getenv("ENVIRONMENT", "development").lower() == "production"

    response.set_cookie(
        key="admin_token",
        value=token,
        httponly=True,
        samesite="lax",
        secure=is_prod,
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60 if (ACCESS_TOKEN_EXPIRE_MINUTES := int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "120"))) else 7200,
    )

    # Store login_log_id in a secondary cookie for logout tracking
    if login_log_id:
        response.set_cookie(
            key="admin_login_log_id",
            value=str(login_log_id),
            httponly=True,
            samesite="lax",
            secure=is_prod,
            max_age=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "120")) * 60,
        )

    return TokenResponse(access_token=token)


@router.post("/logout")
def logout(request: Request, response: Response):
    """Clear the admin_token cookie and record logout time."""
    # Update login log with logout time
    login_log_id_str = request.cookies.get("admin_login_log_id")
    if login_log_id_str:
        try:
            log_logout(login_log_id=int(login_log_id_str))
        except (ValueError, Exception):
            pass

    response.delete_cookie("admin_token")
    response.delete_cookie("admin_login_log_id")
    return {"message": "Logged out successfully"}


@router.get("/me")
def get_me(current_user: dict = Depends(get_current_active_user)):
    """Verify session is valid and return user info including role."""
    return {
        "id": current_user.get("id"),
        "username": current_user.get("username", ""),
        "name": current_user.get("name") or current_user.get("username", ""),
        "email": current_user.get("email", ""),
        "role": current_user.get("role", "ADMIN"),
    }
