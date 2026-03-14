# Kryn

This project is a Node.js CMS backend that serves a built Vite frontend.

## Prerequisites

- Node.js 22 or newer
- npm

## Install

From the repository root:

```bash
npm run install:all
```

This installs dependencies for both `backend` and `frontend`.

## Environment variables

The backend reads these values at startup:

```env
PORT=4000
SESSION_SECRET=replace-this-in-real-environments
DB_FILE=./data/cms.sqlite
UPLOADS_DIR=./uploads
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=ChangeMeNow123!
```

Notes:

- `PORT` defaults to `4000`
- `DB_FILE` defaults to `backend/data/cms.sqlite`
- `UPLOADS_DIR` defaults to `backend/uploads`
- `ADMIN_EMAIL` and `ADMIN_PASSWORD` are used by the database init script

## Run locally

### Simplest way

From the repository root:

```bash
npm run dev
```

What this does:

1. Builds the frontend into `frontend/dist`
2. Starts the backend
3. Serves the app at `http://localhost:4000`

This is the easiest way to run the full app, but it does not watch frontend files for changes.

### Backend-only development mode

If you already built the frontend once, you can run the backend in watch mode:

```bash
cd backend
npm run dev
```

Before using that mode the first time, build the frontend from the repository root:

```bash
npm run build
```

## Database setup

The repository already contains a SQLite database at `backend/data/cms.sqlite`.

If you need to initialize a fresh database with the default admin user:

```bash
cd backend
npm run db:init
```

## Optional seed commands

Seed content from the legacy JSON source:

```bash
cd backend
npm run db:seed
```

Seed image records into the media table:

```bash
npm run db:seed:images
```

## Production build

Build the frontend from the repository root:

```bash
npm run build
```

Start the production server from the repository root:

```bash
npm start
```

## Render deployment

The Render service is configured in `render.yaml`.

- Build command: `npm run install:all && npm run build`
- Start command: `npm start`
- Health check: `/api/health`

## Default local URL

After startup, open:

```text
http://localhost:4000
```