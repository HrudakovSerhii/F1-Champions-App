FROM node:20-alpine

# Install system dependencies
RUN apk add --no-cache \
    curl \
    bash \
    git

# Set working directory
WORKDIR /app

# Copy package files and the entire codebase for type generation
COPY package*.json ./
COPY nx.json ./
COPY tsconfig*.json ./
COPY libs/ ./libs/
COPY scripts/ ./scripts/

# Install only necessary dependencies
RUN npm ci

# Create and set permissions for the entrypoint script
RUN echo '#!/bin/bash \n\
set -e \n\
\n\
echo "🏁 Starting Types Generation..." \n\
\n\
# Generate OpenAPI types \n\
if [ -f "./scripts/generate-types.sh" ]; then \n\
    chmod +x ./scripts/generate-types.sh \n\
    echo "🔧 Generating TypeScript types from OpenAPI schema..." \n\
    ./scripts/generate-types.sh \n\
    echo "✅ Types generated successfully!" \n\
else \n\
    echo "❌ generate-types.sh script not found" \n\
    exit 1 \n\
fi \n\
\n\
echo "🎉 Types generation completed!" \n\
exit 0 \n\
' > /app/entrypoint.sh

RUN chmod +x /app/entrypoint.sh

# Set entrypoint
ENTRYPOINT ["/app/entrypoint.sh"] 