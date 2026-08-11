# Tennis String Tracker

A stateful website that tracks the history of tennis racket strings and lets you
share a tracker via a link or QR code that can be placed on the racket.

## Tech stack

- **Backend** – ASP.NET Core (C#) Web API using Entity Framework Core
- **Database** – PostgreSQL, running as its own container
- **Frontend** – React + TypeScript (Vite), served by ASP.NET Core
- **Containerisation** – Docker / Docker Compose

## Features

- **Landing page (`/`)** – a single "Create tracker" button.
- **Create tracker (`/trackers/new`)** – creates a tracker and shows a shareable
  link (with copy button) and a downloadable QR code to the tracker page.
- **Tracker page (`/trackers/{guid}`)**
  - Shows one or more *string info blocks*, ordered by date of stringing with the
    latest on top. Each block contains horizontal/vertical string weight, string
    model/manufacturer, knotting technique (2 or 4 knots), date of stringing,
    player comments (with an input to add new comments, each showing the time it
    was created) and a QR code download.
  - An **Edit** button reveals controls to create a new string entry, edit or
    delete existing entries, delete comments and add **stringer comments** –
    internal notes with timestamps that are only shown in the edit view and are
    never returned to players. The edit view also allows changing the tracker's
    edit password or removing it entirely.
  - Marked `noindex, nofollow` and disallowed in `robots.txt` so it is not crawled.
- **History page (`/trackers/{guid}/history`)** – lists every change (create,
  update, delete) including previous and new values, e.g.
  `Horizontal weight: 23 -> 24`, plus the last state of an entry before deletion.
- **Dark / light mode** following the user's system settings, with a
  white/black (light) and black/white (dark) base palette.
- **Localization** in English, German and Czech. The language is taken from the
  browser/system settings (falling back to English for unsupported languages)
  and can be overridden with the switcher in the top right corner. The manual
  choice is stored in `localStorage` and therefore survives a reload.

## Running with the published image (Portainer / Docker Compose)

Every release of this repository is published as a Docker image to the GitHub
Container Registry at `ghcr.io/michamican/tennis-string-tracker`. You can run
the whole application (app + database) without building anything yourself.

Copy and paste the following compose file into a new **Portainer stack** (or
save it as `docker-compose.yml` and run `docker compose up -d`):

```yaml
services:
  db:
    image: postgres:18-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: tennis
      POSTGRES_USER: tennis
      POSTGRES_PASSWORD: change-me # change this to a secure password
    volumes:
      - db-data:/var/lib/postgresql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U tennis -d tennis"]
      interval: 5s
      timeout: 5s
      retries: 10

  app:
    image: ghcr.io/michamican/tennis-string-tracker:latest
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy
    environment:
      ASPNETCORE_ENVIRONMENT: Production
      ConnectionStrings__Default: "Host=db;Port=5432;Database=tennis;Username=tennis;Password=change-me" # use the same password as above
    ports:
      - "8080:8080"

volumes:
  db-data:
```

Make sure to replace both occurrences of `change-me` with a secure password of
your choice. Then open <http://localhost:8080> (or your server's address). The
database schema is created automatically via EF Core migrations on startup.

> **Upgrading from PostgreSQL 16?** PostgreSQL 18 cannot read a data directory
> created by an older major version, and the official image also moved its data
> directory (hence the changed volume mount above). Dump your data with the old
> image (`pg_dump -U tennis tennis > dump.sql`), start the stack with a fresh
> `db-data` volume and restore it (`psql -U tennis tennis < dump.sql`).

Available image tags:

- `latest` – latest stable release
- `preview` – latest pre-release build from `main`
- Specific version tags (e.g. `1.2.3`) for pinning a release

## Running with Docker

```bash
# optional: copy and adjust the database password
cp .env.example .env

docker compose up --build
```

Then open <http://localhost:8080>. The API is available under `/api`.

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
docker-compose.yml   database + combined application services
```
