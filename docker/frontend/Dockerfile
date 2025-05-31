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
RUN cat > /app/docker-entrypoint.sh << 'EOF'
#!/bin/bash
set -e

echo "🚀 Starting F1 Champions Frontend..."

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..."
until curl -f http://backend:4000/health >/dev/null 2>&1; do
    echo "Backend not ready, waiting..."
    sleep 5
done
echo "✅ Backend is ready!"

# Start the Vite dev server
echo "🎯 Starting Vite dev server..."
cd /app
exec npx nx dev web-app --host 0.0.0.0 --port 3000
EOF

RUN chmod +x /app/docker-entrypoint.sh

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3000 || exit 1

# Set entrypoint
ENTRYPOINT ["/app/docker-entrypoint.sh"]
