# -------------------------
# 1. Build Stage
# -------------------------
FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --production

COPY . .

# -------------------------
# 2. Production stage
# -------------------------
FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app /app

EXPOSE 3000

CMD ["node", "src/server.js"]
