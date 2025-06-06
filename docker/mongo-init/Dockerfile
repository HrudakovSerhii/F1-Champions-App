FROM mongo:7.0

# Install Node.js on the MongoDB image
RUN apt-get update && apt-get install -y \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files and scripts
COPY package*.json ./
COPY scripts/mongodb-setup.js ./scripts/
COPY docker/mongo-init/init-replica-set.js ./scripts/
COPY docker/mongo-init/entrypoint.sh ./entrypoint.sh
# Environment variables will be passed via docker-compose

# Install only the required dependencies
RUN npm ci --only=production --omit=dev

# Set permissions for the entrypoint script
RUN chmod +x /app/entrypoint.sh

# Set entrypoint
ENTRYPOINT ["/app/entrypoint.sh"] 