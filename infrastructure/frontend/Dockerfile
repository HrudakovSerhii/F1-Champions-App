# Frontend Web App Dockerfile - Improved Version
FROM node:20-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    curl \
    bash

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

# Create improved entrypoint script
RUN echo '#!/bin/bash' > /app/docker-entrypoint.sh && \
    echo 'set -e' >> /app/docker-entrypoint.sh && \
    echo '' >> /app/docker-entrypoint.sh && \
    echo 'echo "🚀 Starting F1 Champions Frontend..."' >> /app/docker-entrypoint.sh && \
    echo '' >> /app/docker-entrypoint.sh && \
    echo '# Environment validation and setup' >> /app/docker-entrypoint.sh && \
    echo 'PORT=${PORT:-3000}' >> /app/docker-entrypoint.sh && \
    echo 'HOST=${HOST:-0.0.0.0}' >> /app/docker-entrypoint.sh && \
    echo 'echo "📡 Frontend will run on: $HOST:$PORT"' >> /app/docker-entrypoint.sh && \
    echo '' >> /app/docker-entrypoint.sh && \
    echo '# Display environment variables (for debugging)' >> /app/docker-entrypoint.sh && \
    echo 'if [ "$NODE_ENV" = "development" ]; then' >> /app/docker-entrypoint.sh && \
    echo '    echo "🔧 Development mode enabled"' >> /app/docker-entrypoint.sh && \
    echo '    echo "🌐 API_BASE_URL: ${API_BASE_URL:-not-set}"' >> /app/docker-entrypoint.sh && \
    echo '    echo "🌐 VITE_API_BASE_URL: ${VITE_API_BASE_URL:-not-set}"' >> /app/docker-entrypoint.sh && \
    echo 'fi' >> /app/docker-entrypoint.sh && \
    echo '' >> /app/docker-entrypoint.sh && \
    echo '# NOTE: Frontend is client-side, no need to wait for backend' >> /app/docker-entrypoint.sh && \
    echo '# Browser will handle API connectivity directly' >> /app/docker-entrypoint.sh && \
    echo '' >> /app/docker-entrypoint.sh && \
    echo '# Start Vite dev server' >> /app/docker-entrypoint.sh && \
    echo 'echo "🎯 Starting Vite development server..."' >> /app/docker-entrypoint.sh && \
    echo 'cd /app/apps/frontend/web-app' >> /app/docker-entrypoint.sh && \
    echo 'exec npx vite --host $HOST --port $PORT' >> /app/docker-entrypoint.sh && \
    chmod +x /app/docker-entrypoint.sh

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:${PORT:-3000} || exit 1

# Set entrypoint
ENTRYPOINT ["/app/docker-entrypoint.sh"]

# Production build stage
FROM base AS build

# Install all dependencies for building
RUN npm ci

# Copy source code
COPY . .

# Accept build arguments for environment variables
ARG VITE_API_BASE_URL
ARG API_BASE_URL
ARG NODE_ENV=production

# Set environment variables for build
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV API_BASE_URL=$API_BASE_URL
ENV NODE_ENV=$NODE_ENV

# Display build environment (for debugging)
RUN echo "🔧 Build environment:" && \
    echo "  NODE_ENV: $NODE_ENV" && \
    echo "  VITE_API_BASE_URL: $VITE_API_BASE_URL" && \
    echo "  API_BASE_URL: $API_BASE_URL"

# Generate test IDs
RUN npm run generate-testids

# Ensure styles library is built
RUN npx nx build frontend-styles

# Build the application with environment variables
RUN npx nx run web-app:build --prod

# Copy fonts
COPY ./scripts/copy-fonts.js ./scripts/
RUN node scripts/copy-fonts.js

# Production nginx stage
FROM nginx:alpine AS production

# Install curl for health check
RUN apk add --no-cache curl gettext

# Copy nginx configuration
COPY ./infrastructure/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output from build stage
COPY --from=build /app/apps/frontend/web-app/dist /usr/share/nginx/html

# Create dynamic health check script
RUN echo '#!/bin/sh' > /usr/local/bin/healthcheck.sh && \
    echo 'PORT=${PORT:-3000}' >> /usr/local/bin/healthcheck.sh && \
    echo 'curl -f http://localhost:$PORT || exit 1' >> /usr/local/bin/healthcheck.sh && \
    chmod +x /usr/local/bin/healthcheck.sh

# Create entrypoint script for nginx
RUN echo '#!/bin/sh' > /docker-entrypoint.sh && \
    echo 'set -e' >> /docker-entrypoint.sh && \
    echo '' >> /docker-entrypoint.sh && \
    echo 'echo "🚀 Starting F1 Champions Frontend (Production)..."' >> /docker-entrypoint.sh && \
    echo '' >> /docker-entrypoint.sh && \
    echo 'PORT=${PORT:-3000}' >> /docker-entrypoint.sh && \
    echo 'echo "📡 Nginx serving on port: $PORT"' >> /docker-entrypoint.sh && \
    echo '' >> /docker-entrypoint.sh && \
    echo '# Nginx configuration already in place' >> /docker-entrypoint.sh && \
    echo '' >> /docker-entrypoint.sh && \
    echo '# Start nginx' >> /docker-entrypoint.sh && \
    echo 'echo "🎯 Starting nginx..."' >> /docker-entrypoint.sh && \
    echo 'exec nginx -g "daemon off;"' >> /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

# Expose port
EXPOSE 3000

# Set default environment variable
ENV PORT=3000

# Health check with dynamic port
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD /usr/local/bin/healthcheck.sh

# Set entrypoint
ENTRYPOINT ["/docker-entrypoint.sh"]
