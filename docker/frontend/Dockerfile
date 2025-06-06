# Frontend Web App Dockerfile
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

# Create entrypoint script
RUN echo '#!/bin/bash' > /app/docker-entrypoint.sh && \
    echo 'set -e' >> /app/docker-entrypoint.sh && \
    echo '' >> /app/docker-entrypoint.sh && \
    echo 'echo "🚀 Starting F1 Champions Frontend..."' >> /app/docker-entrypoint.sh && \
    echo '' >> /app/docker-entrypoint.sh && \
    echo '# Wait for backend to be ready' >> /app/docker-entrypoint.sh && \
    echo 'until curl -f http://backend:4000/api/v1/health >/dev/null 2>&1; do' >> /app/docker-entrypoint.sh && \
    echo '    sleep 5' >> /app/docker-entrypoint.sh && \
    echo 'done' >> /app/docker-entrypoint.sh && \
    echo '' >> /app/docker-entrypoint.sh && \
    echo '# Start Vite dev server' >> /app/docker-entrypoint.sh && \
    echo 'cd /app/apps/frontend/web-app' >> /app/docker-entrypoint.sh && \
    echo 'exec npx vite --host 0.0.0.0 --port 3000' >> /app/docker-entrypoint.sh && \
    chmod +x /app/docker-entrypoint.sh

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3000 || exit 1

# Set entrypoint
ENTRYPOINT ["/app/docker-entrypoint.sh"]

# Production build stage
FROM base AS build

# Install all dependencies for building
RUN npm ci

# Copy source code
COPY . .

# Ensure styles library is built
RUN npx nx build frontend-styles

# Build the application 
RUN npx nx build web-app --prod

# Copy fonts
COPY ./scripts/copy-fonts.js ./scripts/
RUN node scripts/copy-fonts.js

# Production nginx stage
FROM nginx:alpine AS production

# Install curl for health check
RUN apk add --no-cache curl

# Copy nginx configuration
COPY ./docker/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output from build stage
COPY --from=build /app/dist/apps/frontend/web-app /usr/share/nginx/html

# Create health check script
RUN echo "#!/bin/sh \n\
set -e \n\
curl -f http://localhost:3000 || exit 1 \n\
" > /usr/local/bin/healthcheck.sh && \
chmod +x /usr/local/bin/healthcheck.sh

# Expose port
EXPOSE 3000

# Set environment variable for nginx configuration
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD /usr/local/bin/healthcheck.sh
