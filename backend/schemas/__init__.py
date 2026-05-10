from datetime import datetime
import re
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, field_validator

PHONE_PATTERN = re.compile(r"^[+]?[0-9\s()\-]{7,18}$")


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class MemberBase(BaseModel):
    name: str
    position: str
    membership_id: Optional[str] = ""
    address: str
    email: str
    email_secondary: Optional[str] = ""
    mobile: str
    image_url: Optional[str] = ""
    
    model_config = ConfigDict(extra="ignore")


class MemberCreate(MemberBase):
    pass


class MemberUpdate(MemberBase):
    pass


class MemberOut(MemberBase):
    id: int
    created_at: datetime
    
    model_config = ConfigDict(extra="ignore")


class GalleryOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = ""
    image_url: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class NewsletterBase(BaseModel):
    title: str
    summary: Optional[str] = ""


class NewsletterCreate(NewsletterBase):
    pass


class NewsletterUpdate(NewsletterBase):
    pdf_url: str = ""


class NewsletterOut(BaseModel):
    id: int
    title: str
    summary: Optional[str] = ""
    pdf_url: Optional[str] = ""
    published_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ActivityBase(BaseModel):
    title: str
    description: Optional[str] = ""
    event_date: Optional[str] = ""
    image_url: Optional[str] = ""
    pdf_url: Optional[str] = ""
    colab_url: Optional[str] = ""


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
    description: Optional[str] = ""
    image_url: Optional[str] = ""


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
    description: Optional[str] = ""
    pdf_url: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


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
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ConferenceBase(BaseModel):
    title: str
    short_title: str
    description: Optional[str] = ""
    start_date: str
    end_date: str
    registration_deadline: str
    venue: Optional[str] = ""
    button_text: Optional[str] = "More Details"
    link: Optional[str] = "/conference"
    image_url: Optional[str] = ""
    pdf_url: Optional[str] = ""
    status: Optional[str] = "active"
    is_new: bool = True

    @field_validator("status", mode="before")
    @classmethod
    def normalize_status(cls, value: Optional[str]) -> str:
        if value is None:
            return "inactive"
        cleaned = str(value).strip()
        return cleaned or "inactive"


class ConferenceCreate(ConferenceBase):
    pass


class ConferenceUpdate(ConferenceBase):
    pass


class ConferenceOut(ConferenceBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

