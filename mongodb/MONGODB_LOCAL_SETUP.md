# Local MongoDB Setup Guide for F1 Champions App

## Installation Steps

### 1. Prerequisites

- [ ] Homebrew installed
- [ ] Command Line Tools for Xcode (updated)

### 2. Install MongoDB Community Edition

```bash
# Add MongoDB tap
brew tap mongodb/brew

# Install MongoDB Community Edition
brew install mongodb-community

# Install MongoDB Compass (GUI tool) - Optional
brew install --cask mongodb-compass
```

### 3. Start MongoDB Service

```bash
# Start MongoDB as a service (runs in background)
brew services start mongodb-community

# Or start manually (runs in foreground)
mongod --config /opt/homebrew/etc/mongod.conf
```

### 4. Verify Installation

```bash
# Check if MongoDB is running
brew services list | grep mongodb

# Connect to MongoDB shell
mongosh

# In mongosh, test the connection
db.adminCommand('ping')
```

## Installation Completion Overview

**MongoDB Community Edition 8.0.9** is now installed and running on your system!

- **Service Status**: ✅ Running
- **Database Created**: ✅ f1_champions_db
- **MongoDB Compass**: ✅ Installed
- **Host**: `localhost`
- **Port**: `27017` (default)
- **Connection String**: `mongodb://localhost:27017/f1_champions_db`

## Configuration for F1 Champions App

### Environment Variables

Update your backend environment variables:

```bash
DATABASE_URL=mongodb://localhost:27017/f1_champions_db
```

## Useful Commands

### Service Management

```bash
# Start MongoDB
brew services start mongodb-community

# Stop MongoDB
brew services stop mongodb-community

# Restart MongoDB
brew services restart mongodb-community

# Check status
brew services list | grep mongodb
```

### Database Operations

```bash
# Connect to MongoDB shell
mongosh

# Show databases
show dbs

# Use F1 Champions database
use f1_champions_db

# Show collections
show collections

# Find documents in a collection
db.drivers.find()
```

## Integration with Your Project

### Option 1: Use Local MongoDB

1. Update your backend configuration to use `mongodb://localhost:27017/f1_champions_db`
2. Start your backend application normally
3. MongoDB will be available locally

### Option 2: Switch Between Local and Docker

You can easily switch between local MongoDB and Docker MongoDB by changing the `DATABASE_URL` environment variable.

**For Local MongoDB:**

```bash
export DATABASE_URL=mongodb://localhost:27017/f1_champions_db
```

**For Docker MongoDB (Similar as for local one):**

```bash
export DATABASE_URL=mongodb://mongodb:27017/f1_champions_db
```
