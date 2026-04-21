from pathlib import Path
import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import inspect, text

from auth import hash_password, verify_password
from database import Base, SessionLocal, engine
from models import Member, MembershipEntitlement, MembershipPlan, User
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
    membership_premium,
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

DEFAULT_MEMBERSHIP_PLANS = [
    {
        "code": "STANDARD",
        "name": "Standard",
        "description": "Core membership portal access with profile, CPD history, and certificate download.",
        "monthly_price_cents": 0,
        "yearly_price_cents": 0,
        "currency": "INR",
        "sort_order": 1,
        "entitlements": [
            {"key": "profile.basic", "label": "Basic Member Profile", "is_enabled": True, "limit_value": None},
            {"key": "cpd.history", "label": "CPD History", "is_enabled": True, "limit_value": None},
            {"key": "certificate.download", "label": "Certificate Download", "is_enabled": True, "limit_value": None},
        ],
    },
    {
        "code": "PREMIUM_INDIVIDUAL",
        "name": "Premium Individual",
        "description": (
            "Starter premium pathway with advanced CPD analytics, priority event access, "
            "professional networking, and technical resource upgrades."
        ),
        "monthly_price_cents": 14900,
        "yearly_price_cents": 149000,
        "currency": "INR",
        "sort_order": 2,
        "entitlements": [
            {"key": "profile.basic", "label": "Basic Member Profile", "is_enabled": True, "limit_value": None},
            {"key": "cpd.history", "label": "CPD History", "is_enabled": True, "limit_value": None},
            {"key": "certificate.download", "label": "Certificate Download", "is_enabled": True, "limit_value": None},
            {"key": "cpd.analytics", "label": "Advanced CPD Analytics", "is_enabled": True, "limit_value": None},
            {"key": "events.priority", "label": "Priority Event Enrollment", "is_enabled": True, "limit_value": None},
            {"key": "resources.premium", "label": "Premium Resource Library", "is_enabled": True, "limit_value": None},
            {"key": "resources.iei_springer", "label": "IEI-Springer Journal Access", "is_enabled": True, "limit_value": None},
            {"key": "cpd.programs", "label": "Continuous Professional Development Programs", "is_enabled": True, "limit_value": None},
            {"key": "networking.enggtalks", "label": "ENGGtalks Networking Access", "is_enabled": True, "limit_value": None},
        ],
    },
    {
        "code": "PREMIUM_CHARTERED_PRO",
        "name": "Premium Chartered Professional",
        "description": (
            "High-value plan for Civil/Mechanical/Electrical engineers pursuing Chartered Engineer (CEng), "
            "Professional Engineer (PEng), consultancy practice, legal technical authority roles, "
            "and approval-driven project work."
        ),
        "monthly_price_cents": 29900,
        "yearly_price_cents": 299000,
        "currency": "INR",
        "sort_order": 3,
        "entitlements": [
            {"key": "profile.basic", "label": "Basic Member Profile", "is_enabled": True, "limit_value": None},
            {"key": "cpd.history", "label": "CPD History", "is_enabled": True, "limit_value": None},
            {"key": "certificate.download", "label": "Certificate Download", "is_enabled": True, "limit_value": None},
            {"key": "cpd.analytics", "label": "Advanced CPD Analytics", "is_enabled": True, "limit_value": None},
            {"key": "certification.ceng", "label": "Chartered Engineer (CEng) Pathway", "is_enabled": True, "limit_value": None},
            {"key": "certification.peng", "label": "Professional Engineer (PEng) Recognition Pathway", "is_enabled": True, "limit_value": None},
            {"key": "authority.design_certification", "label": "Authority for Drawings, Designs, and Technical Report Certification", "is_enabled": True, "limit_value": None},
            {"key": "authority.gov_bank_insurance", "label": "Support for Government, Bank, and Insurance Approval Workflows", "is_enabled": True, "limit_value": None},
            {"key": "practice.consultancy", "label": "Independent Consultancy and Valuation Practice Support", "is_enabled": True, "limit_value": None},
            {"key": "authority.arbitration", "label": "Engineering Arbitration Role Eligibility Support", "is_enabled": True, "limit_value": None},
            {"key": "authority.expert_opinion", "label": "Technical Expert Opinion Role Support", "is_enabled": True, "limit_value": None},
            {"key": "resources.iei_springer", "label": "IEI-Springer Journal Access", "is_enabled": True, "limit_value": None},
            {"key": "resources.premium", "label": "Premium Technical Publication and Report Access", "is_enabled": True, "limit_value": None},
            {"key": "resources.library_network", "label": "IEI Library Network Access", "is_enabled": True, "limit_value": None},
            {"key": "events.priority", "label": "Priority Event Enrollment", "is_enabled": True, "limit_value": None},
            {"key": "events.conference_discount", "label": "Conference and Workshop Discount", "is_enabled": True, "limit_value": 20},
            {"key": "cpd.programs", "label": "Continuous Professional Development Programs", "is_enabled": True, "limit_value": None},
            {"key": "networking.local_centres", "label": "Local Centre and National Chapter Networking", "is_enabled": True, "limit_value": None},
            {"key": "networking.enggtalks", "label": "ENGGtalks Networking Access", "is_enabled": True, "limit_value": None},
            {"key": "career.manager", "label": "Career Manager Portfolio and Skill Tracking", "is_enabled": True, "limit_value": None},
            {"key": "rnd.grants", "label": "R&D Grant and Project Support Eligibility", "is_enabled": True, "limit_value": None},
            {"key": "hospitality.guest_house", "label": "IEI Guest House Access at Concessional Rates", "is_enabled": True, "limit_value": None},
        ],
    },
    {
        "code": "PREMIUM_INSTITUTIONAL",
        "name": "Premium Institutional",
        "description": (
            "Institutional premium plan combining Chartered Professional benefits with consolidated billing, "
            "team CPD governance, and multi-seat capability."
        ),
        "monthly_price_cents": 49900,
        "yearly_price_cents": 499000,
        "currency": "INR",
        "sort_order": 4,
        "entitlements": [
            {"key": "profile.basic", "label": "Basic Member Profile", "is_enabled": True, "limit_value": None},
            {"key": "cpd.history", "label": "CPD History", "is_enabled": True, "limit_value": None},
            {"key": "certificate.download", "label": "Certificate Download", "is_enabled": True, "limit_value": None},
            {"key": "cpd.analytics", "label": "Advanced CPD Analytics", "is_enabled": True, "limit_value": None},
            {"key": "certification.ceng", "label": "Chartered Engineer (CEng) Pathway", "is_enabled": True, "limit_value": None},
            {"key": "certification.peng", "label": "Professional Engineer (PEng) Recognition Pathway", "is_enabled": True, "limit_value": None},
            {"key": "authority.design_certification", "label": "Authority for Drawings, Designs, and Technical Report Certification", "is_enabled": True, "limit_value": None},
            {"key": "authority.gov_bank_insurance", "label": "Support for Government, Bank, and Insurance Approval Workflows", "is_enabled": True, "limit_value": None},
            {"key": "practice.consultancy", "label": "Independent Consultancy and Valuation Practice Support", "is_enabled": True, "limit_value": None},
            {"key": "authority.arbitration", "label": "Engineering Arbitration Role Eligibility Support", "is_enabled": True, "limit_value": None},
            {"key": "authority.expert_opinion", "label": "Technical Expert Opinion Role Support", "is_enabled": True, "limit_value": None},
            {"key": "events.priority", "label": "Priority Event Enrollment", "is_enabled": True, "limit_value": None},
            {"key": "events.conference_discount", "label": "Conference and Workshop Discount", "is_enabled": True, "limit_value": 20},
            {"key": "resources.premium", "label": "Premium Resource Library", "is_enabled": True, "limit_value": None},
            {"key": "resources.iei_springer", "label": "IEI-Springer Journal Access", "is_enabled": True, "limit_value": None},
            {"key": "resources.library_network", "label": "IEI Library Network Access", "is_enabled": True, "limit_value": None},
            {"key": "cpd.programs", "label": "Continuous Professional Development Programs", "is_enabled": True, "limit_value": None},
            {"key": "networking.local_centres", "label": "Local Centre and National Chapter Networking", "is_enabled": True, "limit_value": None},
            {"key": "networking.enggtalks", "label": "ENGGtalks Networking Access", "is_enabled": True, "limit_value": None},
            {"key": "career.manager", "label": "Career Manager Portfolio and Skill Tracking", "is_enabled": True, "limit_value": None},
            {"key": "rnd.grants", "label": "R&D Grant and Project Support Eligibility", "is_enabled": True, "limit_value": None},
            {"key": "hospitality.guest_house", "label": "IEI Guest House Access at Concessional Rates", "is_enabled": True, "limit_value": None},
            {"key": "billing.team", "label": "Consolidated Team Billing", "is_enabled": True, "limit_value": None},
            {"key": "team.seats", "label": "Team Seat Allocation", "is_enabled": True, "limit_value": 30},
        ],
    },
]


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
    if "failed_login_attempts" not in existing_columns:
        add_column_statements.append(
            "ALTER TABLE members ADD COLUMN failed_login_attempts INTEGER NOT NULL DEFAULT 0"
        )
    if "locked_until" not in existing_columns:
        add_column_statements.append(
            "ALTER TABLE members ADD COLUMN locked_until DATETIME"
        )
    if "last_login_at" not in existing_columns:
        add_column_statements.append(
            "ALTER TABLE members ADD COLUMN last_login_at DATETIME"
        )
    if "refresh_token_hash" not in existing_columns:
        add_column_statements.append(
            "ALTER TABLE members ADD COLUMN refresh_token_hash VARCHAR(255) NOT NULL DEFAULT ''"
        )
    if "refresh_token_expires_at" not in existing_columns:
        add_column_statements.append(
            "ALTER TABLE members ADD COLUMN refresh_token_expires_at DATETIME"
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
        connection.execute(text("UPDATE members SET failed_login_attempts = 0 WHERE failed_login_attempts IS NULL"))
        connection.execute(text("UPDATE members SET refresh_token_hash = '' WHERE refresh_token_hash IS NULL"))
        connection.execute(text("UPDATE members SET membership_type = '' WHERE membership_type IS NULL"))
        connection.execute(text("UPDATE members SET interest_area = '' WHERE interest_area IS NULL"))
        connection.execute(text("UPDATE members SET membership_id = '' WHERE membership_id IS NULL"))
        connection.execute(text("UPDATE members SET image = '' WHERE image IS NULL"))


migrate_members_table()


def migrate_membership_requests_table() -> None:
    inspector = inspect(engine)
    if "membership_requests" not in inspector.get_table_names():
        return

    existing_columns = {column["name"] for column in inspector.get_columns("membership_requests")}

    add_column_statements: list[str] = []
    if "mobile" not in existing_columns:
        add_column_statements.append(
            "ALTER TABLE membership_requests ADD COLUMN mobile VARCHAR(30) NOT NULL DEFAULT ''"
        )
    if "existing_member" not in existing_columns:
        add_column_statements.append(
            "ALTER TABLE membership_requests ADD COLUMN existing_member BOOLEAN NOT NULL DEFAULT 0"
        )
    if "membership_no" not in existing_columns:
        add_column_statements.append(
            "ALTER TABLE membership_requests ADD COLUMN membership_no VARCHAR(80) NOT NULL DEFAULT ''"
        )
    if "membership_type" not in existing_columns:
        add_column_statements.append(
            "ALTER TABLE membership_requests ADD COLUMN membership_type VARCHAR(20) NOT NULL DEFAULT ''"
        )
    if "interest_area" not in existing_columns:
        add_column_statements.append(
            "ALTER TABLE membership_requests ADD COLUMN interest_area VARCHAR(180) NOT NULL DEFAULT ''"
        )
    if "password_hash" not in existing_columns:
        add_column_statements.append(
            "ALTER TABLE membership_requests ADD COLUMN password_hash VARCHAR(255) NOT NULL DEFAULT ''"
        )
    if "review_notes" not in existing_columns:
        add_column_statements.append(
            "ALTER TABLE membership_requests ADD COLUMN review_notes TEXT NOT NULL DEFAULT ''"
        )
    if "linked_member_id" not in existing_columns:
        add_column_statements.append(
            "ALTER TABLE membership_requests ADD COLUMN linked_member_id INTEGER"
        )
    if "approved_by" not in existing_columns:
        add_column_statements.append(
            "ALTER TABLE membership_requests ADD COLUMN approved_by VARCHAR(50) NOT NULL DEFAULT ''"
        )
    if "approved_at" not in existing_columns:
        add_column_statements.append(
            "ALTER TABLE membership_requests ADD COLUMN approved_at DATETIME"
        )

    with engine.begin() as connection:
        for statement in add_column_statements:
            connection.execute(text(statement))

        connection.execute(text("UPDATE membership_requests SET phone = '' WHERE phone IS NULL"))
        connection.execute(text("UPDATE membership_requests SET mobile = '' WHERE mobile IS NULL"))
        connection.execute(
            text(
                """
                UPDATE membership_requests
                SET mobile = CASE
                    WHEN TRIM(COALESCE(mobile, '')) = '' THEN COALESCE(NULLIF(TRIM(phone), ''), '')
                    ELSE mobile
                END
                """
            )
        )
        connection.execute(text("UPDATE membership_requests SET existing_member = 0 WHERE existing_member IS NULL"))
        connection.execute(text("UPDATE membership_requests SET membership_no = '' WHERE membership_no IS NULL"))
        connection.execute(text("UPDATE membership_requests SET membership_type = '' WHERE membership_type IS NULL"))
        connection.execute(
            text(
                """
                UPDATE membership_requests
                SET interest_area = CASE
                    WHEN TRIM(COALESCE(interest_area, '')) = '' THEN COALESCE(NULLIF(TRIM(organization), ''), '')
                    ELSE interest_area
                END
                """
            )
        )
        connection.execute(text("UPDATE membership_requests SET password_hash = '' WHERE password_hash IS NULL"))
        connection.execute(text("UPDATE membership_requests SET review_notes = '' WHERE review_notes IS NULL"))
        connection.execute(text("UPDATE membership_requests SET approved_by = '' WHERE approved_by IS NULL"))
        connection.execute(text("UPDATE membership_requests SET status = 'new' WHERE status IS NULL"))


migrate_membership_requests_table()


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
            return

        password_matches = False
        try:
            password_matches = verify_password(admin_password, admin_user.hashed_password)
        except Exception:
            password_matches = False

        if not password_matches:
            admin_user.hashed_password = hash_password(admin_password)
            admin_user.is_active = True
            db.commit()
    finally:
        db.close()


def _env_flag(name: str, default: str = "true") -> bool:
    value = (os.getenv(name, default) or "").strip().lower()
    return value in {"1", "true", "yes", "on"}


def seed_members_from_program_data() -> None:
    if not _env_flag("AUTO_SEED_MEMBERS", "true"):
        return

    ordered_records: list[dict[str, str]] = []
    seen_names: set[str] = set()

    for office in PROGRAM_OFFICE_BEARERS:
        member_name = office["name"]
        if member_name in seen_names:
            continue
        seen_names.add(member_name)
        ordered_records.append(
            {
                "name": member_name,
                "position": office["role"],
            }
        )

    for division in PROGRAM_DIVISIONS:
        division_label = division["division"]
        for member_name in division["members"]:
            if member_name in seen_names:
                continue
            seen_names.add(member_name)
            ordered_records.append(
                {
                    "name": member_name,
                    "position": f"{division_label} Committee Member",
                }
            )

    db = SessionLocal()
    try:
        existing_names = {name for (name,) in db.query(Member.name).all()}
        if len(existing_names) >= len(ordered_records):
            return

        seed_address = "IEI Kanyakumari Local Centre"
        members_to_insert: list[Member] = []

        for index, record in enumerate(ordered_records, start=1):
            member_name = record["name"]
            if member_name in existing_names:
                continue

            membership_code = f"IEI-KKLC-{index:03d}"
            position = record["position"]

            members_to_insert.append(
                Member(
                    name=member_name,
                    designation=position,
                    organization=seed_address,
                    bio=membership_code,
                    position=position,
                    membership_id=membership_code,
                    address=seed_address,
                    email="",
                    mobile="",
                    password_hash="",
                    membership_type="",
                    interest_area="",
                    legacy_image_url="",
                    image="",
                )
            )

        if members_to_insert:
            db.add_all(members_to_insert)
            db.commit()
    finally:
        db.close()


def seed_membership_plans() -> None:
    if not _env_flag("AUTO_SEED_MEMBERSHIP_PLANS", "true"):
        return

    db = SessionLocal()
    try:
        existing_plans = {
            plan.code.upper(): plan
            for plan in db.query(MembershipPlan).all()
        }
        changed = False

        for item in DEFAULT_MEMBERSHIP_PLANS:
            code = item["code"].upper()
            plan = existing_plans.get(code)

            if not plan:
                plan = MembershipPlan(
                    code=code,
                    name=item["name"],
                    description=item["description"],
                    monthly_price_cents=item["monthly_price_cents"],
                    yearly_price_cents=item["yearly_price_cents"],
                    currency=item["currency"],
                    is_active=True,
                    sort_order=item["sort_order"],
                )
                db.add(plan)
                db.flush()
                existing_plans[code] = plan
                changed = True
            else:
                plan.name = item["name"]
                plan.description = item["description"]
                plan.monthly_price_cents = item["monthly_price_cents"]
                plan.yearly_price_cents = item["yearly_price_cents"]
                plan.currency = item["currency"]
                plan.sort_order = item["sort_order"]
                plan.is_active = True

            entitlement_rows = {
                row.key: row
                for row in db.query(MembershipEntitlement)
                .filter(MembershipEntitlement.plan_id == plan.id)
                .all()
            }

            for entitlement in item["entitlements"]:
                key = entitlement["key"]
                row = entitlement_rows.get(key)
                if not row:
                    db.add(
                        MembershipEntitlement(
                            plan_id=plan.id,
                            key=key,
                            label=entitlement["label"],
                            is_enabled=bool(entitlement["is_enabled"]),
                            limit_value=entitlement["limit_value"],
                        )
                    )
                    changed = True
                else:
                    row.label = entitlement["label"]
                    row.is_enabled = bool(entitlement["is_enabled"])
                    row.limit_value = entitlement["limit_value"]

        if changed:
            db.commit()
    finally:
        db.close()


seed_admin_user()
seed_members_from_program_data()
seed_membership_plans()

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
app.include_router(membership_premium.router, prefix="/api")


@app.get("/api/health")
def health_check() -> dict:
    return {"status": "ok"}
