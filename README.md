# Systatum Product Registry (Django + DRF + Next.js)

## Challenge & Assessment
You need a small product API where each product stores arbitrary attributes inside a JSON `fields` object. The assessors look for:
1) **Scalability** – design that can grow (JSONB, indexing, stateless API, pooling).
2) **Stack choice** – sensible use of Django + DRF + PostgreSQL + JSONField, and React/Next.js for the UI.
3) **Communication & docs** – clear instructions and rationale.
4) **Judgement** – design decisions explained (why JSONField, why merge updates, etc.).

## Stack Overview
- **Backend:** Django 5, Django REST Framework, PostgreSQL (JSONB via `JSONField`), `psycopg2-binary`.
- **Frontend:** Next.js 14 (App Router), React 18, fetch-based calls to the API.
- **Tests:** Django TestCase + DRF APIClient; Vitest + Testing Library for the frontend (100% thresholds configured).

## Data Model & API Contract
- **Model:** `Product` with `id` (auto), `fields` (JSONField, default `{}`), `created_at`, `updated_at`.
- **Update rule:** `existing.fields.update(request.data["fields"])` – only keys provided are overwritten; missing keys are kept.
- **Endpoints** (both with and without trailing slash are accepted):
  - `POST /api/products/` → body `{ "fields": { ... } }` → response `{ "id": <int>, "fields": { ... } }`
  - `GET /api/products/` → list products
  - `GET /api/products/<id>/`
  - `PUT /api/products/<id>/` → merge update
  - `DELETE /api/products/<id>/` → 204

## Design Decisions (Judgement)
- **Django + DRF:** Rapid scaffold, serializers for validation, generic views for CRUD, easy to test and extend.
- **PostgreSQL JSONB:** Flexible schema for arbitrary product attributes, keeps relational strengths; can add GIN indexes on hot keys and promote common keys to columns later.
- **Merge semantics:** Retail payloads are often partial; merging avoids accidental data loss on update.
- **APPEND_SLASH disabled:** Avoids POST redirect issues; both `/api/products` and `/api/products/` work.
- **Frontend:** Kept a simple Next.js SPA with fetch + form/table layout; proxying `/api/*` to Django during dev.
- **Scalability:** Stateless API → horizontal scale; add PgBouncer for pooling, read replicas for heavy read, caching (Redis) for hot reads, and JSONB indexing for queries.

## Project Structure
```
backend/
  manage.py
  systatum_challenge/        # settings, urls, wsgi
  products/                  # model, serializer, views, urls, tests, template (legacy HTML helper)
frontend/
  app/                       # layout + page (Product Registry dashboard)
  lib/api.js                 # API client
  __tests__/                 # Vitest suites
```

## Running the Backend
Prereq: Python 3.11, PostgreSQL running, correct credentials.
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # PowerShell on Windows
pip install -r requirements.txt

# Configure DB in systatum_challenge/settings.py or via env vars:
# NAME=systatum_db, USER=systatum_user, PASSWORD=..., HOST=127.0.0.1, PORT=5432

.venv\Scripts\python manage.py migrate
.venv\Scripts\python manage.py runserver 0.0.0.0:8000
```
Health check: `curl http://127.0.0.1:8000/api/products/` should return 200 (list).

## Running the Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```
- Default: uses relative `/api/...` which is proxied to Django via Next.js rewrites (to `http://127.0.0.1:8000`).
- If your backend runs elsewhere, set `NEXT_PUBLIC_API_BASE="http://HOST:PORT"` then `npm run dev` again.

## Testing
- **Backend:**  
  ```bash
  cd backend
  .venv\Scripts\python -m coverage run manage.py test
  .venv\Scripts\python -m coverage report   # 100% target on products app
  ```
- **Frontend:**  
  ```bash
  cd frontend
  npm test   # Vitest + Testing Library, 100% thresholds
  ```

## Example API Calls
```bash
# Create
curl -X POST http://127.0.0.1:8000/api/products/ ^
  -H "Content-Type: application/json" ^
  -d "{ \"fields\": { \"name\": \"Ultramie Goreng\", \"price\": 25000 } }"

# List
curl http://127.0.0.1:8000/api/products/

# Get
curl http://127.0.0.1:8000/api/products/1/

# Merge update (only price changes)
curl -X PUT http://127.0.0.1:8000/api/products/1/ ^
  -H "Content-Type: application/json" ^
  -d "{ \"fields\": { \"price\": 25500 } }"

# Delete
curl -X DELETE http://127.0.0.1:8000/api/products/1/
```

## Troubleshooting
- **Failed to fetch / 404:** Ensure backend is running and reachable at the host/port used by the frontend. Restart Next.js dev server after changing `NEXT_PUBLIC_API_BASE`.
- **OPTIONS only:** Means POST/GET not reaching backend; check proxy target and backend address.
- **Trailing slash issues:** Allowed with and without slash; if errors persist, confirm `APPEND_SLASH = False` in settings.
- **psycopg2 missing:** Always use the virtualenv (`.venv\Scripts\python ...`) so the DB driver is available.

## Frontend UX Notes
- “Refresh” reloads products; “New product” clears selection and resets JSON.
- Save creates when nothing is selected; updates when a product is selected.
- Delete removes the row; merge updates only change keys you send in `fields`.
