# Backend Environment Setup

This backend reads configuration from `backend/.env` at startup.
Keep real secrets out of git and use `backend/.env.example` as the template.

## Required variables

```env
SECRET_KEY=replace-with-a-strong-random-secret-min-32-chars
ADMIN_USERNAME=replace-admin-username
ADMIN_PASSWORD=replace-admin-password
ACCESS_TOKEN_EXPIRE_MINUTES=120
FRONTEND_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

## Safe local setup

1. Copy `backend/.env.example` to `backend/.env`.
2. Replace the placeholder values with your real deployment secrets.
3. Keep `backend/.env` out of git. `.gitignore` already excludes it.

## Deployment guidance

Use environment variables or a secrets manager in production. Do not commit real credentials.

### PowerShell example

```powershell
$env:SECRET_KEY = 'your-secret'
$env:ADMIN_USERNAME = 'admin@example.com'
$env:ADMIN_PASSWORD = 'your-admin-password'
$env:SUPABASE_URL = 'https://your-project-id.supabase.co'
$env:SUPABASE_KEY = 'your-supabase-anon-key'
$env:SUPABASE_SERVICE_ROLE_KEY = 'your-supabase-service-role-key'
```

### Bash example

```bash
export SECRET_KEY='your-secret'
export ADMIN_USERNAME='admin@example.com'
export ADMIN_PASSWORD='your-admin-password'
export SUPABASE_URL='https://your-project-id.supabase.co'
export SUPABASE_KEY='your-supabase-anon-key'
export SUPABASE_SERVICE_ROLE_KEY='your-supabase-service-role-key'
```

## Lighthouse

Running Lighthouse does not change the website.
It only audits the current frontend and reports issues in Performance, Accessibility, Best Practices, and SEO.

Example:

```bash
npx lighthouse http://localhost:5173 --quiet --output=html --output-path=./lighthouse-report.html --chrome-flags="--headless --disable-gpu"
```