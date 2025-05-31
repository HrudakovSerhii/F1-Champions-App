# MongoDB Replica Set Setup Guide

## Overview

This guide provides instructions for converting your F1 Champions App MongoDB setup to use replica sets. You have two options:

1. **Local MongoDB Replica Set** - Single node replica set for simple local development
2. **Docker MongoDB Replica Set** - Multi-node replica set for more realistic testing

## 🏎️ Option 1: Local MongoDB Replica Set (Single Node)

This creates a single-node replica set using your existing local MongoDB installation.

### Prerequisites

- Local MongoDB installed via Homebrew (already completed ✅)
- MongoDB shell (`mongosh`) available

### Steps

1. **Stop current MongoDB service:**
   ```bash
   brew services stop mongodb-community
   ```

2. **Start MongoDB with replica set configuration:**
   ```bash
   mongod --config mongod-replica.conf
   ```

3. **Initialize the replica set:**
   ```bash
   # In a new terminal
   mongosh --file scripts/setup-replica-set.js
   ```

4. **Update your application connection string:**
   ```bash
   # For local development
   export DATABASE_URL="mongodb://localhost:27017/f1_champions_db?replicaSet=f1rs"
   ```

### Connection Details

- **Replica Set Name:** `f1rs`
- **Connection String:** `mongodb://localhost:27017/f1_champions_db?replicaSet=f1rs`
- **Primary Node:** `localhost:27017`

## 🐳 Option 2: Docker MongoDB Replica Set (Multi-Node)

This creates a 3-node replica set using Docker containers for a more production-like setup.

### Prerequisites

- Docker and Docker Compose installed
- No conflicts on ports 27017, 27018, 27019

### Steps

1. **Stop any existing MongoDB services:**
   ```bash
   # Stop local MongoDB
   brew services stop mongodb-community
   
   # Stop existing Docker containers
   docker-compose down
   ```

2. **Start the replica set:**
   ```bash
   docker-compose -f docker-compose-replica.yml up -d
   ```

3. **Verify replica set status:**
   ```bash
   # Connect to primary node
   docker exec -it f1-mongodb-primary mongosh --eval "rs.status()"
   ```

4. **Your application will automatically connect** using the updated connection string in the docker-compose file.

### Connection Details

- **Replica Set Name:** `f1rs`
- **Primary Node:** `localhost:27017` (mongodb-primary)
- **Secondary Node 1:** `localhost:27018` (mongodb-secondary1)
- **Secondary Node 2:** `localhost:27019` (mongodb-secondary2)
- **Connection String:** `mongodb://localhost:27017,localhost:27018,localhost:27019/f1_champions_db?replicaSet=f1rs`

## 🔧 Configuration Files Created

### Local Setup Files

- `mongod-replica.conf` - MongoDB configuration for replica set
- `scripts/setup-replica-set.js` - Single-node replica set initialization

### Docker Setup Files

- `docker-compose-replica.yml` - Multi-node replica set configuration
- `scripts/init-replica-set.js` - Multi-node replica set initialization

## 📊 Verifying Replica Set

### Check Replica Set Status

```bash
# Local MongoDB
mongosh --eval "rs.status()"

# Docker MongoDB
docker exec -it f1-mongodb-primary mongosh --eval "rs.status()"
```

### Expected Output

```javascript
{
  "set"
:
  "f1rs",
    "myState"
:
  1,  // 1 = PRIMARY, 2 = SECONDARY
    "members"
:
  [
    {
      "_id": 0,
      "name": "localhost:27017",
      "stateStr": "PRIMARY"
    }
    // ... additional members for Docker setup
  ]
}
```

## 🔄 Switching Between Setups

### From Local to Docker

```bash
# Stop local MongoDB
brew services stop mongodb-community

# Start Docker replica set
docker-compose -f docker-compose-replica.yml up -d

# Update DATABASE_URL if needed
```

### From Docker to Local

```bash
# Stop Docker containers
docker-compose -f docker-compose-replica.yml down

# Start local replica set
mongod --config mongod-replica.conf

# Update DATABASE_URL if needed
```

## 🎯 Benefits of Replica Sets

1. **Transactions Support** - Required for multi-document ACID transactions
2. **High Availability** - Automatic failover (in multi-node setups)
3. **Read Scaling** - Distribute read operations across secondary nodes
4. **Data Durability** - Multiple copies of your data
5. **Production Readiness** - Closer to production MongoDB deployments

## 🚨 Important Notes

1. **Connection String Changes** - Make sure to update your application's `DATABASE_URL` to include `?replicaSet=f1rs`
2. **Port Conflicts** - Ensure ports 27017-27019 are available for Docker setup
3. **Data Persistence** - Docker volumes will persist your data between container restarts
4. **Performance** - Single-node replica sets have minimal overhead; multi-node setups require more resources

## 🔍 Troubleshooting

### Common Issues

1. **"not master" errors**
  - Ensure your connection string includes `?replicaSet=f1rs`
  - Check that the replica set is properly initialized

2. **Port conflicts**
  - Stop existing MongoDB services before starting new ones
  - Check what's using ports: `lsof -i :27017`

3. **Docker issues**
  - Ensure Docker daemon is running
  - Check container logs: `docker logs f1-mongodb-primary`

### Health Checks

```bash
# Check if replica set is working
mongosh --eval "db.isMaster()"

# Test transaction support
mongosh --eval "
  session = db.getMongo().startSession();
  session.startTransaction();
  session.getDatabase('f1_champions_db').test.insertOne({test: 1});
  session.commitTransaction();
  print('✅ Transactions working!');
"
```

## 📋 Next Steps

1. Choose your preferred setup (Local or Docker)
2. Follow the setup steps
3. Update your application's connection string
4. Test the replica set functionality
5. Update your team documentation

Choose your preferred option and let me know when you're ready to proceed! 
