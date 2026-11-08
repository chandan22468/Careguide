# CareGuide backend

FastAPI and MongoDB backend for CareGuide. User accounts authenticate with an
HttpOnly cookie; MongoDB stores account profiles and account-owned care data.

## Requirements

- Python 3.11 or newer
- MongoDB 6.0 or newer (local or hosted)
- Gemini and ImageKit credentials only for the corresponding optional integrations

## Configuration

Copy `.env.example` to `.env` and set `MONGODB_URI` and `MONGODB_DATABASE`.
`CORS_ORIGINS` accepts a comma-separated list of frontend origins.

Optional integrations:

- `GEMINI_API_KEY` and `GEMINI_MODEL` enable `POST /api/v1/ai/chat`.
  The default is `gemini-3.8-flash`, Google's current Flash model. Model access
  still depends on the Google AI project associated with the API key; set
  `GEMINI_MODEL` in `.env` to a model available to that project if needed.
- `AI_GROUNDING_THRESHOLD` controls lexical evidence matching for product and
  FAQ retrieval (default `0.34`, valid range `0` to `1`). It is a relevance
  threshold, not a model confidence score. AI brand context is limited to the
  official Man Matters homepage; unverified demo catalogue records are labeled
  as such and cannot be represented as confirmed product claims.
- `IMAGEKIT_PRIVATE_KEY` enables progress photo upload and deletion.
- `AUTH_JWT_SECRET` must be a random secret of at least 32 characters. Keep it
  private; changing it signs out existing accounts.
- `AUTH_COOKIE_NAME` and `AUTH_COOKIE_MAX_AGE` configure the authentication
  cookie name and lifetime.

These are backend-only secrets. Do not put them in the frontend or commit `.env`.
New accounts require an email and a password of at least 10 characters.
Passwords are hashed with Argon2id and are never stored in browser storage.
Email ownership is not verified because no email-delivery/OTP provider is
configured. Authenticated requests use a signed HttpOnly cookie; CORS must list
the exact frontend origin and allow credentials.
The API starts without Gemini or ImageKit configured; the associated endpoints
return an explicit `503` until their credentials are set.
In local development, a shared demo account (`test@gmail.com` /
`test123456`) is provisioned at startup by default. Demo data and uploaded
photos are shared with anyone using that account; use a personal account for
private data. Set `DEMO_ACCOUNT_ENABLED=false` to disable it. The demo account
is never provisioned when `ENVIRONMENT` is `production` or `prod`.

## Installation and start

From this directory:

```powershell
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Set `MONGODB_URI`, `GEMINI_API_KEY`, and `IMAGEKIT_PRIVATE_KEY` in `.env`
before starting. Never copy real credential values into `.env.example`.

The server is not started as part of this delivery. Once you choose to run it,
interactive API documentation is available at `/docs`; health check is
`/api/v1/health`. MongoDB must be reachable for startup and the API's data routes.

## API contract

All endpoints are prefixed by `/api/v1`. Successful responses return the resource
directly, matching the existing frontend Axios services; errors include `detail`
and a structured error object. Dates are ISO-8601. Care, journal, AI, and support
endpoints require the authenticated account and an account-owned session. The
client-side session ID is only a lookup key; it does not grant access by itself.

| Area | Routes |
|---|---|
| Health | `GET /health` |
| Authentication | `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `POST /auth/logout` |
| Account session | `POST /session`, `GET /session/{sessionId}`, `PUT /session/{sessionId}`, `DELETE /session/{sessionId}` |
| Dashboard | `GET /dashboard?sessionId=...`, `GET /dashboard/analytics?sessionId=...` |
| Catalogue | `GET /products`, `GET /products/{id}`, `GET /products/compare?ids=id1,id2` |
| My Care | `GET/POST /my-products`, `PATCH/DELETE /my-products/{entryId}` |
| Routines | `GET/POST /routines`, `GET /routines/summary`, `PATCH/DELETE /routines/{id}`, `PATCH /routines/{id}/status` |
| Journal | `GET/POST /progress`, `GET/PUT/DELETE /progress/{id}` |
| AI | `POST /ai/chat`, `GET/DELETE /ai/history?sessionId=...`, `GET /ai/suggestions` |
| Uploads | Authenticated ImageKit API: `POST /uploads/progress-photo` (multipart `file`), `POST /uploads/delete` with `{"fileId":"..."}`. |
| Orders | `GET /orders/{orderId}` |
| Support and FAQ | `POST /support/tickets`, `GET /support/tickets?sessionId=...`, `GET /faqs` |

Product listing supports `category`, `search`, `minPrice`, `maxPrice`, `sortBy`,
`page`, and `limit`. Routine and journal reads support `category`, `fromDate`,
and `toDate`.

The order endpoint reads only records in the MongoDB `orders` collection. Support
tickets are demonstration records and are not sent to a real support team. The FAQ
endpoint returns only records marked `isVerified: true`.

## MongoDB collections and catalogue data

Collections are created on startup and indexes are provisioned automatically.
Collections include `users`, `sessions`, `uploads`, `products`, `session_products`, `routines`,
`progress_entries`, `ai_messages`, `activities`, `orders`, `support_tickets`,
and `faqs`.

At startup, the backend idempotently copies the existing frontend demo catalogue
from `app/data/products.json` into MongoDB without overwriting existing product
records. These records are marked `isVerified: false`; the AI will not use them
as verified product evidence. Treat their descriptions as demo content and
confirm current product information with the official source before use. To make
product-grounded AI answers available, add separately verified records with
`isVerified: true`. Product documents use string `id` values and camelCase
fields, for example:

```json
{
  "id": "your-catalogue-id",
  "name": "Verified product name",
  "category": "hair",
  "description": "Description from an approved source.",
  "detailedDescription": null,
  "ingredients": [],
  "benefits": [],
  "usageInstructions": null,
  "precautions": null,
  "faqs": [],
  "price": null,
  "currency": null,
  "imageUrl": null,
  "isVerified": true,
  "sourceName": "Approved source",
  "updatedAt": "2026-01-01T00:00:00Z"
}
```

Seed only verified FAQ answers with `isVerified: true`. Insert explicitly labelled
demonstration orders into `orders` when order lookup data is desired. Use the
`orderId` value as the lookup key (case-insensitive).

## Integration behavior

Gemini requests are sent only by the backend. The model is instructed not to
diagnose, prescribe, promise outcomes, or invent catalogue facts; matched products
and verified FAQs are supplied as context and returned sources identify those
records. A missing key or upstream error is returned as an API error, never a
fabricated answer.

Photo uploads accept JPEG, PNG, or WebP up to `MAX_UPLOAD_BYTES` (10 MiB by
default). ImageKit credentials never leave the backend. The frontend uploads
through the authenticated API; the backend records the ImageKit `fileId` and
owner in MongoDB and progress entries persist both `fileId` and URL. Image
deletion verifies ownership before calling ImageKit.
