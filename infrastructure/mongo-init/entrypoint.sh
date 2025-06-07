#!/bin/bash
set -e

echo "🏁 Starting MongoDB Setup..."

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB to start..."
until mongosh --host mongodb --port 27017 --eval "db.adminCommand('ping')" --quiet >/dev/null 2>&1; do
    echo "MongoDB not ready, waiting..."
    sleep 3
done

echo "✅ MongoDB is running!"

# Step 1: Initialize replica set
echo "🔧 Step 1: Initializing replica set..."
if node scripts/init-replica-set.js; then
    echo "✅ Replica set initialization completed"
else
    echo "❌ Replica set initialization failed"
    exit 1
fi

# Step 2: Wait for replica set to be fully ready
echo "⏳ Waiting for replica set to be ready..."
sleep 10

# Step 3: Run the application setup script
echo "🔧 Step 2: Running application setup..."
if node scripts/mongodb-setup.js; then
    echo "✅ Application setup completed"
else
    echo "❌ Application setup failed"
    exit 1
fi

echo "🎉 MongoDB setup completed successfully!"
exit 0 