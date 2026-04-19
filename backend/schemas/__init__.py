from datetime import datetime
import re
from typing import Dict, Optional, Union

from pydantic import BaseModel, ConfigDict, EmailStr, field_validator

PHONE_PATTERN = re.compile(r"^[+]?[0-9\s()\-]{7,18}$")
MEMBERSHIP_STATUSES = {"new", "reviewed", "approved", "rejected"}
MEMBERSHIP_TYPES = {"AMIE", "MIE", "FIE"}
STRONG_PASSWORD_PATTERN = re.compile(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,64}$")


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class MemberBase(BaseModel):
    name: str
    position: str
    membership_id: str = ""
    address: str
    email: str
    mobile: str
    image_url: str = ""


class MemberCreate(MemberBase):
    pass


class MemberUpdate(MemberBase):
    pass


class MemberOut(MemberBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class GalleryOut(BaseModel):
    id: int
    title: str
    description: str
    image_url: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class NewsletterBase(BaseModel):
    title: str
    summary: str = ""


class NewsletterCreate(NewsletterBase):
    pass


class NewsletterUpdate(NewsletterBase):
    pdf_url: str = ""


class NewsletterOut(BaseModel):
    id: int
    title: str
    summary: str
    pdf_url: str
    published_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ActivityBase(BaseModel):
    title: str
    description: str = ""
    event_date: str = ""
    image_url: str = ""


class ActivityCreate(ActivityBase):
    pass


class ActivityUpdate(ActivityBase):
    pass


class ActivityOut(ActivityBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FacilityBase(BaseModel):
    name: str
    description: str = ""
    image_url: str = ""


class FacilityCreate(FacilityBase):
    pass


class FacilityUpdate(FacilityBase):
    pass


class FacilityOut(FacilityBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DownloadOut(BaseModel):
    id: int
    title: str
    description: str
    pdf_url: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ContactCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str = ""
    message: str

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        cleaned = value.strip()
        if len(cleaned) < 2:
            raise ValueError("Name must be at least 2 characters long.")
        return cleaned

    @field_validator("message")
    @classmethod
    def validate_message(cls, value: str) -> str:
        cleaned = value.strip()
        if len(cleaned) < 10:
            raise ValueError("Message must be at least 10 characters long.")
        return cleaned

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: str) -> str:
        cleaned = value.strip()
        if cleaned and not PHONE_PATTERN.fullmatch(cleaned):
            raise ValueError("Invalid phone number format.")
        return cleaned


class ContactOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone: str
    message: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MembershipCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str = ""
    mobile: str = ""
    organization: str = ""
    message: str = ""
    existing_member: bool = False
    membership_no: str = ""
    membership_type: str = ""
    interest_area: str = ""

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        cleaned = value.strip()
        if len(cleaned) < 2:
            raise ValueError("Name must be at least 2 characters long.")
        return cleaned

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: str) -> str:
        cleaned = value.strip()
        if cleaned and not PHONE_PATTERN.fullmatch(cleaned):
            raise ValueError("Invalid phone number format.")
        return cleaned

    @field_validator("mobile")
    @classmethod
    def validate_mobile(cls, value: str) -> str:
        cleaned = value.strip()
        if cleaned and not PHONE_PATTERN.fullmatch(cleaned):
            raise ValueError("Invalid mobile number format.")
        return cleaned

    @field_validator("organization")
    @classmethod
    def validate_organization(cls, value: str) -> str:
        return value.strip()

    @field_validator("membership_no")
    @classmethod
    def validate_membership_no(cls, value: str) -> str:
        return value.strip()

    @field_validator("membership_type")
    @classmethod
    def validate_membership_type(cls, value: str) -> str:
        normalized = value.strip().upper()
        if normalized and normalized not in MEMBERSHIP_TYPES:
            allowed = ", ".join(sorted(MEMBERSHIP_TYPES))
            raise ValueError(f"Membership type must be one of: {allowed}.")
        return normalized

    @field_validator("interest_area")
    @classmethod
    def validate_interest_area(cls, value: str) -> str:
        return value.strip()

    @field_validator("message")
    @classmethod
    def validate_message(cls, value: str) -> str:
        cleaned = value.strip()
        if cleaned and len(cleaned) < 10:
            raise ValueError("Message must be at least 10 characters long if provided.")
        return cleaned


class MembershipStatusUpdate(BaseModel):
    status: str
    review_notes: str = ""

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        normalized = value.strip().lower()
        if normalized not in MEMBERSHIP_STATUSES:
            allowed = ", ".join(sorted(MEMBERSHIP_STATUSES))
            raise ValueError(f"Status must be one of: {allowed}.")
        return normalized

    @field_validator("review_notes")
    @classmethod
    def validate_review_notes(cls, value: str) -> str:
        cleaned = value.strip()
        if len(cleaned) > 2000:
            raise ValueError("Review notes must be 2000 characters or fewer.")
        return cleaned


class MembershipOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone: str
    mobile: str
    organization: str
    message: str
    existing_member: bool
    membership_no: str
    membership_type: str
    interest_area: str
    review_notes: str
    linked_member_id: Optional[int]
    approved_by: str
    approved_at: Optional[datetime]
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MembershipPortalRegister(BaseModel):
    existing_member: bool = False
    membership_no: str = ""
    name: str
    email: EmailStr
    mobile: str
    password: str
    confirm_password: str
    membership_type: str
    interest_area: str

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        cleaned = value.strip()
        if len(cleaned) < 2:
            raise ValueError("Name must be at least 2 characters long.")
        return cleaned

    @field_validator("mobile")
    @classmethod
    def validate_mobile(cls, value: str) -> str:
        cleaned = value.strip()
        if not PHONE_PATTERN.fullmatch(cleaned):
            raise ValueError("Invalid mobile number format.")
        return cleaned

    @field_validator("membership_no")
    @classmethod
    def validate_membership_no(cls, value: str) -> str:
        return value.strip()

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, value: str) -> str:
        if not STRONG_PASSWORD_PATTERN.fullmatch(value):
            raise ValueError(
                "Password must be 8-64 chars and include uppercase, lowercase, number, and special character."
            )
        return value

    @field_validator("membership_type")
    @classmethod
    def validate_membership_type(cls, value: str) -> str:
        normalized = value.strip().upper()
        if normalized not in MEMBERSHIP_TYPES:
            allowed = ", ".join(sorted(MEMBERSHIP_TYPES))
            raise ValueError(f"Membership type must be one of: {allowed}.")
        return normalized

    @field_validator("interest_area")
    @classmethod
    def validate_interest_area(cls, value: str) -> str:
        cleaned = value.strip()
        if len(cleaned) < 2:
            raise ValueError("Interest area must be at least 2 characters long.")
        return cleaned


class MembershipPortalLogin(BaseModel):
    identifier: str
    password: str

    @field_validator("identifier")
    @classmethod
    def validate_identifier(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Membership number, email, or mobile is required.")
        return cleaned

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        if not value:
            raise ValueError("Password is required.")
        return value


class MembershipPortalForgotPassword(BaseModel):
    identifier: str

    @field_validator("identifier")
    @classmethod
    def validate_identifier(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Email or mobile is required.")
        return cleaned


class MembershipPortalForgotPasswordOut(BaseModel):
    message: str
    reset_token: str = ""
    expires_in_minutes: int = 0


class MembershipPortalResetPassword(BaseModel):
    token: str
    password: str
    confirm_password: str

    @field_validator("token")
    @classmethod
    def validate_token(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Reset token is required.")
        return cleaned

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        if not STRONG_PASSWORD_PATTERN.fullmatch(value):
            raise ValueError(
                "Password must be 8-64 chars and include uppercase, lowercase, number, and special character."
            )
        return value

    @field_validator("confirm_password")
    @classmethod
    def validate_confirm_password(cls, value: str) -> str:
        if not value:
            raise ValueError("Confirm password is required.")
        return value


class MembershipPortalRefreshRequest(BaseModel):
    refresh_token: str

    @field_validator("refresh_token")
    @classmethod
    def validate_refresh_token(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Refresh token is required.")
        return cleaned


class MembershipPortalAuthOut(BaseModel):
    access_token: str
    refresh_token: str
    access_expires_in: int
    token_type: str = "bearer"
    member: Dict[str, Union[str, int]]


class MembershipPortalProfileOut(BaseModel):
    id: int
    name: str
    email: str
    mobile: str
    membership_id: str
    membership_type: str
    interest_area: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MembershipPortalCpdOut(BaseModel):
    id: int
    title: str
    category: str
    credit_hours: int
    attended_on: str
    status: str

    model_config = ConfigDict(from_attributes=True)
