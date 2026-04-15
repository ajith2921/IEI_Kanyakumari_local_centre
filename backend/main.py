from pathlib import Path
import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import inspect, text

from auth import hash_password
from database import Base, SessionLocal, engine
from models import User
from routes import (
    activities,
    auth,
    contact,
    downloads,
    facilities,
    gallery,
    image_audit,
    members,
    membership,
    membership_portal,
    newsletters,
)

load_dotenv()

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

Base.metadata.create_all(bind=engine)


def migrate_members_table() -> None:
    inspector = inspect(engine)
    if "members" not in inspector.get_table_names():
        return

    existing_columns = {column["name"] for column in inspector.get_columns("members")}

    add_column_statements: list[str] = []
    if "position" not in existing_columns:
        add_column_statements.append(
            "ALTER TABLE members ADD COLUMN position VARCHAR(120) NOT NULL DEFAULT ''"
        )
    if "membership_id" not in existing_columns:
        add_column_statements.append(
            "ALTER TABLE members ADD COLUMN membership_id VARCHAR(80) NOT NULL DEFAULT ''"
        )
    if "address" not in existing_columns:
        add_column_statements.append(
            "ALTER TABLE members ADD COLUMN address TEXT NOT NULL DEFAULT ''"
        )
    if "email" not in existing_columns:
        add_column_statements.append(
            "ALTER TABLE members ADD COLUMN email VARCHAR(120) NOT NULL DEFAULT ''"
        )
    if "mobile" not in existing_columns:
        add_column_statements.append(
            "ALTER TABLE members ADD COLUMN mobile VARCHAR(30) NOT NULL DEFAULT ''"
        )
    if "password_hash" not in existing_columns:
        add_column_statements.append(
            "ALTER TABLE members ADD COLUMN password_hash VARCHAR(255) NOT NULL DEFAULT ''"
        )
    if "membership_type" not in existing_columns:
        add_column_statements.append(
            "ALTER TABLE members ADD COLUMN membership_type VARCHAR(20) NOT NULL DEFAULT ''"
        )
    if "interest_area" not in existing_columns:
        add_column_statements.append(
            "ALTER TABLE members ADD COLUMN interest_area VARCHAR(180) NOT NULL DEFAULT ''"
        )
    if "image" not in existing_columns:
        add_column_statements.append(
            "ALTER TABLE members ADD COLUMN image VARCHAR(255) NOT NULL DEFAULT ''"
        )

    with engine.begin() as connection:
        for statement in add_column_statements:
            connection.execute(text(statement))

        if "designation" in existing_columns:
            connection.execute(
                text(
                    """
                    UPDATE members
                    SET position = CASE
                        WHEN TRIM(COALESCE(position, '')) = '' THEN COALESCE(NULLIF(TRIM(designation), ''), 'Member')
                        ELSE position
                    END
                    """
                )
            )

        if "organization" in existing_columns:
            connection.execute(
                text(
                    """
                    UPDATE members
                    SET address = CASE
                        WHEN TRIM(COALESCE(address, '')) = '' THEN COALESCE(NULLIF(TRIM(organization), ''), '')
                        ELSE address
                    END
                    """
                )
            )

        if "image_url" in existing_columns:
            connection.execute(
                text(
                    """
                    UPDATE members
                    SET image = CASE
                        WHEN TRIM(COALESCE(image, '')) = '' THEN COALESCE(NULLIF(TRIM(image_url), ''), '')
                        ELSE image
                    END
                    """
                )
            )

        connection.execute(text("UPDATE members SET position = 'Member' WHERE TRIM(COALESCE(position, '')) = ''"))
        connection.execute(text("UPDATE members SET address = '' WHERE address IS NULL"))
        connection.execute(text("UPDATE members SET email = '' WHERE email IS NULL"))
        connection.execute(text("UPDATE members SET mobile = '' WHERE mobile IS NULL"))
        connection.execute(text("UPDATE members SET password_hash = '' WHERE password_hash IS NULL"))
        connection.execute(text("UPDATE members SET membership_type = '' WHERE membership_type IS NULL"))
        connection.execute(text("UPDATE members SET interest_area = '' WHERE interest_area IS NULL"))
        connection.execute(text("UPDATE members SET membership_id = '' WHERE membership_id IS NULL"))
        connection.execute(text("UPDATE members SET image = '' WHERE image IS NULL"))


migrate_members_table()


def seed_admin_user() -> None:
    db = SessionLocal()
    try:
        admin_username = (os.getenv("ADMIN_USERNAME") or "").strip()
        admin_password = (os.getenv("ADMIN_PASSWORD") or "").strip()

        # Do not auto-create a default weak admin in production-like environments.
        if not admin_username or not admin_password:
            return

        admin_user = db.query(User).filter(User.username == admin_username).first()
        if not admin_user:
            db.add(
                User(
                    username=admin_username,
                    hashed_password=hash_password(admin_password),
                    is_active=True,
                )
            )
            db.commit()
    finally:
        db.close()


seed_admin_user()

upload_dir = Path(__file__).resolve().parent / "uploads"
upload_dir.mkdir(parents=True, exist_ok=True)

app.mount("/uploads", StaticFiles(directory=upload_dir), name="uploads")

app.include_router(auth.router, prefix="/api")
app.include_router(members.router, prefix="/api")
app.include_router(gallery.router, prefix="/api")
app.include_router(image_audit.router, prefix="/api")
app.include_router(newsletters.router, prefix="/api")
app.include_router(activities.router, prefix="/api")
app.include_router(facilities.router, prefix="/api")
app.include_router(downloads.router, prefix="/api")
app.include_router(contact.router, prefix="/api")
app.include_router(membership.router, prefix="/api")
app.include_router(membership_portal.router, prefix="/api")


@app.get("/api/health")
def health_check() -> dict:
    return {"status": "ok"}
