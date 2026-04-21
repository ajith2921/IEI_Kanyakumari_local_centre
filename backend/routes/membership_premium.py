import csv
from datetime import datetime, timedelta, timezone
import hashlib
import hmac
from io import StringIO
import json
import os
import secrets
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response, status
from pydantic import ValidationError
from sqlalchemy.orm import Session

from auth import get_current_active_user, get_current_membership_member
from database import get_db
from models import (
    Member,
    MemberCpdRecord,
    MembershipEntitlement,
    MembershipInvoice,
    MembershipPaymentEvent,
    MembershipPlan,
    MembershipSubscription,
    User,
)
from schemas import (
    MembershipAdminInvoiceOut,
    MembershipAdminMetricsOut,
    MembershipAdminRefundIn,
    MembershipAdminRefundOut,
    MembershipAdminRenewOut,
    MembershipAdminSubscriptionRenewIn,
    MembershipAdminInvoiceStatusUpdateIn,
    MembershipPaymentEventOut,
    MembershipAdminSubscriptionOut,
    MembershipAdminSubscriptionStatusUpdateIn,
    MembershipCheckoutSessionOut,
    MembershipCpdAnalyticsOut,
    MembershipCpdCategoryStat,
    MembershipEntitlementOut,
    MembershipInvoiceOut,
    MembershipPaymentWebhookIn,
    MembershipPaymentWebhookOut,
    MembershipPlanOut,
    MembershipSubscriptionOut,
    MembershipSubscriptionSelectIn,
)

router = APIRouter(tags=["Membership Premium"])

VISIBLE_SUBSCRIPTION_STATUSES = {"pending", "trialing", "active", "past_due"}
ENTITLEMENT_ELIGIBLE_STATUSES = {"trialing", "active", "past_due"}
PAYMENT_SUCCESS_STATUSES = {"paid", "succeeded", "completed"}
PAYMENT_FAILURE_STATUSES = {"failed", "cancelled", "expired"}


def _env_flag(name: str, default: bool = False) -> bool:
    value = (os.getenv(name) or "").strip().lower()
    if not value:
        return default
    return value in {"1", "true", "yes", "on"}


PAYMENT_PROVIDER = ((os.getenv("MEMBERSHIP_PAYMENT_PROVIDER") or "sandbox").strip().lower() or "sandbox")
PAYMENT_CHECKOUT_BASE_URL = (
    (os.getenv("MEMBERSHIP_PAYMENT_CHECKOUT_BASE_URL") or "https://payments.example.test/checkout")
    .strip()
    .rstrip("/")
)
PAYMENT_WEBHOOK_SECRET = (os.getenv("MEMBERSHIP_PAYMENT_WEBHOOK_SECRET") or "").strip()
PAYMENT_WEBHOOK_SIGNATURE_HEADER = (
    (os.getenv("MEMBERSHIP_PAYMENT_WEBHOOK_SIGNATURE_HEADER") or "x-membership-signature")
    .strip()
    .lower()
)
ALLOW_UNSIGNED_WEBHOOKS = _env_flag("MEMBERSHIP_PAYMENT_ALLOW_UNSIGNED_WEBHOOKS", False)
STRIPE_WEBHOOK_SECRET = (os.getenv("MEMBERSHIP_PAYMENT_STRIPE_WEBHOOK_SECRET") or PAYMENT_WEBHOOK_SECRET).strip()
STRIPE_WEBHOOK_SIGNATURE_HEADER = (
    (os.getenv("MEMBERSHIP_PAYMENT_STRIPE_SIGNATURE_HEADER") or "stripe-signature")
    .strip()
    .lower()
)
RAZORPAY_WEBHOOK_SECRET = (
    (os.getenv("MEMBERSHIP_PAYMENT_RAZORPAY_WEBHOOK_SECRET") or PAYMENT_WEBHOOK_SECRET)
    .strip()
)
RAZORPAY_WEBHOOK_SIGNATURE_HEADER = (
    (os.getenv("MEMBERSHIP_PAYMENT_RAZORPAY_SIGNATURE_HEADER") or "x-razorpay-signature")
    .strip()
    .lower()
)
STRIPE_PUBLISHABLE_KEY = (os.getenv("MEMBERSHIP_PAYMENT_STRIPE_PUBLISHABLE_KEY") or "").strip()
RAZORPAY_KEY_ID = (os.getenv("MEMBERSHIP_PAYMENT_RAZORPAY_KEY_ID") or "").strip()


def _utcnow() -> datetime:
    return datetime.utcnow()


def _billing_days(billing_cycle: str) -> int:
    return 30 if billing_cycle == "monthly" else 365


def _load_plan(plan_id: int, db: Session) -> MembershipPlan:
    plan = db.query(MembershipPlan).filter(MembershipPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Membership plan not found.")
    return plan


def _load_plan_by_code(plan_code: str, db: Session) -> MembershipPlan:
    plan = (
        db.query(MembershipPlan)
        .filter(
            MembershipPlan.code == plan_code,
            MembershipPlan.is_active.is_(True),
        )
        .first()
    )
    if not plan:
        raise HTTPException(status_code=404, detail="Requested membership plan is not available.")
    return plan


def _load_entitlements(plan_id: int, db: Session) -> list[MembershipEntitlementOut]:
    rows = (
        db.query(MembershipEntitlement)
        .filter(MembershipEntitlement.plan_id == plan_id)
        .order_by(MembershipEntitlement.key.asc(), MembershipEntitlement.id.asc())
        .all()
    )

    return [
        MembershipEntitlementOut(
            key=item.key,
            label=item.label,
            is_enabled=bool(item.is_enabled),
            limit_value=item.limit_value,
        )
        for item in rows
    ]


def _serialize_subscription(
    subscription: MembershipSubscription,
    plan: MembershipPlan,
    db: Session,
) -> MembershipSubscriptionOut:
    return MembershipSubscriptionOut(
        id=subscription.id,
        member_id=subscription.member_id,
        plan_code=plan.code,
        plan_name=plan.name,
        status=subscription.status,
        billing_cycle=subscription.billing_cycle,
        current_period_start=subscription.current_period_start,
        current_period_end=subscription.current_period_end,
        cancel_at_period_end=subscription.cancel_at_period_end,
        entitlements=_load_entitlements(plan.id, db),
    )


def _latest_visible_subscription(member_id: int, db: Session) -> Optional[MembershipSubscription]:
    return (
        db.query(MembershipSubscription)
        .filter(
            MembershipSubscription.member_id == member_id,
            MembershipSubscription.status.in_(VISIBLE_SUBSCRIPTION_STATUSES),
        )
        .order_by(MembershipSubscription.created_at.desc(), MembershipSubscription.id.desc())
        .first()
    )


def _latest_subscription_invoice(subscription_id: int, db: Session) -> Optional[MembershipInvoice]:
    return (
        db.query(MembershipInvoice)
        .filter(MembershipInvoice.subscription_id == subscription_id)
        .order_by(MembershipInvoice.created_at.desc(), MembershipInvoice.id.desc())
        .first()
    )


def _build_checkout_reference() -> str:
    token = secrets.token_urlsafe(18).replace("-", "").replace("_", "")
    return f"chk_{token[:24]}"


def _build_checkout_url(checkout_reference: str, invoice_number: str) -> str:
    return f"{PAYMENT_CHECKOUT_BASE_URL}?checkout_ref={checkout_reference}&invoice={invoice_number}"


def _build_checkout_payload(
    invoice: MembershipInvoice,
    plan: MembershipPlan,
    billing_cycle: str,
    checkout_reference: str,
) -> dict[str, object]:
    payload: dict[str, object] = {
        "provider": PAYMENT_PROVIDER,
        "invoice_number": invoice.invoice_number,
        "checkout_reference": checkout_reference,
        "amount_cents": int(invoice.amount_cents or 0),
        "currency": invoice.currency,
        "plan_code": plan.code,
        "plan_name": plan.name,
        "billing_cycle": billing_cycle,
    }

    if PAYMENT_PROVIDER == "stripe":
        payload.update(
            {
                "session_reference": checkout_reference,
                "publishable_key": STRIPE_PUBLISHABLE_KEY,
                "mode": "subscription",
                "success_path": "/membership-form?checkout=success",
                "cancel_path": "/membership-form?checkout=cancel",
            }
        )
    elif PAYMENT_PROVIDER == "razorpay":
        payload.update(
            {
                "order_reference": checkout_reference,
                "key_id": RAZORPAY_KEY_ID,
                "receipt": invoice.invoice_number,
                "description": f"{plan.name} ({billing_cycle})",
            }
        )
    else:
        payload.update(
            {
                "mode": "sandbox",
                "description": "Use sandbox webhook simulation to complete payment.",
            }
        )

    return payload


def _build_event_key(provider: str, event_id: str) -> str:
    return f"{provider}:{event_id}".strip().lower()


def _new_admin_event_key(prefix: str) -> str:
    now = _utcnow()
    return f"admin:{prefix}:{now:%Y%m%d%H%M%S%f}:{secrets.token_hex(4)}"


def _record_payment_event(
    db: Session,
    *,
    provider: str,
    event_id: str,
    event_type: str,
    invoice_id: Optional[int],
    invoice_number: str,
    payment_reference: str,
    status: str,
    processed_at: Optional[datetime] = None,
) -> None:
    payment_event = MembershipPaymentEvent(
        event_key=_build_event_key(provider, event_id),
        provider=provider,
        event_id=event_id,
        event_type=event_type,
        invoice_id=invoice_id,
        invoice_number=invoice_number,
        payment_reference=payment_reference,
        status=status,
        processed_at=processed_at or _utcnow(),
    )
    db.add(payment_event)


def _build_invoice_number(member_id: int) -> str:
    now = _utcnow()
    nonce = secrets.token_hex(3).upper()
    return f"INV-{now:%Y%m%d}-{member_id:05d}-{nonce}"


def _cancel_subscription(subscription: MembershipSubscription, db: Session) -> None:
    now = _utcnow()
    subscription.status = "cancelled"
    subscription.cancelled_at = now
    subscription.cancel_at_period_end = False

    pending_invoices = (
        db.query(MembershipInvoice)
        .filter(
            MembershipInvoice.subscription_id == subscription.id,
            MembershipInvoice.status == "pending",
        )
        .all()
    )
    for invoice in pending_invoices:
        invoice.status = "cancelled"


def _create_pending_invoice(
    member_id: int,
    subscription: MembershipSubscription,
    plan: MembershipPlan,
    billing_cycle: str,
    db: Session,
) -> MembershipInvoice:
    amount_cents = plan.monthly_price_cents if billing_cycle == "monthly" else plan.yearly_price_cents
    checkout_reference = _build_checkout_reference()
    invoice = MembershipInvoice(
        member_id=member_id,
        subscription_id=subscription.id,
        plan_id=plan.id,
        invoice_number=_build_invoice_number(member_id),
        amount_cents=amount_cents,
        currency=plan.currency,
        status="pending",
        due_at=_utcnow() + timedelta(days=3),
        paid_at=None,
        payment_reference=checkout_reference,
    )
    db.add(invoice)
    db.flush()
    return invoice


def _ensure_pending_invoice(
    member_id: int,
    subscription: MembershipSubscription,
    plan: MembershipPlan,
    billing_cycle: str,
    db: Session,
) -> MembershipInvoice:
    pending_invoice = (
        db.query(MembershipInvoice)
        .filter(
            MembershipInvoice.subscription_id == subscription.id,
            MembershipInvoice.status == "pending",
        )
        .order_by(MembershipInvoice.created_at.desc(), MembershipInvoice.id.desc())
        .first()
    )
    if pending_invoice:
        if not (pending_invoice.payment_reference or "").strip():
            pending_invoice.payment_reference = _build_checkout_reference()
        return pending_invoice

    return _create_pending_invoice(member_id, subscription, plan, billing_cycle, db)


def _prepare_pending_subscription(
    payload: MembershipSubscriptionSelectIn,
    member: Member,
    db: Session,
    allow_existing_active: bool,
) -> tuple[MembershipSubscription, MembershipPlan, MembershipInvoice]:
    plan = _load_plan_by_code(payload.plan_code, db)
    existing_subscription = _latest_visible_subscription(member.id, db)

    if (
        existing_subscription
        and existing_subscription.plan_id == plan.id
        and existing_subscription.billing_cycle == payload.billing_cycle
    ):
        if existing_subscription.status in {"trialing", "active", "past_due"}:
            if not allow_existing_active:
                raise HTTPException(status_code=409, detail="Selected premium plan is already active.")

            invoice = _latest_subscription_invoice(existing_subscription.id, db)
            if not invoice:
                invoice = _create_pending_invoice(
                    member.id,
                    existing_subscription,
                    plan,
                    payload.billing_cycle,
                    db,
                )
            return existing_subscription, plan, invoice

        if existing_subscription.status == "pending":
            invoice = _ensure_pending_invoice(
                member.id,
                existing_subscription,
                plan,
                payload.billing_cycle,
                db,
            )
            return existing_subscription, plan, invoice

    if existing_subscription:
        _cancel_subscription(existing_subscription, db)

    subscription = MembershipSubscription(
        member_id=member.id,
        plan_id=plan.id,
        status="pending",
        billing_cycle=payload.billing_cycle,
        current_period_start=None,
        current_period_end=None,
        cancel_at_period_end=False,
        started_at=None,
        cancelled_at=None,
    )
    db.add(subscription)
    db.flush()

    invoice = _create_pending_invoice(member.id, subscription, plan, payload.billing_cycle, db)
    return subscription, plan, invoice


def _resolve_member_entitlement_plan(member_id: int, db: Session) -> Optional[MembershipPlan]:
    subscription = (
        db.query(MembershipSubscription)
        .filter(
            MembershipSubscription.member_id == member_id,
            MembershipSubscription.status.in_(ENTITLEMENT_ELIGIBLE_STATUSES),
        )
        .order_by(MembershipSubscription.created_at.desc(), MembershipSubscription.id.desc())
        .first()
    )
    if not subscription:
        return None

    return db.query(MembershipPlan).filter(MembershipPlan.id == subscription.plan_id).first()


def _ensure_member_entitlement(member_id: int, entitlement_key: str, db: Session) -> MembershipPlan:
    plan = _resolve_member_entitlement_plan(member_id, db)
    if not plan:
        raise HTTPException(status_code=403, detail="Premium plan required for this feature.")

    entitlement = (
        db.query(MembershipEntitlement)
        .filter(
            MembershipEntitlement.plan_id == plan.id,
            MembershipEntitlement.key == entitlement_key,
            MembershipEntitlement.is_enabled.is_(True),
        )
        .first()
    )
    if not entitlement:
        raise HTTPException(status_code=403, detail="Premium plan required for this feature.")

    return plan


def _normalize_payment_status(value: str) -> str:
    normalized = (value or "").strip().lower()
    if not normalized:
        return "pending"

    aliases = {
        "captured": "paid",
        "success": "paid",
        "successful": "paid",
        "succeeded": "paid",
        "completed": "paid",
        "canceled": "cancelled",
        "authorised": "pending",
        "authorized": "pending",
        "created": "pending",
        "open": "pending",
        "unpaid": "pending",
        "requires_action": "pending",
        "requires_payment_method": "pending",
        "processing": "pending",
    }
    return aliases.get(normalized, normalized)


def _from_epoch(value: object) -> Optional[datetime]:
    if isinstance(value, (int, float)):
        try:
            return datetime.utcfromtimestamp(value)
        except (ValueError, OSError, OverflowError):
            return None
    return None


def _verify_webhook_signature(
    raw_body: bytes,
    signature: str,
    secret: str,
    *,
    allow_unsigned: bool,
    provider_mode: str = "simple",
) -> None:
    if not secret:
        if allow_unsigned:
            return
        raise HTTPException(
            status_code=503,
            detail="Payment webhook secret is not configured.",
        )

    provided = (signature or "").strip()
    if not provided:
        raise HTTPException(status_code=401, detail="Missing payment signature header.")

    if provider_mode == "stripe":
        parts: dict[str, list[str]] = {}
        for chunk in provided.split(","):
            key, separator, raw_value = chunk.partition("=")
            if not separator:
                continue
            parsed_key = key.strip().lower()
            parsed_value = raw_value.strip()
            if not parsed_key or not parsed_value:
                continue
            parts.setdefault(parsed_key, []).append(parsed_value)

        timestamp = (parts.get("t") or [""])[0]
        signatures = parts.get("v1") or []
        if not timestamp or not signatures:
            raise HTTPException(status_code=401, detail="Invalid Stripe signature header.")

        payload_text = raw_body.decode("utf-8", errors="replace")
        signed_payload = f"{timestamp}.{payload_text}".encode("utf-8")
        expected = hmac.new(secret.encode("utf-8"), signed_payload, hashlib.sha256).hexdigest()
        if not any(hmac.compare_digest(expected, item) for item in signatures):
            raise HTTPException(status_code=401, detail="Invalid Stripe webhook signature.")
        return

    if provided.lower().startswith("sha256="):
        provided = provided.split("=", 1)[1].strip()

    expected = hmac.new(secret.encode("utf-8"), raw_body, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, provided):
        raise HTTPException(status_code=401, detail="Invalid payment signature.")


def _process_payment_event_payload(
    payload: MembershipPaymentWebhookIn,
    db: Session,
) -> MembershipPaymentWebhookOut:
    provider = (payload.provider or PAYMENT_PROVIDER).strip().lower() or PAYMENT_PROVIDER
    event_key = _build_event_key(provider, payload.event_id)

    existing_event = (
        db.query(MembershipPaymentEvent)
        .filter(MembershipPaymentEvent.event_key == event_key)
        .first()
    )
    if existing_event:
        return MembershipPaymentWebhookOut(
            processed=False,
            message="Duplicate payment event ignored.",
            invoice_status=existing_event.status,
            subscription_status="",
        )

    invoice = (
        db.query(MembershipInvoice)
        .filter(MembershipInvoice.invoice_number == payload.invoice_number)
        .first()
    )
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found for payment event.")

    subscription = (
        db.query(MembershipSubscription)
        .filter(MembershipSubscription.id == invoice.subscription_id)
        .first()
    )
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found for payment event.")

    now = _utcnow()
    normalized_status = _normalize_payment_status(payload.status)

    if normalized_status in PAYMENT_SUCCESS_STATUSES:
        invoice.status = "paid"
        invoice.paid_at = payload.paid_at or now
        if payload.payment_reference:
            invoice.payment_reference = payload.payment_reference

        subscription.status = "active"
        if not subscription.started_at:
            subscription.started_at = now
        if not subscription.current_period_start:
            subscription.current_period_start = now
        if not subscription.current_period_end:
            subscription.current_period_end = subscription.current_period_start + timedelta(
                days=_billing_days(subscription.billing_cycle)
            )
        subscription.cancelled_at = None
        subscription.cancel_at_period_end = False

    elif normalized_status == "refunded":
        invoice.status = "refunded"
        if payload.payment_reference:
            invoice.payment_reference = payload.payment_reference

    elif normalized_status in PAYMENT_FAILURE_STATUSES:
        if invoice.status != "paid":
            invoice.status = normalized_status
        if payload.payment_reference:
            invoice.payment_reference = payload.payment_reference
        if subscription.status == "pending":
            subscription.status = "cancelled"
            subscription.cancelled_at = now
            subscription.cancel_at_period_end = False

    else:
        invoice.status = normalized_status
        if payload.payment_reference:
            invoice.payment_reference = payload.payment_reference

    _record_payment_event(
        db,
        provider=provider,
        event_id=payload.event_id,
        event_type=payload.event_type,
        invoice_id=invoice.id,
        invoice_number=invoice.invoice_number,
        payment_reference=payload.payment_reference or invoice.payment_reference,
        status=invoice.status,
        processed_at=now,
    )
    db.commit()

    return MembershipPaymentWebhookOut(
        processed=True,
        message="Payment event processed successfully.",
        invoice_status=invoice.status,
        subscription_status=subscription.status,
    )


def _normalize_stripe_webhook_payload(
    payload: dict,
    fallback_event_id: str,
) -> MembershipPaymentWebhookIn:
    event_id = str(payload.get("id") or "").strip() or fallback_event_id
    event_type = str(payload.get("type") or "payment.updated").strip().lower()

    data_obj = payload.get("data") if isinstance(payload.get("data"), dict) else {}
    event_object = data_obj.get("object") if isinstance(data_obj.get("object"), dict) else {}
    metadata = event_object.get("metadata") if isinstance(event_object.get("metadata"), dict) else {}

    invoice_number = str(
        metadata.get("invoice_number")
        or event_object.get("invoice_number")
        or event_object.get("invoice")
        or ""
    ).strip()
    if not invoice_number:
        raise HTTPException(status_code=400, detail="Stripe webhook payload is missing invoice number metadata.")

    if event_type in {
        "checkout.session.completed",
        "payment_intent.succeeded",
        "charge.succeeded",
        "invoice.paid",
        "invoice.payment_succeeded",
    }:
        normalized_status = "paid"
    elif event_type in {
        "checkout.session.expired",
        "payment_intent.payment_failed",
        "charge.failed",
        "invoice.payment_failed",
    }:
        normalized_status = "failed"
    elif event_type in {
        "charge.refunded",
        "refund.created",
        "refund.updated",
    }:
        normalized_status = "refunded"
    else:
        normalized_status = _normalize_payment_status(
            str(event_object.get("payment_status") or event_object.get("status") or "pending")
        )

    payment_reference = str(
        event_object.get("payment_intent")
        or event_object.get("id")
        or ""
    ).strip()
    paid_at = _from_epoch(event_object.get("created"))

    return MembershipPaymentWebhookIn(
        provider="stripe",
        event_id=event_id,
        event_type=event_type,
        invoice_number=invoice_number,
        status=normalized_status,
        payment_reference=payment_reference,
        paid_at=paid_at,
    )


def _normalize_razorpay_webhook_payload(
    payload: dict,
    fallback_event_id: str,
) -> MembershipPaymentWebhookIn:
    event_type = str(payload.get("event") or "payment.updated").strip().lower()
    payload_section = payload.get("payload") if isinstance(payload.get("payload"), dict) else {}

    payment_section = payload_section.get("payment") if isinstance(payload_section.get("payment"), dict) else {}
    payment_entity = payment_section.get("entity") if isinstance(payment_section.get("entity"), dict) else {}

    order_section = payload_section.get("order") if isinstance(payload_section.get("order"), dict) else {}
    order_entity = order_section.get("entity") if isinstance(order_section.get("entity"), dict) else {}

    refund_section = payload_section.get("refund") if isinstance(payload_section.get("refund"), dict) else {}
    refund_entity = refund_section.get("entity") if isinstance(refund_section.get("entity"), dict) else {}

    notes = {}
    if isinstance(order_entity.get("notes"), dict):
        notes.update(order_entity.get("notes"))
    if isinstance(payment_entity.get("notes"), dict):
        notes.update(payment_entity.get("notes"))
    if isinstance(refund_entity.get("notes"), dict):
        notes.update(refund_entity.get("notes"))

    invoice_number = str(
        notes.get("invoice_number")
        or payment_entity.get("invoice_number")
        or order_entity.get("invoice_number")
        or refund_entity.get("invoice_number")
        or ""
    ).strip()
    if not invoice_number:
        raise HTTPException(status_code=400, detail="Razorpay webhook payload is missing invoice number notes.")

    payment_reference = str(
        payment_entity.get("id")
        or refund_entity.get("id")
        or order_entity.get("id")
        or ""
    ).strip()
    event_id = str(payload.get("id") or payment_reference or "").strip() or fallback_event_id

    if event_type in {"payment.captured", "order.paid"}:
        normalized_status = "paid"
    elif event_type in {"payment.failed"}:
        normalized_status = "failed"
    elif event_type.startswith("refund."):
        normalized_status = "refunded"
    else:
        normalized_status = _normalize_payment_status(
            str(payment_entity.get("status") or refund_entity.get("status") or "pending")
        )

    paid_at = (
        _from_epoch(payment_entity.get("captured_at"))
        or _from_epoch(payment_entity.get("created_at"))
        or _from_epoch(payload.get("created_at"))
    )

    return MembershipPaymentWebhookIn(
        provider="razorpay",
        event_id=event_id,
        event_type=event_type,
        invoice_number=invoice_number,
        status=normalized_status,
        payment_reference=payment_reference,
        paid_at=paid_at,
    )


@router.get("/membership-premium/plans", response_model=list[MembershipPlanOut])
def list_membership_plans(db: Session = Depends(get_db)) -> list[MembershipPlan]:
    return (
        db.query(MembershipPlan)
        .filter(MembershipPlan.is_active.is_(True))
        .order_by(MembershipPlan.sort_order.asc(), MembershipPlan.name.asc())
        .all()
    )


@router.get("/membership-portal/subscription", response_model=Optional[MembershipSubscriptionOut])
def get_current_subscription(
    member: Member = Depends(get_current_membership_member),
    db: Session = Depends(get_db),
) -> Optional[MembershipSubscriptionOut]:
    subscription = _latest_visible_subscription(member.id, db)
    if not subscription:
        return None

    plan = _load_plan(subscription.plan_id, db)
    return _serialize_subscription(subscription, plan, db)


@router.post(
    "/membership-portal/subscription/select",
    response_model=MembershipSubscriptionOut,
    status_code=status.HTTP_201_CREATED,
)
def select_membership_plan(
    payload: MembershipSubscriptionSelectIn,
    member: Member = Depends(get_current_membership_member),
    db: Session = Depends(get_db),
) -> MembershipSubscriptionOut:
    subscription, plan, _invoice = _prepare_pending_subscription(
        payload,
        member,
        db,
        allow_existing_active=True,
    )
    db.commit()
    db.refresh(subscription)
    return _serialize_subscription(subscription, plan, db)


@router.post(
    "/membership-portal/subscription/checkout",
    response_model=MembershipCheckoutSessionOut,
    status_code=status.HTTP_201_CREATED,
)
def create_membership_checkout_session(
    payload: MembershipSubscriptionSelectIn,
    member: Member = Depends(get_current_membership_member),
    db: Session = Depends(get_db),
) -> MembershipCheckoutSessionOut:
    subscription, plan, invoice = _prepare_pending_subscription(
        payload,
        member,
        db,
        allow_existing_active=False,
    )

    if subscription.status != "pending":
        raise HTTPException(status_code=409, detail="Checkout can only be created for pending subscriptions.")

    if not (invoice.payment_reference or "").strip():
        invoice.payment_reference = _build_checkout_reference()

    db.commit()
    db.refresh(subscription)
    db.refresh(invoice)

    checkout_reference = invoice.payment_reference
    checkout_url = _build_checkout_url(checkout_reference, invoice.invoice_number)
    checkout_payload = _build_checkout_payload(invoice, plan, payload.billing_cycle, checkout_reference)

    return MembershipCheckoutSessionOut(
        provider=PAYMENT_PROVIDER,
        checkout_reference=checkout_reference,
        checkout_url=checkout_url,
        checkout_payload=checkout_payload,
        subscription=_serialize_subscription(subscription, plan, db),
        invoice=MembershipInvoiceOut.model_validate(invoice),
    )


@router.post(
    "/membership-premium/payment/webhook",
    response_model=MembershipPaymentWebhookOut,
)
async def process_membership_payment_webhook(
    request: Request,
    db: Session = Depends(get_db),
) -> MembershipPaymentWebhookOut:
    raw_body = await request.body()
    signature = request.headers.get(PAYMENT_WEBHOOK_SIGNATURE_HEADER, "")
    _verify_webhook_signature(
        raw_body,
        signature,
        PAYMENT_WEBHOOK_SECRET,
        allow_unsigned=ALLOW_UNSIGNED_WEBHOOKS,
        provider_mode="simple",
    )

    try:
        payload = MembershipPaymentWebhookIn.model_validate_json(raw_body)
    except ValidationError as exc:
        raise HTTPException(status_code=400, detail=exc.errors()) from exc

    return _process_payment_event_payload(payload, db)


@router.post(
    "/membership-premium/payment/webhook/stripe",
    response_model=MembershipPaymentWebhookOut,
)
async def process_membership_payment_webhook_stripe(
    request: Request,
    db: Session = Depends(get_db),
) -> MembershipPaymentWebhookOut:
    raw_body = await request.body()
    signature = request.headers.get(STRIPE_WEBHOOK_SIGNATURE_HEADER, "")
    _verify_webhook_signature(
        raw_body,
        signature,
        STRIPE_WEBHOOK_SECRET,
        allow_unsigned=ALLOW_UNSIGNED_WEBHOOKS,
        provider_mode="stripe",
    )

    try:
        payload_data = json.loads(raw_body.decode("utf-8"))
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=400, detail="Invalid JSON payload for Stripe webhook.") from exc

    fallback_event_id = f"stripe-{hashlib.sha256(raw_body).hexdigest()[:24]}"
    payload = _normalize_stripe_webhook_payload(payload_data, fallback_event_id)
    return _process_payment_event_payload(payload, db)


@router.post(
    "/membership-premium/payment/webhook/razorpay",
    response_model=MembershipPaymentWebhookOut,
)
async def process_membership_payment_webhook_razorpay(
    request: Request,
    db: Session = Depends(get_db),
) -> MembershipPaymentWebhookOut:
    raw_body = await request.body()
    signature = request.headers.get(RAZORPAY_WEBHOOK_SIGNATURE_HEADER, "")
    _verify_webhook_signature(
        raw_body,
        signature,
        RAZORPAY_WEBHOOK_SECRET,
        allow_unsigned=ALLOW_UNSIGNED_WEBHOOKS,
        provider_mode="simple",
    )

    try:
        payload_data = json.loads(raw_body.decode("utf-8"))
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=400, detail="Invalid JSON payload for Razorpay webhook.") from exc

    fallback_event_id = f"razorpay-{hashlib.sha256(raw_body).hexdigest()[:24]}"
    payload = _normalize_razorpay_webhook_payload(payload_data, fallback_event_id)
    return _process_payment_event_payload(payload, db)


def _serialize_admin_subscription(
    subscription: MembershipSubscription,
    member: Optional[Member],
    plan: Optional[MembershipPlan],
) -> MembershipAdminSubscriptionOut:
    return MembershipAdminSubscriptionOut(
        id=subscription.id,
        member_id=subscription.member_id,
        member_name=member.name if member else "",
        member_email=member.email if member else "",
        member_membership_id=member.membership_id if member else "",
        plan_code=plan.code if plan else "",
        plan_name=plan.name if plan else "",
        status=subscription.status,
        billing_cycle=subscription.billing_cycle,
        current_period_start=subscription.current_period_start,
        current_period_end=subscription.current_period_end,
        cancel_at_period_end=subscription.cancel_at_period_end,
        created_at=subscription.created_at,
        updated_at=subscription.updated_at,
    )


def _serialize_admin_invoice(
    invoice: MembershipInvoice,
    member: Optional[Member],
    plan: Optional[MembershipPlan],
) -> MembershipAdminInvoiceOut:
    return MembershipAdminInvoiceOut(
        id=invoice.id,
        invoice_number=invoice.invoice_number,
        member_id=invoice.member_id,
        member_name=member.name if member else "",
        member_email=member.email if member else "",
        member_membership_id=member.membership_id if member else "",
        subscription_id=invoice.subscription_id,
        plan_code=plan.code if plan else "",
        plan_name=plan.name if plan else "",
        amount_cents=invoice.amount_cents,
        currency=invoice.currency,
        status=invoice.status,
        payment_reference=invoice.payment_reference,
        due_at=invoice.due_at,
        paid_at=invoice.paid_at,
        created_at=invoice.created_at,
    )


@router.get(
    "/membership-premium/admin/subscriptions",
    response_model=list[MembershipAdminSubscriptionOut],
)
def admin_list_membership_subscriptions(
    status_filter: str = Query("", alias="status"),
    limit: int = Query(120, ge=1, le=500),
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_active_user),
) -> list[MembershipAdminSubscriptionOut]:
    query = db.query(MembershipSubscription)
    normalized_status = status_filter.strip().lower()
    if normalized_status:
        query = query.filter(MembershipSubscription.status == normalized_status)

    rows = (
        query.order_by(MembershipSubscription.created_at.desc(), MembershipSubscription.id.desc())
        .limit(limit)
        .all()
    )

    member_ids = {item.member_id for item in rows}
    plan_ids = {item.plan_id for item in rows}
    members_map = {
        item.id: item
        for item in db.query(Member)
        .filter(Member.id.in_(member_ids))
        .all()
    } if member_ids else {}
    plans_map = {
        item.id: item
        for item in db.query(MembershipPlan)
        .filter(MembershipPlan.id.in_(plan_ids))
        .all()
    } if plan_ids else {}

    return [
        _serialize_admin_subscription(item, members_map.get(item.member_id), plans_map.get(item.plan_id))
        for item in rows
    ]


@router.patch(
    "/membership-premium/admin/subscriptions/{subscription_id}/status",
    response_model=MembershipAdminSubscriptionOut,
)
def admin_update_membership_subscription_status(
    subscription_id: int,
    payload: MembershipAdminSubscriptionStatusUpdateIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> MembershipAdminSubscriptionOut:
    subscription = (
        db.query(MembershipSubscription)
        .filter(MembershipSubscription.id == subscription_id)
        .first()
    )
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found.")

    now = _utcnow()
    subscription.status = payload.status

    if payload.cancel_at_period_end is not None:
        subscription.cancel_at_period_end = bool(payload.cancel_at_period_end)

    if payload.status in {"active", "trialing", "past_due"}:
        if not subscription.started_at:
            subscription.started_at = now
        if not subscription.current_period_start:
            subscription.current_period_start = now
        if not subscription.current_period_end:
            subscription.current_period_end = subscription.current_period_start + timedelta(
                days=_billing_days(subscription.billing_cycle)
            )
        subscription.cancelled_at = None

    elif payload.status in {"cancelled", "expired"}:
        subscription.cancel_at_period_end = False
        subscription.cancelled_at = now

    elif payload.status == "pending":
        subscription.current_period_start = None
        subscription.current_period_end = None
        subscription.started_at = None
        subscription.cancelled_at = None

    if payload.status == "cancelled":
        pending_invoices = (
            db.query(MembershipInvoice)
            .filter(
                MembershipInvoice.subscription_id == subscription.id,
                MembershipInvoice.status == "pending",
            )
            .all()
        )
        for invoice in pending_invoices:
            invoice.status = "cancelled"

    _record_payment_event(
        db,
        provider="admin",
        event_id=_new_admin_event_key("subscription-status"),
        event_type="admin.subscription.status",
        invoice_id=None,
        invoice_number="",
        payment_reference=current_user.username,
        status=payload.status,
        processed_at=now,
    )

    db.commit()
    db.refresh(subscription)

    member = db.query(Member).filter(Member.id == subscription.member_id).first()
    plan = db.query(MembershipPlan).filter(MembershipPlan.id == subscription.plan_id).first()
    return _serialize_admin_subscription(subscription, member, plan)


@router.get(
    "/membership-premium/admin/invoices",
    response_model=list[MembershipAdminInvoiceOut],
)
def admin_list_membership_invoices(
    status_filter: str = Query("", alias="status"),
    limit: int = Query(120, ge=1, le=500),
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_active_user),
) -> list[MembershipAdminInvoiceOut]:
    query = db.query(MembershipInvoice)
    normalized_status = status_filter.strip().lower()
    if normalized_status:
        query = query.filter(MembershipInvoice.status == normalized_status)

    rows = (
        query.order_by(MembershipInvoice.created_at.desc(), MembershipInvoice.id.desc())
        .limit(limit)
        .all()
    )

    member_ids = {item.member_id for item in rows}
    plan_ids = {item.plan_id for item in rows}
    members_map = {
        item.id: item
        for item in db.query(Member)
        .filter(Member.id.in_(member_ids))
        .all()
    } if member_ids else {}
    plans_map = {
        item.id: item
        for item in db.query(MembershipPlan)
        .filter(MembershipPlan.id.in_(plan_ids))
        .all()
    } if plan_ids else {}

    return [
        _serialize_admin_invoice(item, members_map.get(item.member_id), plans_map.get(item.plan_id))
        for item in rows
    ]


@router.patch(
    "/membership-premium/admin/invoices/{invoice_id}/status",
    response_model=MembershipAdminInvoiceOut,
)
def admin_update_membership_invoice_status(
    invoice_id: int,
    payload: MembershipAdminInvoiceStatusUpdateIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> MembershipAdminInvoiceOut:
    invoice = db.query(MembershipInvoice).filter(MembershipInvoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found.")

    subscription = (
        db.query(MembershipSubscription)
        .filter(MembershipSubscription.id == invoice.subscription_id)
        .first()
    )
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found for invoice.")

    now = _utcnow()
    normalized_status = _normalize_payment_status(payload.status)

    invoice.status = normalized_status
    if payload.payment_reference:
        invoice.payment_reference = payload.payment_reference

    if normalized_status == "paid":
        invoice.paid_at = payload.paid_at or now

        subscription.status = "active"
        subscription.cancelled_at = None
        subscription.cancel_at_period_end = False
        if not subscription.started_at:
            subscription.started_at = now
        if not subscription.current_period_start:
            subscription.current_period_start = now
        if not subscription.current_period_end:
            subscription.current_period_end = subscription.current_period_start + timedelta(
                days=_billing_days(subscription.billing_cycle)
            )

    elif normalized_status == "pending":
        invoice.paid_at = None

    elif normalized_status in {"cancelled", "failed", "expired"}:
        if subscription.status == "pending":
            subscription.status = "cancelled"
            subscription.cancelled_at = now
            subscription.cancel_at_period_end = False

    _record_payment_event(
        db,
        provider="admin",
        event_id=_new_admin_event_key("invoice-status"),
        event_type="admin.invoice.status",
        invoice_id=invoice.id,
        invoice_number=invoice.invoice_number,
        payment_reference=payload.payment_reference or current_user.username,
        status=invoice.status,
        processed_at=now,
    )

    db.commit()
    db.refresh(invoice)

    member = db.query(Member).filter(Member.id == invoice.member_id).first()
    plan = db.query(MembershipPlan).filter(MembershipPlan.id == invoice.plan_id).first()
    return _serialize_admin_invoice(invoice, member, plan)


@router.get(
    "/membership-premium/admin/metrics",
    response_model=MembershipAdminMetricsOut,
)
def admin_get_membership_premium_metrics(
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_active_user),
) -> MembershipAdminMetricsOut:
    subscriptions = db.query(MembershipSubscription).all()
    invoices = db.query(MembershipInvoice).all()

    active_statuses = {"active", "trialing", "past_due"}
    active_subscriptions = [item for item in subscriptions if item.status in active_statuses]

    plan_ids = {item.plan_id for item in active_subscriptions}
    plans_map = {
        item.id: item
        for item in db.query(MembershipPlan)
        .filter(MembershipPlan.id.in_(plan_ids))
        .all()
    } if plan_ids else {}

    monthly_recurring_revenue_cents = 0
    yearly_recurring_revenue_cents = 0
    for item in active_subscriptions:
        plan = plans_map.get(item.plan_id)
        if not plan:
            continue
        if item.billing_cycle == "monthly":
            monthly_recurring_revenue_cents += int(plan.monthly_price_cents or 0)
        else:
            yearly_recurring_revenue_cents += int(plan.yearly_price_cents or 0)

    total_subscriptions = len(subscriptions)
    total_invoices = len(invoices)
    paid_invoices = [item for item in invoices if item.status == "paid"]
    pending_invoices = [item for item in invoices if item.status == "pending"]
    refunded_invoices = [item for item in invoices if item.status == "refunded"]

    return MembershipAdminMetricsOut(
        total_subscriptions=total_subscriptions,
        active_subscriptions=len(active_subscriptions),
        pending_subscriptions=sum(1 for item in subscriptions if item.status == "pending"),
        suspended_subscriptions=sum(1 for item in subscriptions if item.status == "suspended"),
        cancelled_subscriptions=sum(
            1 for item in subscriptions if item.status in {"cancelled", "expired"}
        ),
        total_invoices=total_invoices,
        paid_invoices=len(paid_invoices),
        pending_invoices=len(pending_invoices),
        refunded_invoices=len(refunded_invoices),
        paid_revenue_cents=sum(int(item.amount_cents or 0) for item in paid_invoices),
        monthly_recurring_revenue_cents=monthly_recurring_revenue_cents,
        yearly_recurring_revenue_cents=yearly_recurring_revenue_cents,
    )


def _normalize_datetime_filter(value: Optional[datetime]) -> Optional[datetime]:
    if not value:
        return None
    if value.tzinfo is None:
        return value
    return value.astimezone(timezone.utc).replace(tzinfo=None)


def _build_membership_payment_event_query(
    db: Session,
    *,
    provider: str,
    event_type: str,
    status_filter: str,
    invoice_number: str,
    subscription_id: Optional[int],
    processed_from: Optional[datetime],
    processed_to: Optional[datetime],
):
    query = db.query(MembershipPaymentEvent)

    provider_filter = provider.strip().lower()
    if provider_filter:
        query = query.filter(MembershipPaymentEvent.provider == provider_filter)

    event_type_filter = event_type.strip().lower()
    if event_type_filter:
        query = query.filter(MembershipPaymentEvent.event_type == event_type_filter)

    status_value = status_filter.strip().lower()
    if status_value:
        query = query.filter(MembershipPaymentEvent.status == status_value)

    invoice_number_filter = invoice_number.strip()
    if invoice_number_filter:
        query = query.filter(MembershipPaymentEvent.invoice_number == invoice_number_filter)

    if subscription_id is not None:
        invoice_ids = [
            invoice_id
            for (invoice_id,) in db.query(MembershipInvoice.id)
            .filter(MembershipInvoice.subscription_id == subscription_id)
            .all()
        ]
        if not invoice_ids:
            return query.filter(MembershipPaymentEvent.id == -1)
        query = query.filter(MembershipPaymentEvent.invoice_id.in_(invoice_ids))

    normalized_from = _normalize_datetime_filter(processed_from)
    normalized_to = _normalize_datetime_filter(processed_to)

    if normalized_from:
        query = query.filter(MembershipPaymentEvent.processed_at >= normalized_from)
    if normalized_to:
        query = query.filter(MembershipPaymentEvent.processed_at <= normalized_to)

    return query


@router.get(
    "/membership-premium/admin/events",
    response_model=list[MembershipPaymentEventOut],
)
def admin_list_membership_payment_events(
    limit: int = Query(80, ge=1, le=300),
    provider: str = Query(""),
    event_type: str = Query(""),
    status_filter: str = Query("", alias="status"),
    invoice_number: str = Query(""),
    subscription_id: Optional[int] = Query(None, ge=1),
    processed_from: Optional[datetime] = Query(None),
    processed_to: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_active_user),
) -> list[MembershipPaymentEvent]:
    if processed_from and processed_to and processed_from > processed_to:
        raise HTTPException(status_code=400, detail="processed_from must be before processed_to.")

    query = _build_membership_payment_event_query(
        db,
        provider=provider,
        event_type=event_type,
        status_filter=status_filter,
        invoice_number=invoice_number,
        subscription_id=subscription_id,
        processed_from=processed_from,
        processed_to=processed_to,
    )

    return (
        query.order_by(MembershipPaymentEvent.processed_at.desc(), MembershipPaymentEvent.id.desc())
        .limit(limit)
        .all()
    )


@router.get("/membership-premium/admin/events/export")
def admin_export_membership_payment_events_csv(
    limit: int = Query(1000, ge=1, le=5000),
    provider: str = Query(""),
    event_type: str = Query(""),
    status_filter: str = Query("", alias="status"),
    invoice_number: str = Query(""),
    subscription_id: Optional[int] = Query(None, ge=1),
    processed_from: Optional[datetime] = Query(None),
    processed_to: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_active_user),
) -> Response:
    if processed_from and processed_to and processed_from > processed_to:
        raise HTTPException(status_code=400, detail="processed_from must be before processed_to.")

    rows = (
        _build_membership_payment_event_query(
            db,
            provider=provider,
            event_type=event_type,
            status_filter=status_filter,
            invoice_number=invoice_number,
            subscription_id=subscription_id,
            processed_from=processed_from,
            processed_to=processed_to,
        )
        .order_by(MembershipPaymentEvent.processed_at.desc(), MembershipPaymentEvent.id.desc())
        .limit(limit)
        .all()
    )

    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(
        [
            "id",
            "provider",
            "event_id",
            "event_type",
            "invoice_id",
            "invoice_number",
            "payment_reference",
            "status",
            "processed_at",
            "created_at",
        ]
    )

    for row in rows:
        writer.writerow(
            [
                row.id,
                row.provider,
                row.event_id,
                row.event_type,
                row.invoice_id,
                row.invoice_number,
                row.payment_reference,
                row.status,
                row.processed_at.isoformat() if row.processed_at else "",
                row.created_at.isoformat() if row.created_at else "",
            ]
        )

    timestamp = _utcnow().strftime("%Y%m%d_%H%M%S")
    filename = f"membership_payment_events_{timestamp}.csv"

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.post(
    "/membership-premium/admin/subscriptions/{subscription_id}/renew",
    response_model=MembershipAdminRenewOut,
)
def admin_renew_membership_subscription(
    subscription_id: int,
    payload: MembershipAdminSubscriptionRenewIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> MembershipAdminRenewOut:
    subscription = (
        db.query(MembershipSubscription)
        .filter(MembershipSubscription.id == subscription_id)
        .first()
    )
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found.")

    member = db.query(Member).filter(Member.id == subscription.member_id).first()
    plan = db.query(MembershipPlan).filter(MembershipPlan.id == subscription.plan_id).first()
    if not member or not plan:
        raise HTTPException(status_code=404, detail="Subscription relationship is incomplete.")

    now = _utcnow()
    billing_cycle = payload.billing_cycle or subscription.billing_cycle or "monthly"
    if billing_cycle not in {"monthly", "yearly"}:
        billing_cycle = "monthly"

    subscription.billing_cycle = billing_cycle
    invoice = _create_pending_invoice(member.id, subscription, plan, billing_cycle, db)

    if payload.activate_now:
        invoice.status = "paid"
        invoice.paid_at = now
        invoice.payment_reference = f"manual-renew-{now:%Y%m%d%H%M%S}"

        period_start = (
            subscription.current_period_end
            if subscription.current_period_end and subscription.current_period_end > now
            else now
        )
        subscription.status = "active"
        subscription.started_at = subscription.started_at or now
        subscription.current_period_start = period_start
        subscription.current_period_end = period_start + timedelta(days=_billing_days(billing_cycle))
        subscription.cancelled_at = None
        subscription.cancel_at_period_end = False
        message = "Subscription renewed and activated immediately."
    else:
        if subscription.status in {"cancelled", "expired", "suspended"}:
            subscription.status = "pending"
            subscription.cancelled_at = None
            subscription.cancel_at_period_end = False
        message = "Renewal invoice created. Activation will follow payment."

    _record_payment_event(
        db,
        provider="admin",
        event_id=_new_admin_event_key("subscription-renew"),
        event_type="admin.subscription.renew",
        invoice_id=invoice.id,
        invoice_number=invoice.invoice_number,
        payment_reference=invoice.payment_reference or current_user.username,
        status=invoice.status,
        processed_at=now,
    )

    db.commit()
    db.refresh(subscription)
    db.refresh(invoice)

    return MembershipAdminRenewOut(
        subscription=_serialize_admin_subscription(subscription, member, plan),
        invoice=_serialize_admin_invoice(invoice, member, plan),
        message=message,
    )


@router.post(
    "/membership-premium/admin/invoices/{invoice_id}/refund",
    response_model=MembershipAdminRefundOut,
)
def admin_refund_membership_invoice(
    invoice_id: int,
    payload: MembershipAdminRefundIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> MembershipAdminRefundOut:
    invoice = db.query(MembershipInvoice).filter(MembershipInvoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found.")

    subscription = (
        db.query(MembershipSubscription)
        .filter(MembershipSubscription.id == invoice.subscription_id)
        .first()
    )
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found for invoice.")

    member = db.query(Member).filter(Member.id == invoice.member_id).first()
    plan = db.query(MembershipPlan).filter(MembershipPlan.id == invoice.plan_id).first()

    now = _utcnow()

    if invoice.status == "refunded":
        return MembershipAdminRefundOut(
            invoice=_serialize_admin_invoice(invoice, member, plan),
            subscription_status=subscription.status,
            message="Invoice is already marked as refunded.",
        )

    if invoice.status != "paid":
        raise HTTPException(status_code=409, detail="Only paid invoices can be refunded.")

    invoice.status = "refunded"
    if payload.payment_reference:
        invoice.payment_reference = payload.payment_reference
    else:
        invoice.payment_reference = f"refund-{invoice.invoice_number}-{now:%Y%m%d%H%M%S}"

    if subscription.status in {"active", "trialing", "past_due", "pending"}:
        subscription.status = "cancelled"
        subscription.cancelled_at = now
        subscription.cancel_at_period_end = False

    _record_payment_event(
        db,
        provider="admin",
        event_id=_new_admin_event_key("invoice-refund"),
        event_type="admin.invoice.refund",
        invoice_id=invoice.id,
        invoice_number=invoice.invoice_number,
        payment_reference=invoice.payment_reference or current_user.username,
        status=invoice.status,
        processed_at=now,
    )

    db.commit()
    db.refresh(invoice)

    return MembershipAdminRefundOut(
        invoice=_serialize_admin_invoice(invoice, member, plan),
        subscription_status=subscription.status,
        message="Invoice refunded and subscription updated.",
    )


@router.get("/membership-portal/subscription/invoices", response_model=list[MembershipInvoiceOut])
def list_membership_invoices(
    member: Member = Depends(get_current_membership_member),
    db: Session = Depends(get_db),
) -> list[MembershipInvoice]:
    return (
        db.query(MembershipInvoice)
        .filter(MembershipInvoice.member_id == member.id)
        .order_by(MembershipInvoice.created_at.desc(), MembershipInvoice.id.desc())
        .all()
    )


@router.get("/membership-portal/cpd-analytics", response_model=MembershipCpdAnalyticsOut)
def get_membership_cpd_analytics(
    member: Member = Depends(get_current_membership_member),
    db: Session = Depends(get_db),
) -> MembershipCpdAnalyticsOut:
    _ensure_member_entitlement(member.id, "cpd.analytics", db)

    records = (
        db.query(MemberCpdRecord)
        .filter(MemberCpdRecord.member_id == member.id)
        .order_by(MemberCpdRecord.attended_on.desc(), MemberCpdRecord.id.desc())
        .all()
    )

    total_credit_hours = sum(int(item.credit_hours or 0) for item in records)
    category_map: dict[str, dict[str, int]] = {}

    for item in records:
        category = (item.category or "General").strip() or "General"
        row = category_map.setdefault(category, {"activities": 0, "credit_hours": 0})
        row["activities"] += 1
        row["credit_hours"] += int(item.credit_hours or 0)

    breakdown = [
        MembershipCpdCategoryStat(
            category=category,
            activities=data["activities"],
            credit_hours=data["credit_hours"],
        )
        for category, data in sorted(category_map.items())
    ]

    return MembershipCpdAnalyticsOut(
        total_activities=len(records),
        total_credit_hours=total_credit_hours,
        recent_activity_title=records[0].title if records else "",
        category_breakdown=breakdown,
    )
