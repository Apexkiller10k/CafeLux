FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies first for better layer caching
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application files
COPY . .

EXPOSE 5000

# Backend must listen on 0.0.0.0 inside container
ENV HOST=0.0.0.0
ENV PORT=5000

CMD ["npm", "start"]
