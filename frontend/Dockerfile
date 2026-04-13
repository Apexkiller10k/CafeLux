FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

FROM node:20-alpine AS app
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

EXPOSE 3000

ENV HOST=0.0.0.0
ENV PORT=3000
ENV CHOKIDAR_USEPOLLING=true

CMD ["npm", "start"]
