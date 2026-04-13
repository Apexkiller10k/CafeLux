@echo off
setlocal

if "%~1"=="" (
  echo Usage: docker-run.bat [up^|dev^|down^|reset^|logs]
  exit /b 1
)

if /I "%~1"=="up" (
  docker compose up --build
  exit /b %errorlevel%
)

if /I "%~1"=="dev" (
  docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
  exit /b %errorlevel%
)

if /I "%~1"=="down" (
  docker compose down
  exit /b %errorlevel%
)

if /I "%~1"=="reset" (
  docker compose down -v
  exit /b %errorlevel%
)

if /I "%~1"=="logs" (
  docker compose logs -f
  exit /b %errorlevel%
)

echo Unknown command: %~1
echo Usage: docker-run.bat [up^|dev^|down^|reset^|logs]
exit /b 1
