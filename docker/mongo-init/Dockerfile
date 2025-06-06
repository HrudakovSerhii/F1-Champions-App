FROM node:20-alpine

# Install system dependencies
RUN apk add --no-cache \
    curl \
    bash \
    mongodb-tools

# Set working directory
WORKDIR /app

# Copy package files and scripts
COPY package*.json ./
COPY scripts/mongodb-setup.js ./scripts/
COPY .env.example ./.env

# Install only the required dependencies
RUN npm ci --only=production --omit=dev

# Create and set permissions for the entrypoint script
RUN echo '#!/bin/bash \n\
set -e \n\
\n\
echo "🏁 Starting MongoDB Setup..." \n\
\n\
# Wait for MongoDB to be ready \n\
echo "⏳ Waiting for MongoDB to start..." \n\
until mongosh --host mongodb --port 27017 --eval "db.adminCommand({ping:1})" &>/dev/null; do \n\
    echo "MongoDB not ready, waiting..." \n\
    sleep 2 \n\
done \n\
\n\
echo "✅ MongoDB is running!" \n\
\n\
# Run the setup script \n\
echo "🔧 Running MongoDB setup script..." \n\
node scripts/mongodb-setup.js \n\
\n\
echo "🎉 MongoDB setup completed!" \n\
exit 0 \n\
' > /app/entrypoint.sh

RUN chmod +x /app/entrypoint.sh

# Set entrypoint
ENTRYPOINT ["/app/entrypoint.sh"] 