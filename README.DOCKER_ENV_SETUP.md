# 🔧 Docker Environment Setup Guide

You need to create the following environment files for your Docker setup to work correctly:

### 1. Root Level `.env` File (necessary for utility scripts)

Create `.env` in your project root with:

```bash
# Database seeding
USE_SEED_DATA=false

# Node environment
NODE_ENV=development

# Database configuration
DATABASE_URL=mongodb://localhost:27000/f1_champions_local_db?replicaSet=f1rs
MONGODB_DATABASE_PORT=27000
MONGODB_DATABASE_NAME=f1_champions_local_db
MONGODB_REPLICA_SET_NAME=f1rs
MONGODB_REPLICA_NODES=1
MONGODB_HOST_NAME=localhost

# Backend configuration
BACKEND_PORT=4000

# Frontend configuration
FRONTEND_PORT=3000
```

### 2. Backend Level `.env` File

Create `apps/backend/.env` with:

```bash
# Database configuration for local development
DATABASE_URL=mongodb://localhost:27000/f1_champions_local_db?replicaSet=f1rs
MONGODB_DATABASE_PORT=27000
MONGODB_DATABASE_NAME=f1_champions_local_db
MONGODB_REPLICA_SET_NAME=f1rs
MONGODB_REPLICA_NODES=1
MONGODB_HOST_NAME=localhost

# Node environment
NODE_ENV=development

# Backend port
PORT=4000

# Enable database seeding
USE_SEED_DATA=false
```

### 3. Frontend Level `.env` File

Create `apps/frontend/web-app/.env` with:
```bash
NODE_ENV=development
FRONTEND_PORT=4000
```
