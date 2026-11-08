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
