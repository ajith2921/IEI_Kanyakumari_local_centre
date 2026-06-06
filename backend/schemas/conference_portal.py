from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel, ConfigDict, EmailStr

# ── 1. Conference Dates ──────────────────────────────────────
class ConferenceDatesBase(BaseModel):
    label: str
    date_value: str
    is_extended: Optional[bool] = False
    sort_order: Optional[int] = 0

class ConferenceDatesCreate(ConferenceDatesBase):
    conference_id: int

class ConferenceDatesUpdate(ConferenceDatesBase):
    pass

class ConferenceDatesOut(ConferenceDatesBase):
    id: int
    conference_id: int
    created_at: Optional[Any] = None
    model_config = ConfigDict(from_attributes=True, extra="ignore")

# ── 2. Speakers ─────────────────────────────────────────────
class ConferenceSpeakersBase(BaseModel):
    name: str
    designation: Optional[str] = ""
    organization: Optional[str] = ""
    country: Optional[str] = ""
    bio: Optional[str] = ""
    image_url: Optional[str] = ""
    speaker_type: Optional[str] = "keynote"
    sort_order: Optional[int] = 0

class ConferenceSpeakersCreate(ConferenceSpeakersBase):
    conference_id: int

class ConferenceSpeakersUpdate(ConferenceSpeakersBase):
    pass

class ConferenceSpeakersOut(ConferenceSpeakersBase):
    id: int
    conference_id: int
    created_at: Optional[Any] = None
    model_config = ConfigDict(from_attributes=True, extra="ignore")

# ── 3. Committees ───────────────────────────────────────────
class ConferenceCommitteesBase(BaseModel):
    member_name: str
    designation: Optional[str] = ""
    organization: Optional[str] = ""
    role: str
    sort_order: Optional[int] = 0

class ConferenceCommitteesCreate(ConferenceCommitteesBase):
    conference_id: int

class ConferenceCommitteesUpdate(ConferenceCommitteesBase):
    pass

class ConferenceCommitteesOut(ConferenceCommitteesBase):
    id: int
    conference_id: int
    created_at: Optional[Any] = None
    model_config = ConfigDict(from_attributes=True, extra="ignore")

# ── 4. Registrations ─────────────────────────────────────────
class ConferenceRegistrationsBase(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = ""
    organization: Optional[str] = ""
    designation: Optional[str] = ""
    category: str
    paper_title: Optional[str] = ""
    payment_ref: Optional[str] = ""
    payment_screenshot_url: Optional[str] = ""
    status: Optional[str] = "pending"
    remarks: Optional[str] = ""

class ConferenceRegistrationsCreate(ConferenceRegistrationsBase):
    conference_id: int

class ConferenceRegistrationsUpdate(ConferenceRegistrationsBase):
    pass

class ConferenceRegistrationsOut(ConferenceRegistrationsBase):
    id: int
    conference_id: int
    created_at: Optional[Any] = None
    model_config = ConfigDict(from_attributes=True, extra="ignore")

# ── 5. Submissions ───────────────────────────────────────────
class ConferenceSubmissionsBase(BaseModel):
    author_name: str
    co_authors: Optional[str] = ""
    email: EmailStr
    organization: Optional[str] = ""
    paper_title: str
    abstract: Optional[str] = ""
    keywords: Optional[str] = ""
    track: Optional[str] = ""
    pdf_url: Optional[str] = ""
    status: Optional[str] = "submitted"
    reviewer_comments: Optional[str] = ""

class ConferenceSubmissionsCreate(ConferenceSubmissionsBase):
    conference_id: int

class ConferenceSubmissionsUpdate(ConferenceSubmissionsBase):
    pass

class ConferenceSubmissionsOut(ConferenceSubmissionsBase):
    id: int
    conference_id: int
    created_at: Optional[Any] = None
    model_config = ConfigDict(from_attributes=True, extra="ignore")

# ── 6. Schedule ──────────────────────────────────────────────
class ConferenceScheduleBase(BaseModel):
    day_label: str
    start_time: Optional[str] = ""
    end_time: Optional[str] = ""
    session_title: str
    speaker_name: Optional[str] = ""
    session_type: Optional[str] = "session"
    venue_room: Optional[str] = ""
    sort_order: Optional[int] = 0

class ConferenceScheduleCreate(ConferenceScheduleBase):
    conference_id: int

class ConferenceScheduleUpdate(ConferenceScheduleBase):
    pass

class ConferenceScheduleOut(ConferenceScheduleBase):
    id: int
    conference_id: int
    created_at: Optional[Any] = None
    model_config = ConfigDict(from_attributes=True, extra="ignore")

# ── 7. Sponsors ──────────────────────────────────────────────
class ConferenceSponsorsBase(BaseModel):
    name: str
    logo_url: Optional[str] = ""
    website_url: Optional[str] = ""
    category: Optional[str] = "sponsor"
    sort_order: Optional[int] = 0

class ConferenceSponsorsCreate(ConferenceSponsorsBase):
    conference_id: int

class ConferenceSponsorsUpdate(ConferenceSponsorsBase):
    pass

class ConferenceSponsorsOut(ConferenceSponsorsBase):
    id: int
    conference_id: int
    created_at: Optional[Any] = None
    model_config = ConfigDict(from_attributes=True, extra="ignore")

# ── 8. Downloads ─────────────────────────────────────────────
class ConferenceDownloadsBase(BaseModel):
    title: str
    description: Optional[str] = ""
    file_url: Optional[str] = ""
    file_type: Optional[str] = "pdf"
    category: Optional[str] = "general"
    sort_order: Optional[int] = 0

class ConferenceDownloadsCreate(ConferenceDownloadsBase):
    conference_id: int

class ConferenceDownloadsUpdate(ConferenceDownloadsBase):
    pass

class ConferenceDownloadsOut(ConferenceDownloadsBase):
    id: int
    conference_id: int
    created_at: Optional[Any] = None
    model_config = ConfigDict(from_attributes=True, extra="ignore")

# ── 9. Gallery ───────────────────────────────────────────────
class ConferenceGalleryBase(BaseModel):
    title: Optional[str] = ""
    image_url: str
    album_label: Optional[str] = ""
    sort_order: Optional[int] = 0

class ConferenceGalleryCreate(ConferenceGalleryBase):
    conference_id: int

class ConferenceGalleryUpdate(ConferenceGalleryBase):
    pass

class ConferenceGalleryOut(ConferenceGalleryBase):
    id: int
    conference_id: int
    created_at: Optional[Any] = None
    model_config = ConfigDict(from_attributes=True, extra="ignore")

# ── 10. FAQ ──────────────────────────────────────────────────
class ConferenceFAQBase(BaseModel):
    question: str
    answer: str
    sort_order: Optional[int] = 0

class ConferenceFAQCreate(ConferenceFAQBase):
    conference_id: int

class ConferenceFAQUpdate(ConferenceFAQBase):
    pass

class ConferenceFAQOut(ConferenceFAQBase):
    id: int
    conference_id: int
    created_at: Optional[Any] = None
    model_config = ConfigDict(from_attributes=True, extra="ignore")

# ── 11. Tracks ───────────────────────────────────────────────
class ConferenceTracksBase(BaseModel):
    track_name: str
    description: Optional[str] = ""
    sort_order: Optional[int] = 0

class ConferenceTracksCreate(ConferenceTracksBase):
    conference_id: int

class ConferenceTracksUpdate(ConferenceTracksBase):
    pass

class ConferenceTracksOut(ConferenceTracksBase):
    id: int
    conference_id: int
    created_at: Optional[Any] = None
    model_config = ConfigDict(from_attributes=True, extra="ignore")

# ── 12. Venue ────────────────────────────────────────────────
class ConferenceVenueBase(BaseModel):
    venue_name: str
    address: Optional[str] = ""
    city: Optional[str] = ""
    state: Optional[str] = ""
    pincode: Optional[str] = ""
    map_embed_url: Optional[str] = ""
    directions: Optional[str] = ""
    nearby_hotels: Optional[str] = ""
    image_url: Optional[str] = ""

class ConferenceVenueCreate(ConferenceVenueBase):
    conference_id: int

class ConferenceVenueUpdate(ConferenceVenueBase):
    pass

class ConferenceVenueOut(ConferenceVenueBase):
    id: int
    conference_id: int
    created_at: Optional[Any] = None
    model_config = ConfigDict(from_attributes=True, extra="ignore")

