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
- Protected membership services: `/api/membership-portal/profile`, `/api/membership-portal/cpd-history`, `/api/membership-portal/certificate`

## MySQL Configuration (Optional)

Set `DATABASE_URL` in `backend/.env`, for example:

```env
DATABASE_URL=mysql+pymysql://username:password@localhost:3306/institution_db
```

Then restart backend.
