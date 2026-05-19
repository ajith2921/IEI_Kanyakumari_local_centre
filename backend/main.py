from pathlib import Path
import os

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
    auth,
    contact,
    downloads,
    facilities,
    gallery,
    image_audit,
    members,
    newsletters,
    conferences,
)

app = FastAPI(title="Institution Website API", version="1.0.0")

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

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
            "username": username,
            "hashed_password": hash_password(password),
            "is_active": True,
        }
        existing_user = admin_db.select_one("users", {"username": username})

        if existing_user:
            admin_db.update("users", user_data, {"username": username})
        else:
            admin_db.insert("users", user_data)
    except Exception as exc:
        print(f"Warning: could not seed admin user: {exc}")


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
