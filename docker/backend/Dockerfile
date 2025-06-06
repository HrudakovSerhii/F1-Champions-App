# Backend NestJS Dockerfile
FROM node:20-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    curl \
    bash \
    git

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY nx.json ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Development stage
FROM base AS development

# Install all dependencies (including dev dependencies)
RUN npm ci

# Copy source code
COPY . .

# Create entrypoint script
RUN echo '#!/bin/bash' > /app/docker-entrypoint.sh && \
    echo 'set -e' >> /app/docker-entrypoint.sh && \
    echo '' >> /app/docker-entrypoint.sh && \
    echo 'echo "🚀 Starting F1 Champions Backend..."' >> /app/docker-entrypoint.sh && \
    echo '' >> /app/docker-entrypoint.sh && \
    echo '# Generate OpenAPI types' >> /app/docker-entrypoint.sh && \
    echo 'if [ -f "./scripts/generate-types.sh" ]; then' >> /app/docker-entrypoint.sh && \
    echo '    chmod +x ./scripts/generate-types.sh && ./scripts/generate-types.sh' >> /app/docker-entrypoint.sh && \
    echo 'fi' >> /app/docker-entrypoint.sh && \
    echo '' >> /app/docker-entrypoint.sh && \
    echo '# Setup Prisma and database' >> /app/docker-entrypoint.sh && \
    echo 'npm run prisma:generate' >> /app/docker-entrypoint.sh && \
    echo 'npm run prisma:push' >> /app/docker-entrypoint.sh && \
    echo '' >> /app/docker-entrypoint.sh && \
    echo '# Seed database if enabled' >> /app/docker-entrypoint.sh && \
    echo 'if [ "$USE_SEED_DATA" = "true" ]; then' >> /app/docker-entrypoint.sh && \
    echo '    npm run prisma:seed' >> /app/docker-entrypoint.sh && \
    echo 'fi' >> /app/docker-entrypoint.sh && \
    echo '' >> /app/docker-entrypoint.sh && \
    echo '# Start NestJS application' >> /app/docker-entrypoint.sh && \
    echo 'exec npx nx serve @f1-app/backend --host 0.0.0.0' >> /app/docker-entrypoint.sh && \
    chmod +x /app/docker-entrypoint.sh

# Expose port
EXPOSE 4000

# Health check endpoint (you'll need to implement this in your NestJS app)
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:4000/api/v1/health || exit 1

# Set entrypoint
ENTRYPOINT ["/app/docker-entrypoint.sh"]

# Production build stage
FROM base AS build

# Install all dependencies for building
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN cd apps/backend && npx prisma generate

# Build the application
RUN npx nx build @f1-app/backend --prod

# Production runtime stage
FROM node:20-alpine AS production

# Install system dependencies
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY nx.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy build output from build stage
COPY --from=build /app/dist/apps/backend ./dist

# Copy Prisma schema and client
COPY --from=build /app/apps/backend/prisma ./prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma

# Create entrypoint script
RUN echo '#!/bin/sh' > /app/docker-entrypoint.sh && \
    echo 'set -e' >> /app/docker-entrypoint.sh && \
    echo '' >> /app/docker-entrypoint.sh && \
    echo 'echo "🚀 Starting F1 Champions Backend (Production)..."' >> /app/docker-entrypoint.sh && \
    echo '' >> /app/docker-entrypoint.sh && \
    echo '# Step 1: Generate Prisma client if needed' >> /app/docker-entrypoint.sh && \
    echo 'if [ ! -d "./node_modules/.prisma/client" ]; then' >> /app/docker-entrypoint.sh && \
    echo '    echo "🔧 Generating Prisma client..."' >> /app/docker-entrypoint.sh && \
    echo '    cd prisma' >> /app/docker-entrypoint.sh && \
    echo '    npx prisma generate' >> /app/docker-entrypoint.sh && \
    echo '    cd ..' >> /app/docker-entrypoint.sh && \
    echo 'fi' >> /app/docker-entrypoint.sh && \
    echo '' >> /app/docker-entrypoint.sh && \
    echo '# Step 2: Start the production application' >> /app/docker-entrypoint.sh && \
    echo 'echo "🎯 Starting NestJS application..."' >> /app/docker-entrypoint.sh && \
    echo 'exec node dist/main.js' >> /app/docker-entrypoint.sh && \
    chmod +x /app/docker-entrypoint.sh

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:4000/api/v1/health || exit 1

# Set entrypoint
ENTRYPOINT ["/app/docker-entrypoint.sh"]
