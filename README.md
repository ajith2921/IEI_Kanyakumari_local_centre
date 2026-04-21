# IEI_Kanyakumari_local_centre
Official website and management system for IEI Kanyakumari Local Centre

# IEI Institutional Portal

Production-ready full-stack portal built with React and FastAPI for a public institutional website, admin operations, and protected membership services.

## Core Features

### Public Portal

- Home, About, Members, Gallery, Facilities, Activities, Downloads, Newsletter
- Contact submission workflow
- Membership portal with guided registration, login, and forgot-password
- Member-only actions with secure token-based access

### Admin Portal

- JWT-protected admin authentication
- CRUD management for members, gallery, newsletters, activities, facilities, downloads
- Membership request review and status management
- Contact message moderation
- Image quality audit and auto-fix support

### Membership Portal

- Multi-step account registration
- Member login by membership number, email, or mobile
- Approval-first account activation flow
- Rotating refresh token session strategy
- Password reset token flow
- Login lockout and endpoint throttling safeguards
- Premium plan catalog and subscription scaffolding
- Premium checkout session flow with payment-verified activation
- Entitlement-gated premium CPD analytics endpoint
- Protected profile endpoint
- Protected CPD history endpoint
- Membership certificate download endpoint
- Persistent frontend member session

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, React Router, Axios
- Backend: FastAPI, SQLAlchemy
- Auth: JWT + bcrypt/passlib hashing
- Database: SQLite default, MySQL-compatible via SQLAlchemy URL

## Repository Structure

```
backend/
   auth.py
   database.py
   main.py
   models/
   routes/
   schemas/
   uploads/
   requirements.txt

frontend/
   src/
      admin/
      components/
      context/
      hooks/
      pages/
      services/
   package.json

.gitignore
README.md
```

## Environment Setup

### Backend

Create `backend/.env` from `backend/.env.example`.

Required variables:

- `DATABASE_URL`
- `SECRET_KEY`
- `ACCESS_TOKEN_EXPIRE_MINUTES`
- `FRONTEND_ORIGINS`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`

Optional membership security variables:

- `MEMBERSHIP_ACCESS_TOKEN_EXPIRE_MINUTES`
- `MEMBERSHIP_LOCKOUT_MAX_ATTEMPTS`
- `MEMBERSHIP_LOCKOUT_MINUTES`
- `MEMBERSHIP_REFRESH_TOKEN_EXPIRY_DAYS`
- `MEMBERSHIP_RESET_TOKEN_EXPIRY_MINUTES`
- `MEMBERSHIP_EXPOSE_RESET_TOKEN` (recommended `false` except local testing)
- `MEMBERSHIP_LOGIN_THROTTLE_LIMIT`
- `MEMBERSHIP_LOGIN_THROTTLE_WINDOW_SECONDS`
- `MEMBERSHIP_FORGOT_THROTTLE_LIMIT`
- `MEMBERSHIP_FORGOT_THROTTLE_WINDOW_SECONDS`
- `MEMBERSHIP_RESET_THROTTLE_LIMIT`
- `MEMBERSHIP_RESET_THROTTLE_WINDOW_SECONDS`
- `MEMBERSHIP_REFRESH_THROTTLE_LIMIT`
- `MEMBERSHIP_REFRESH_THROTTLE_WINDOW_SECONDS`
- `MEMBERSHIP_THROTTLE_CLEANUP_SECONDS`

Optional premium billing variables:

- `MEMBERSHIP_PAYMENT_PROVIDER`
- `MEMBERSHIP_PAYMENT_CHECKOUT_BASE_URL`
- `MEMBERSHIP_PAYMENT_WEBHOOK_SECRET`
- `MEMBERSHIP_PAYMENT_WEBHOOK_SIGNATURE_HEADER`
- `MEMBERSHIP_PAYMENT_ALLOW_UNSIGNED_WEBHOOKS`
- `MEMBERSHIP_PAYMENT_STRIPE_WEBHOOK_SECRET`
- `MEMBERSHIP_PAYMENT_STRIPE_SIGNATURE_HEADER`
- `MEMBERSHIP_PAYMENT_RAZORPAY_WEBHOOK_SECRET`
- `MEMBERSHIP_PAYMENT_RAZORPAY_SIGNATURE_HEADER`
- `MEMBERSHIP_PAYMENT_STRIPE_PUBLISHABLE_KEY`
- `MEMBERSHIP_PAYMENT_RAZORPAY_KEY_ID`

Notes:

- `SECRET_KEY` must be explicitly set. Backend startup fails if it is missing/weak default.
- Admin seed user is created only when both `ADMIN_USERNAME` and `ADMIN_PASSWORD` are provided.

### Frontend

Create `frontend/.env` from `frontend/.env.example`.

Required variables:

- `VITE_API_URL`
- `VITE_UPLOADS_BASE_URL`

## Local Development

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend URL: `http://localhost:8000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend URL: `http://localhost:5173`

## Production Build Checks

```bash
cd frontend
npm run build

cd ../backend
python -m compileall .
```

## Membership Smoke Test

Run the local membership hardening smoke flow (register -> admin approve -> login -> refresh rotation -> forgot-password -> logout):

```bash
cd backend
python scripts/membership_smoke_test.py
```

To force full reset-password validation, expose reset token only for local testing:

```bash
set MEMBERSHIP_EXPOSE_RESET_TOKEN=true
python scripts/membership_smoke_test.py --require-reset-token
```

## Membership Premium Smoke Test

Run the premium billing flow smoke test (register -> admin approve -> premium checkout -> payment webhook activation -> admin metrics/events -> renew/refund):

```bash
cd backend
python scripts/membership_premium_smoke_test.py
```

Optional flags:

- `--billing-cycle monthly|yearly` (default `monthly`)
- `--skip-webhook` to skip payment activation checks
- `--skip-admin-ops` to skip renew/refund checks

If webhook checks are enabled, ensure either:

- `MEMBERSHIP_PAYMENT_WEBHOOK_SECRET` is configured, or
- `MEMBERSHIP_PAYMENT_ALLOW_UNSIGNED_WEBHOOKS=true` is enabled for local testing.

## Security and Git Hygiene

- No secrets should be committed.
- `.env` files are ignored by Git.
- Generated artifacts are ignored:
   - `node_modules/`, `dist/`, `build/`
   - `.venv/`, `__pycache__/`, `.pytest_cache/`
   - local sqlite databases (`*.db`)

## Main API Groups

- Admin auth: `/api/auth/*`
- Public resources: `/api/members`, `/api/gallery`, `/api/newsletters`, `/api/activities`, `/api/facilities`, `/api/downloads`
- Contact and membership requests: `/api/contact`, `/api/membership`
- Membership portal auth: `/api/register`, `/api/login`, `/api/forgot-password`
- Membership session and recovery: `/api/membership-portal/token/refresh`, `/api/membership-portal/reset-password`, `/api/membership-portal/logout`
- Premium plans and subscriptions: `/api/membership-premium/plans`, `/api/membership-portal/subscription`, `/api/membership-portal/subscription/select`, `/api/membership-portal/subscription/invoices`
- Premium checkout and payment webhooks: `/api/membership-portal/subscription/checkout`, `/api/membership-premium/payment/webhook`, `/api/membership-premium/payment/webhook/stripe`, `/api/membership-premium/payment/webhook/razorpay`
- Premium admin billing operations: `/api/membership-premium/admin/metrics`, `/api/membership-premium/admin/events` (supports `limit`, `provider`, `event_type`, `status`, `invoice_number`, `subscription_id`, `processed_from`, `processed_to` query filters), `/api/membership-premium/admin/events/export` (CSV export with same filters), `/api/membership-premium/admin/subscriptions`, `/api/membership-premium/admin/subscriptions/{id}/status`, `/api/membership-premium/admin/subscriptions/{id}/renew`, `/api/membership-premium/admin/invoices`, `/api/membership-premium/admin/invoices/{id}/status`, `/api/membership-premium/admin/invoices/{id}/refund`
- Premium analytics: `/api/membership-portal/cpd-analytics`
- Protected membership services: `/api/membership-portal/profile`, `/api/membership-portal/cpd-history`, `/api/membership-portal/certificate`

Note: Premium entitlements activate only after a verified payment webhook marks the related invoice as paid.

Premium plan note:

- `PREMIUM_CHARTERED_PRO` is seeded to cover CEng/PEng-oriented professional authority outcomes, including consultancy practice support, approval workflow support, legal/technical role pathways, advanced resources, CPD/events, networking, career visibility, R&D grants, and guest-house concessions.

## MySQL Configuration (Optional)

Set `DATABASE_URL` in `backend/.env`, for example:

```env
DATABASE_URL=mysql+pymysql://username:password@localhost:3306/institution_db
```

Then restart backend.
