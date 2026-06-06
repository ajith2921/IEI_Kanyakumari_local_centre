from datetime import datetime
import re
from typing import Any, Optional
from pydantic import BaseModel, ConfigDict, EmailStr, field_validator

PHONE_PATTERN = re.compile(r"^[+]?[0-9\s()\-]{7,18}$")


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class MemberBase(BaseModel):
    name: Optional[str] = None
    position: Optional[str] = None
    membership_id: Optional[str] = None
    address: Optional[str] = None
    email: Optional[str] = None
    email_secondary: Optional[str] = None
    mobile: Optional[str] = None
    image_url: Optional[str] = None

    model_config = ConfigDict(extra="ignore", from_attributes=True)


class MemberCreate(MemberBase):
    pass


class MemberUpdate(MemberBase):
    pass


class MemberOut(MemberBase):
    id: int
    # Accept both datetime objects and ISO strings returned by Supabase
    created_at: Optional[Any] = None

    model_config = ConfigDict(extra="ignore", from_attributes=True)


class GalleryOut(BaseModel):
    id: int
    title: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    created_at: Optional[Any] = None

    model_config = ConfigDict(from_attributes=True, extra="ignore")


class NewsletterBase(BaseModel):
    title: Optional[str] = None
    summary: Optional[str] = None


class NewsletterCreate(NewsletterBase):
    pass


class NewsletterUpdate(NewsletterBase):
    pdf_url: Optional[str] = None


class NewsletterOut(BaseModel):
    id: int
    title: Optional[str] = None
    summary: Optional[str] = None
    pdf_url: Optional[str] = None
    published_at: Optional[Any] = None

    model_config = ConfigDict(from_attributes=True, extra="ignore")


class ActivityBase(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    event_date: Optional[str] = None
    image_url: Optional[str] = None
    pdf_url: Optional[str] = None
    colab_url: Optional[str] = None


class ActivityCreate(ActivityBase):
    pass


class ActivityUpdate(ActivityBase):
    pass


class ActivityOut(ActivityBase):
    id: int
    created_at: Optional[Any] = None

    model_config = ConfigDict(from_attributes=True, extra="ignore")


class FacilityBase(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None


class FacilityCreate(FacilityBase):
    pass


class FacilityUpdate(FacilityBase):
    pass


class FacilityOut(FacilityBase):
    id: int
    created_at: Optional[Any] = None

    model_config = ConfigDict(from_attributes=True, extra="ignore")


class DownloadOut(BaseModel):
    id: int
    title: Optional[str] = None
    description: Optional[str] = None
    pdf_url: Optional[str] = None
    created_at: Optional[Any] = None

    model_config = ConfigDict(from_attributes=True, extra="ignore")


class ContactCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = ""
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
    phone: Optional[str] = ""
    message: str
    created_at: Optional[Any] = None

    model_config = ConfigDict(from_attributes=True, extra="ignore")


class ConferenceBase(BaseModel):
    title: Optional[str] = None
    short_title: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    registration_deadline: Optional[str] = None
    venue: Optional[str] = None
    button_text: Optional[str] = None
    link: Optional[str] = None
    image_url: Optional[str] = None
    pdf_url: Optional[str] = None
    status: Optional[str] = None
    is_new: Optional[bool] = None

    @field_validator("status", mode="before")
    @classmethod
    def normalize_status(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return None
        cleaned = str(value).strip()
        return cleaned or None


class ConferenceCreate(ConferenceBase):
    pass


class ConferenceUpdate(ConferenceBase):
    pass


class ConferenceOut(ConferenceBase):
    id: int
    created_at: Optional[Any] = None

    model_config = ConfigDict(from_attributes=True, extra="ignore")

from .conference_portal import *
