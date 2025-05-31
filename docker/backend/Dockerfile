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
RUN cat > /app/docker-entrypoint.sh << 'EOF'
#!/bin/bash
set -e

echo "🚀 Starting F1 Champions Backend..."

# Step 1: Generate OpenAPI types
echo "📝 Generating OpenAPI types..."
if [ -f "./scripts/generate-types.sh" ]; then
    chmod +x ./scripts/generate-types.sh
    ./scripts/generate-types.sh
else
    echo "⚠️  generate-types.sh not found, skipping type generation"
fi

# Step 2: Generate Prisma client
echo "🔧 Generating Prisma client..."
cd apps/backend
npx prisma generate

# Step 3: Push database schema
echo "📊 Pushing database schema..."
npx prisma db push --accept-data-loss

# Step 4: Seed database if enabled
if [ "$USE_SEED_DATA" = "true" ]; then
    echo "🌱 Seeding database..."

    # Generate seed file
    echo "📝 Generating seed file..."
    npx ts-node --project src/scripts/tsconfig.json src/scripts/generate-seed.ts prisma

    # Run seed
    echo "🚀 Running database seed..."
    npx prisma db seed
else
    echo "⏭️  Skipping database seeding (USE_SEED_DATA=false)"
fi

# Step 5: Start the application
echo "🎯 Starting NestJS application..."
cd /app
exec npx nx serve @f1-app/backend --host 0.0.0.0 --port 4000
EOF

RUN chmod +x /app/docker-entrypoint.sh

# Expose port
EXPOSE 4000

# Health check endpoint (you'll need to implement this in your NestJS app)
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:4000/v1/api/health || exit 1

# Set entrypoint
ENTRYPOINT ["/app/docker-entrypoint.sh"]
