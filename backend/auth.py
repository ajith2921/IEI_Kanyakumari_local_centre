from __future__ import annotations

from datetime import datetime, timedelta, timezone
import os
from time import monotonic
from typing import Optional

from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext

from supabase_db import admin_db

# Load .env file - explicit path to handle imports from different directories
from pathlib import Path
_env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=_env_path)

SECRET_KEY = os.getenv("SECRET_KEY", "change-me")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "120"))

if not SECRET_KEY or SECRET_KEY == "change-me":
    raise RuntimeError("SECRET_KEY must be set in environment for secure token signing.")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# ── Simple in-process user cache (TTL = 60 s) ─────────────────────────────
_USER_CACHE_TTL = 60.0  # seconds
_user_cache: dict[str, tuple[dict, float]] = {}


def _get_cached_user(username: str) -> Optional[dict]:
    entry = _user_cache.get(username)
    if entry and monotonic() - entry[1] < _USER_CACHE_TTL:
        return entry[0]
    _user_cache.pop(username, None)
    return None


def _set_cached_user(username: str, user: dict) -> None:
    _user_cache[username] = (user, monotonic())


def invalidate_user_cache(username: str) -> None:
    """Call this whenever an admin_users record is updated."""
    _user_cache.pop(username, None)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def _lookup_user(username: str) -> Optional[dict]:
    """
    Look up admin in admin_users table first, fall back to legacy users table.
    Returns a normalised dict with 'id', 'username', 'password_hash',
    'hashed_password' (alias), 'is_active', 'role', 'name'.
    """
    # Try admin_users first (enterprise system)
    try:
        user = admin_db.select_one("admin_users", {"username": username})
        if user:
            # Normalise for backward compatibility
            user.setdefault("hashed_password", user.get("password_hash", ""))
            user.setdefault("is_active", user.get("status", "active") == "active")
            user.setdefault("role", "ADMIN")
            return user
    except Exception:
        pass

    # Fall back to legacy users table
    try:
        user = admin_db.select_one("users", {"username": username})
        if user:
            user.setdefault("role", "SUPER_ADMIN")  # Legacy single admin = super
            user.setdefault("name", username)
            return user
    except Exception:
        pass

    return None


def get_current_user(
    request: Request,
) -> dict:
    token = request.cookies.get("admin_token")
    if not token:
        # Fallback to auth header
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not token:
        raise credentials_exception

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: Optional[str] = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError as exc:
        raise credentials_exception from exc

    # Check cache before hitting DB
    user = _get_cached_user(username)
    if user is None:
        user = _lookup_user(username)
        if user is None:
            raise credentials_exception
        _set_cached_user(username, user)
    return user


def get_current_active_user(current_user: dict = Depends(get_current_user)) -> dict:
    is_active = current_user.get("is_active", False)
    if isinstance(is_active, bool):
        active = is_active
    else:
        active = str(is_active).lower() in ("true", "1", "yes")

    # Also check status field (admin_users table)
    status_val = current_user.get("status", "active")
    if status_val != "active":
        active = False

    if not active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


def get_current_super_admin(current_user: dict = Depends(get_current_active_user)) -> dict:
    """Dependency that only allows SUPER_ADMIN role."""
    role = current_user.get("role", "")
    if role != "SUPER_ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. SUPER_ADMIN role required.",
        )
    return current_user
