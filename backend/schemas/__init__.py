from datetime import datetime
import re
from typing import Dict, Optional, Union

from pydantic import BaseModel, ConfigDict, EmailStr, field_validator

PHONE_PATTERN = re.compile(r"^[+]?[0-9\s()\-]{7,18}$")
MEMBERSHIP_STATUSES = {"new", "reviewed", "approved", "rejected"}
MEMBERSHIP_TYPES = {"AMIE", "MIE", "FIE"}
BILLING_CYCLES = {"monthly", "yearly"}
SUBSCRIPTION_LIFECYCLE_STATUSES = {
    "pending",
    "trialing",
    "active",
    "past_due",
    "cancelled",
    "expired",
    "suspended",
}
INVOICE_STATUSES = {
    "pending",
    "paid",
    "failed",
    "cancelled",
    "expired",
    "refunded",
    "past_due",
}
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


class MembershipPlanOut(BaseModel):
    id: int
    code: str
    name: str
    description: str
    monthly_price_cents: int
    yearly_price_cents: int
    currency: str
    is_active: bool
    sort_order: int

    model_config = ConfigDict(from_attributes=True)


class MembershipEntitlementOut(BaseModel):
    key: str
    label: str
    is_enabled: bool
    limit_value: Optional[int]


class MembershipSubscriptionSelectIn(BaseModel):
    plan_code: str
    billing_cycle: str = "monthly"

    @field_validator("plan_code")
    @classmethod
    def validate_plan_code(cls, value: str) -> str:
        cleaned = value.strip().upper()
        if not cleaned:
            raise ValueError("Plan code is required.")
        return cleaned

    @field_validator("billing_cycle")
    @classmethod
    def validate_billing_cycle(cls, value: str) -> str:
        normalized = value.strip().lower()
        if normalized not in BILLING_CYCLES:
            allowed = ", ".join(sorted(BILLING_CYCLES))
            raise ValueError(f"Billing cycle must be one of: {allowed}.")
        return normalized


class MembershipSubscriptionOut(BaseModel):
    id: int
    member_id: int
    plan_code: str
    plan_name: str
    status: str
    billing_cycle: str
    current_period_start: Optional[datetime]
    current_period_end: Optional[datetime]
    cancel_at_period_end: bool
    entitlements: list[MembershipEntitlementOut] = []


class MembershipInvoiceOut(BaseModel):
    id: int
    invoice_number: str
    amount_cents: int
    currency: str
    status: str
    payment_reference: str
    due_at: Optional[datetime]
    paid_at: Optional[datetime]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MembershipCheckoutSessionOut(BaseModel):
    provider: str
    checkout_reference: str
    checkout_url: str
    checkout_payload: Dict[str, Union[str, int, float, bool, None]] = {}
    subscription: MembershipSubscriptionOut
    invoice: MembershipInvoiceOut


class MembershipPaymentWebhookIn(BaseModel):
    provider: str = "sandbox"
    event_id: str
    event_type: str = "payment.updated"
    invoice_number: str
    status: str
    payment_reference: str = ""
    paid_at: Optional[datetime] = None

    @field_validator("provider")
    @classmethod
    def validate_provider(cls, value: str) -> str:
        normalized = value.strip().lower()
        if not normalized:
            raise ValueError("Provider is required.")
        return normalized

    @field_validator("event_id")
    @classmethod
    def validate_event_id(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("event_id is required.")
        return cleaned

    @field_validator("event_type")
    @classmethod
    def validate_event_type(cls, value: str) -> str:
        cleaned = value.strip().lower()
        if not cleaned:
            raise ValueError("event_type is required.")
        return cleaned

    @field_validator("invoice_number")
    @classmethod
    def validate_invoice_number(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("invoice_number is required.")
        return cleaned

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        cleaned = value.strip().lower()
        if not cleaned:
            raise ValueError("status is required.")
        return cleaned


class MembershipPaymentWebhookOut(BaseModel):
    processed: bool
    message: str
    invoice_status: str = ""
    subscription_status: str = ""


class MembershipAdminSubscriptionOut(BaseModel):
    id: int
    member_id: int
    member_name: str
    member_email: str
    member_membership_id: str
    plan_code: str
    plan_name: str
    status: str
    billing_cycle: str
    current_period_start: Optional[datetime]
    current_period_end: Optional[datetime]
    cancel_at_period_end: bool
    created_at: datetime
    updated_at: datetime


class MembershipAdminInvoiceOut(BaseModel):
    id: int
    invoice_number: str
    member_id: int
    member_name: str
    member_email: str
    member_membership_id: str
    subscription_id: int
    plan_code: str
    plan_name: str
    amount_cents: int
    currency: str
    status: str
    payment_reference: str
    due_at: Optional[datetime]
    paid_at: Optional[datetime]
    created_at: datetime


class MembershipAdminSubscriptionStatusUpdateIn(BaseModel):
    status: str
    cancel_at_period_end: Optional[bool] = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        normalized = value.strip().lower()
        if normalized not in SUBSCRIPTION_LIFECYCLE_STATUSES:
            allowed = ", ".join(sorted(SUBSCRIPTION_LIFECYCLE_STATUSES))
            raise ValueError(f"Status must be one of: {allowed}.")
        return normalized


class MembershipAdminInvoiceStatusUpdateIn(BaseModel):
    status: str
    payment_reference: str = ""
    paid_at: Optional[datetime] = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        normalized = value.strip().lower()
        if normalized not in INVOICE_STATUSES:
            allowed = ", ".join(sorted(INVOICE_STATUSES))
            raise ValueError(f"Status must be one of: {allowed}.")
        return normalized

    @field_validator("payment_reference")
    @classmethod
    def validate_payment_reference(cls, value: str) -> str:
        return value.strip()


class MembershipAdminSubscriptionRenewIn(BaseModel):
    billing_cycle: str = ""
    activate_now: bool = False

    @field_validator("billing_cycle")
    @classmethod
    def validate_billing_cycle(cls, value: str) -> str:
        normalized = value.strip().lower()
        if not normalized:
            return ""
        if normalized not in BILLING_CYCLES:
            allowed = ", ".join(sorted(BILLING_CYCLES))
            raise ValueError(f"Billing cycle must be one of: {allowed}.")
        return normalized


class MembershipAdminRefundIn(BaseModel):
    payment_reference: str = ""
    reason: str = ""

    @field_validator("payment_reference")
    @classmethod
    def validate_payment_reference(cls, value: str) -> str:
        return value.strip()

    @field_validator("reason")
    @classmethod
    def validate_reason(cls, value: str) -> str:
        cleaned = value.strip()
        if len(cleaned) > 300:
            raise ValueError("Reason must be 300 characters or fewer.")
        return cleaned


class MembershipAdminRenewOut(BaseModel):
    subscription: MembershipAdminSubscriptionOut
    invoice: MembershipAdminInvoiceOut
    message: str


class MembershipAdminRefundOut(BaseModel):
    invoice: MembershipAdminInvoiceOut
    subscription_status: str
    message: str


class MembershipAdminMetricsOut(BaseModel):
    total_subscriptions: int
    active_subscriptions: int
    pending_subscriptions: int
    suspended_subscriptions: int
    cancelled_subscriptions: int
    total_invoices: int
    paid_invoices: int
    pending_invoices: int
    refunded_invoices: int
    paid_revenue_cents: int
    monthly_recurring_revenue_cents: int
    yearly_recurring_revenue_cents: int


class MembershipPaymentEventOut(BaseModel):
    id: int
    provider: str
    event_id: str
    event_type: str
    invoice_id: Optional[int]
    invoice_number: str
    payment_reference: str
    status: str
    processed_at: datetime
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MembershipCpdCategoryStat(BaseModel):
    category: str
    activities: int
    credit_hours: int


class MembershipCpdAnalyticsOut(BaseModel):
    total_activities: int
    total_credit_hours: int
    recent_activity_title: str = ""
    category_breakdown: list[MembershipCpdCategoryStat] = []
