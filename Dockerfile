# Frontend Dockerfile for Railway
FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=5 \
  CMD curl -f http://localhost:3000/ || exit 1

CMD ["sh", "-c", "npx next start -p ${PORT:-3000}"]
