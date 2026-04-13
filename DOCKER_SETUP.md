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
