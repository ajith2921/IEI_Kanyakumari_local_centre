from pathlib import Path
import os
from time import time

from dotenv import load_dotenv

# Load environment variables before importing modules that depend on them
# Load from backend/.env file (handle both running from backend/ and parent directory)
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from auth import hash_password
from supabase_db import admin_db

from routes import (
    activities,
    admin_users,
    audit_logs,
    auth,
    conferences,
    contact,
    downloads,
    facilities,
    gallery,
    image_audit,
    login_logs,
    members,
    newsletters,
)

# ─────────────────────────────────────────────────────────────────
# Simple in-memory cache for database queries
# ─────────────────────────────────────────────────────────────────
_query_cache = {}
CACHE_TTL = 300  # 5 minutes

def cache_key(name: str) -> str:
    return f"cache:{name}"

def get_from_cache(name: str):
    """Get cached value if still valid"""
    key = cache_key(name)
    if key in _query_cache:
        value, expiry = _query_cache[key]
        if time() < expiry:
            return value
        del _query_cache[key]
    return None

def set_in_cache(name: str, value):
    """Cache a value for CACHE_TTL seconds"""
    _query_cache[cache_key(name)] = (value, time() + CACHE_TTL)

def invalidate_cache(name: str):
    """Invalidate a cache entry"""
    key = cache_key(name)
    if key in _query_cache:
        del _query_cache[key]

from limiter import limiter
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler

app = FastAPI(title="Institution Website API", version="1.0.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
origins = [
    origin.strip()
    for origin in os.getenv("FRONTEND_ORIGINS", "http://localhost:5173").split(",")
    if origin.strip()
]

# Keep both loopback variants available in development to avoid CORS friction
# when frontend runs on 127.0.0.1 but backend env only lists localhost (or vice versa).
loopback_aliases = {
    "http://localhost:5173": "http://127.0.0.1:5173",
    "http://127.0.0.1:5173": "http://localhost:5173",
}
for origin in list(origins):
    alias = loopback_aliases.get(origin)
    if alias and alias not in origins:
        origins.append(alias)

# Security Headers Middleware
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        # CSP: Default restrictive, allows React/Vite dev server and Supabase
        csp = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' data: https://fonts.gstatic.com; "
            "img-src 'self' data: blob: https://*.supabase.co; "
            "connect-src 'self' https://*.supabase.co ws://localhost:5173 wss://localhost:5173; "
            "frame-ancestors 'none';"
        )
        response.headers["Content-Security-Policy"] = csp
        return response

app.add_middleware(SecurityHeadersMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
)

PROGRAM_OFFICE_BEARERS = [
    {"role": "Chairman", "name": "Dr. M. Marsaline Beno"},
    {"role": "Honorary Secretary", "name": "Dr. J. Prakash Arul Jose"},
    {"role": "Honorary Joint Secretary", "name": "Dr. A. Megalingam"},
    {"role": "Immediate Past Chairman", "name": "Er. S. Bright Selvin"},
]

PROGRAM_DIVISIONS = [
    {
        "division": "Civil Engineering Division",
        "members": [
            "Dr. J. Prakash Arul Jose",
            "Er. S. Natarajan",
            "Er. A. Rajakumar",
            "Er. K. Sivakumar",
            "Er. P. Gopal",
        ],
    },
    {
        "division": "Electrical Engineering Division",
        "members": [
            "Dr. M. Marsaline Beno",
            "Er. V. Muthum Perumal",
            "Dr. T. Sree Renga Raja",
            "Er. V. Sivathanu Pillai",
        ],
    },
    {
        "division": "Mechanical Engineering Division",
        "members": [
            "Dr. A. Megalingam",
            "Er. M.A. Perumal",
            "Dr. Jenix Rino J",
        ],
    },
    {
        "division": "Computer / IT Division",
        "members": ["Dr. S. Arumuga Perumal"],
    },
    {
        "division": "Electronics & Communication Division",
        "members": ["Dr. A. Albert Raj"],
    },
    {
        "division": "Chemical Engineering Division",
        "members": ["Dr. Rimal Isaac R.S."],
    },
    {
        "division": "Environmental Engineering Division",
        "members": ["Er. Ganesh Kumar", "Dr. V. Karthikeyan"],
    },
    {
        "division": "Applied Science / Management",
        "members": ["Dr. N. Azhagesan"],
    },
]


def seed_admin_user() -> None:
    username = (os.getenv("ADMIN_USERNAME", "") or "").strip()
    password = (os.getenv("ADMIN_PASSWORD", "") or "").strip()

    if not username or not password:
        return

    try:
        user_data = {
            "name": username,
            "username": username,
            "email": f"{username}@iei.local",
            "password_hash": hash_password(password),
            "role": "SUPER_ADMIN",
            "status": "active",
        }
        existing_user = admin_db.select_one("admin_users", {"username": username})

        if existing_user:
            admin_db.update("admin_users", user_data, {"username": username})
        else:
            admin_db.insert("admin_users", user_data)
    except Exception as exc:
        print(f"Warning: could not seed admin user into admin_users: {exc}")
        # Fallback to legacy
        try:
            legacy_data = {
                "username": username,
                "hashed_password": hash_password(password),
                "is_active": True,
            }
            if admin_db.select_one("users", {"username": username}):
                admin_db.update("users", legacy_data, {"username": username})
            else:
                admin_db.insert("users", legacy_data)
        except Exception as e2:
            pass


def _env_flag(name: str, default: str = "true") -> bool:
    value = (os.getenv(name, default) or "").strip().lower()
    return value in {"1", "true", "yes", "on"}


def seed_members_from_program_data() -> None:
    pass  # Seeding is now handled in Supabase


def seed_conference_data() -> None:
    pass  # Seeding is now handled in Supabase


@app.on_event("startup")
def on_startup() -> None:
    seed_admin_user()


upload_dir = Path(__file__).resolve().parent / "uploads"
upload_dir.mkdir(parents=True, exist_ok=True)

# Mount static files for uploads (backward compatibility and potential local uploads)
app.mount("/uploads", StaticFiles(directory=str(upload_dir)), name="uploads")

app.include_router(auth.router, prefix="/api")
app.include_router(admin_users.router, prefix="/api")
app.include_router(audit_logs.router, prefix="/api")
app.include_router(login_logs.router, prefix="/api")
app.include_router(members.router, prefix="/api")
app.include_router(gallery.router, prefix="/api")
app.include_router(image_audit.router, prefix="/api")
app.include_router(newsletters.router, prefix="/api")
app.include_router(activities.router, prefix="/api")
app.include_router(facilities.router, prefix="/api")
app.include_router(downloads.router, prefix="/api")
app.include_router(contact.router, prefix="/api")
app.include_router(conferences.router, prefix="/api")


@app.get("/api/health")
def health_check() -> dict:
    return {"status": "ok"}
