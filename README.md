# Tennis String Tracker

A stateful website that tracks the history of tennis racket strings and lets you
share a tracker via a link or QR code that can be placed on the racket.

## Tech stack

- **Backend** – ASP.NET Core (C#) Web API using Entity Framework Core
- **Database** – PostgreSQL, running as its own container
- **Frontend** – React + TypeScript (Vite), served by nginx
- **Containerisation** – Docker / Docker Compose

## Features

- **Landing page (`/`)** – a single "Create tracker" button.
- **Create tracker (`/trackers/new`)** – creates a tracker and shows a shareable
  link (with copy button) and a downloadable QR code to the tracker page.
- **Tracker page (`/trackers/{guid}`)**
  - Shows one or more *string info blocks*, ordered by date of stringing with the
    latest on top. Each block contains horizontal/vertical string weight, string
    model/manufacturer, knotting technique (2 or 4 knots), date of stringing,
    player comments (with an input to add new comments) and a QR code download.
  - An **Edit** button reveals controls to create a new string entry, edit or
    delete existing entries, and delete comments.
  - Marked `noindex, nofollow` and disallowed in `robots.txt` so it is not crawled.
- **History page (`/trackers/{guid}/history`)** – lists every change (create,
  update, delete) including previous and new values, e.g.
  `Horizontal weight: 23 -> 24`, plus the last state of an entry before deletion.
- **Dark / light mode** following the user's system settings, with a
  white/black (light) and black/white (dark) base palette.

## Running with Docker

```bash
# optional: copy and adjust the database password
cp .env.example .env

docker compose up --build
```

Then open:

- Frontend: <http://localhost:3000>
- Backend API (Swagger in development): <http://localhost:8080/swagger>

The database schema is created automatically via EF Core migrations on backend
startup.

## Local development

### Backend

```bash
cd backend
export ConnectionStrings__Default="Host=localhost;Port=5432;Database=tennis;Username=tennis;<password>"
dotnet run
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

By default the frontend calls the API at `/api`. To point it elsewhere during
local development, set `VITE_API_BASE_URL` (e.g. `http://localhost:8080/api`).

## Project structure

```
backend/    ASP.NET Core Web API + EF Core (models, DbContext, migrations)
frontend/   React + TypeScript SPA (pages, components)
docker-compose.yml   db + backend + frontend services
```
