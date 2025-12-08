# -------------------------
# 1. Build Stage
# -------------------------
# CHANGED: Switched from node:18-alpine to node:18 to fix DNS/EAI_AGAIN errors
FROM node:18 AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --production

COPY . .

# -------------------------
# 2. Production stage
# -------------------------
# CHANGED: Switched from node:18-alpine to node:18
FROM node:18

WORKDIR /app

# Copy the app from the builder stage
COPY --from=builder /app /app

EXPOSE 3000

CMD ["node", "src/server.js"]