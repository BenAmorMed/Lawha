# Multi-stage build for NestJS backend
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source
COPY tsconfig.json ./
COPY src ./src

# Build
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files and node_modules from builder
COPY package.json package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules

# Copy built app from builder
COPY --from=builder /app/dist ./dist

EXPOSE 4000

CMD ["node", "dist/main"]
