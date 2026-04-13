# Root placeholder Dockerfile.
# Use service-specific Dockerfiles in backend/ and frontend/.
FROM alpine:3.20
CMD ["echo", "Use docker-compose.yml to run mongodb, backend, and frontend services."]
