# CareGuide

CareGuide is a personal-care companion for exploring the Man Matters demo
catalogue, organizing routines, tracking personal progress, and asking
CareGuide AI questions. It uses a React/Vite frontend, a FastAPI backend,
MongoDB for accounts and app data, Gemini for AI responses, and ImageKit for
progress-photo storage.

> **Demo notice:** The shared demo account and product catalogue are for
> demonstration. Demo account data and photos are shared. Catalogue details
> have not been independently verified and should not be treated as medical
> advice or confirmed current product information.

## Screenshots

Add your screenshots to `docs/screenshots/`, then replace the example paths
below with the screenshot filenames:

<!-- Example: ![Sign-in page](docs/screenshots/sign-in.png) -->
<!-- Example: ![CareGuide dashboard](docs/screenshots/dashboard.png) -->
<!-- Example: ![Product catalogue](docs/screenshots/catalogue.png) -->

## Features

- Sign in or create a personal account.
- Browse and search the existing demo product catalogue.
- Save products to My Care and manage care routines.
- Record progress notes and upload progress photos to ImageKit.
- Keep account, routine, and progress data in MongoDB.
- Ask CareGuide AI about Man Matters and personal-care topics. AI answers
  distinguish verified information from demo catalogue content.

## Requirements

- Windows PowerShell
- Python 3.11 or newer
- Node.js and npm
- MongoDB, running locally or available through MongoDB Atlas

Gemini and ImageKit credentials are needed only for those integrations.

## Setup

### 1. Configure the backend

Open PowerShell in the project folder:

```powershell
cd C:\Users\asus\Desktop\careguide\backend
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
notepad .env
```

In `backend\.env`, set:

- `MONGODB_URI` to your running MongoDB connection string.
- `AUTH_JWT_SECRET` to a private random secret of at least 32 characters.
- `GEMINI_API_KEY` if you want to use CareGuide AI.
- `IMAGEKIT_PRIVATE_KEY` if you want to upload progress photos.

Keep `.env` private; never paste secret values into screenshots, chat, or source
control. The AI and photo-upload features return an error if their credentials
are not configured.

### 2. Install frontend packages

Open a second PowerShell window:

```powershell
cd C:\Users\asus\Desktop\careguide\frontend
npm install
```

## Run the project

Make sure MongoDB is running, then open two PowerShell windows.

**Window 1 — backend**

```powershell
cd C:\Users\asus\Desktop\careguide\backend
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

**Window 2 — frontend**

```powershell
cd C:\Users\asus\Desktop\careguide\frontend
npm run dev
```

Open **http://localhost:3000**. FastAPI documentation is available at
**http://127.0.0.1:8000/docs**.

On local development, the sign-in form is prefilled with the shared demo
credentials:

- Email: `test@gmail.com`
- Password: `test123456`

Anyone using this demo account can see its saved data and photos. Use **Create
Account** for private account data.

## Verify the build

Frontend type-check:

```powershell
cd C:\Users\asus\Desktop\careguide\frontend
npm run lint
```

Frontend production build:

```powershell
npm run build
```

For backend setup details and API notes, see [backend/README.md](backend/README.md).

## Deploy to Vercel

The root `vercel.json` configures one Vercel project with the frontend and
FastAPI backend as separate services. API requests under `/api/` are routed to
FastAPI; all other paths are routed to the Vite frontend. In production, the
frontend uses the same-domain `/api/v1` URL, so no frontend API URL setting is
required.

1. Push the repository to GitHub and import `chandan22468/Careguide` in Vercel.
   Keep the project root set to `.` so Vercel can read the root `vercel.json`.
2. Before deploying, add these environment variables in the Vercel project
   settings for Production (and Preview if you use preview deployments):
   - `MONGODB_URI`: a MongoDB Atlas connection string; a local MongoDB address
     is not reachable by Vercel.
   - `MONGODB_DATABASE`: the database name, for example `careguide`.
   - `ENVIRONMENT`: `production`.
   - `AUTH_JWT_SECRET`: a private random secret of at least 32 characters.
   - `CORS_ORIGINS`: the exact deployed frontend origin, such as
     `https://your-project.vercel.app`.
   - `GEMINI_API_KEY` and `IMAGEKIT_PRIVATE_KEY` if you want to enable AI and
     progress-photo uploads. `GEMINI_MODEL` is optional.
3. Ensure your MongoDB Atlas network access policy allows Vercel's outbound
   connections, or use a secure private network connection supported by your
   plan. Do not expose a database to the entire internet unless you understand
   and accept that risk.
4. Deploy. The health endpoint is available at `/api/v1/health`.

Add all credentials only through Vercel's environment-variable settings, never
to GitHub, frontend `VITE_*` variables, or chat. Any API key previously pasted
into chat should be revoked and replaced before deployment.
