from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Member(Base):
    __tablename__ = "members"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    designation: Mapped[str] = mapped_column(String(120), nullable=False, default="")
    organization: Mapped[str] = mapped_column(String(160), nullable=False, default="")
    bio: Mapped[str] = mapped_column(Text, default="")
    position: Mapped[str] = mapped_column(String(120), nullable=False, default="")
    membership_id: Mapped[str] = mapped_column(String(80), default="")
    address: Mapped[str] = mapped_column(Text, default="")
    email: Mapped[str] = mapped_column(String(120), default="")
    mobile: Mapped[str] = mapped_column(String(30), default="")
    password_hash: Mapped[str] = mapped_column(String(255), default="")
    failed_login_attempts: Mapped[int] = mapped_column(Integer, default=0)
    locked_until: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    last_login_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    refresh_token_hash: Mapped[str] = mapped_column(String(255), default="")
    refresh_token_expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    membership_type: Mapped[str] = mapped_column(String(20), default="")
    interest_area: Mapped[str] = mapped_column(String(180), default="")
    legacy_image_url: Mapped[str] = mapped_column("image_url", String(255), nullable=False, default="")
    image: Mapped[str] = mapped_column(String(255), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    @property
    def image_url(self) -> str:
        if self.image:
            return self.image
        return self.legacy_image_url or ""

    @image_url.setter
    def image_url(self, value: str) -> None:
        normalized = value or ""
        self.image = normalized
        self.legacy_image_url = normalized


class GalleryItem(Base):
    __tablename__ = "gallery"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    image_url: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Newsletter(Base):
    __tablename__ = "newsletters"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(180), nullable=False)
    summary: Mapped[str] = mapped_column(Text, default="")
    pdf_url: Mapped[str] = mapped_column(String(255), default="")
    published_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Activity(Base):
    __tablename__ = "activities"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(180), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    event_date: Mapped[str] = mapped_column(String(40), default="")
    image_url: Mapped[str] = mapped_column(String(255), default="")
    pdf_url: Mapped[str] = mapped_column(String(255), default="")
    colab_url: Mapped[str] = mapped_column(String(255), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Facility(Base):
    __tablename__ = "facilities"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    image_url: Mapped[str] = mapped_column(String(255), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Download(Base):
    __tablename__ = "downloads"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(180), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    pdf_url: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class ContactMessage(Base):
    __tablename__ = "contacts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(120), nullable=False)
    phone: Mapped[str] = mapped_column(String(30), default="")
    message: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Conference(Base):
    __tablename__ = "conferences"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    short_title: Mapped[str] = mapped_column(String(50), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    start_date: Mapped[str] = mapped_column(String(40), nullable=False)
    end_date: Mapped[str] = mapped_column(String(40), nullable=False)
    registration_deadline: Mapped[str] = mapped_column(String(40), nullable=False)
    venue: Mapped[str] = mapped_column(String(200), default="")
    button_text: Mapped[str] = mapped_column(String(50), default="More Details")
    link: Mapped[str] = mapped_column(String(255), default="/conference")
    image_url: Mapped[str] = mapped_column(String(255), default="")
    pdf_url: Mapped[str] = mapped_column(String(255), default="")
    status: Mapped[str] = mapped_column(String(20), default="active")  # active, completed, cancelled
    is_new: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
