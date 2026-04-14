# Docker Setup

This repository includes containerization for MongoDB, backend, and frontend.

## Files

- docker-compose.yml
- docker-compose.dev.yml
- backend/Dockerfile
- frontend/Dockerfile
- docker-run.bat
- docker-run.sh

## Services

- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- MongoDB: mongodb://localhost:27017

## Start (production-like)

```bash
docker compose up --build
```

## Start (development with mounted source)

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

## Stop

```bash
docker compose down
```

## Reset (including DB volume)

```bash
docker compose down -v
```

## Vercel Frontend + Remote Backend

- Set `REACT_APP_API_URL` in Vercel Project Settings -> Environment Variables.
- Value should be your backend base URL (for example: `https://your-backend-domain.com`).
- Do not use `http://localhost:5000` in Vercel, because mobile devices treat localhost as the phone itself.
