#!/usr/bin/env sh
set -eu

cmd="${1:-}"

case "$cmd" in
  up)
    docker compose up --build
    ;;
  dev)
    docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
    ;;
  down)
    docker compose down
    ;;
  reset)
    docker compose down -v
    ;;
  logs)
    docker compose logs -f
    ;;
  *)
    echo "Usage: ./docker-run.sh [up|dev|down|reset|logs]"
    exit 1
    ;;
esac
