# 🏎️ F1 Champions App - Docker Setup

### 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │    MongoDB      │
│   (React/Vite)  │◄──►│   (NestJS)      │◄──►│   (Database)    │
│   Port: 3000    │    │   Port: 4000    │    │   Port: 27017   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 📁 Files Created

```
📦 MongoDB Configuration
├── 📄 mongodb-replica.config  # MongoDB replica set configuration
└── 📄 mongodb-init.js  # Unified database & replica set initialization

📦 Docker Configuration
├── 📄 docker-compose.yml          # Main orchestration file
├── 📄 docker.env                  # Environment template
├── 📄 .dockerignore               # Build optimization
├── 📄 docker-start.sh             # Convenient startup script
├── 📄 DOCKER_SETUP.md            # This file
└── 📁 docker/
    ├── 📁 backend/
    │   └── 📄 Dockerfile           # NestJS backend container
    ├── 📁 frontend/
    │   └── 📄 Dockerfile           # React frontend container
    └── 📁 README.md               # Detailed documentation
```

## 🚀 Quick Start

### 1. Start Everything

```bash
# Option 1: Use the convenient script
./docker/docker-start.sh

# Option 2: Use docker-compose directly
docker-compose up -d
```

### 2. Access Your Applications

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **API Health**: http://localhost:4000/api/v1/health
- **MongoDB**: mongodb://localhost:27017/f1_champions_db

### 3. Check Status

```bash
./docker/docker-start.sh status
```

## 🔧 Configuration Details

### Port Mappings

| Service  | Container Port | Host Port | Description     |
|----------|----------------|-----------|-----------------|
| Frontend | 3000           | 3000      | Vite dev server |
| Backend  | 4000           | 4000      | NestJS API      |
| MongoDB  | 27017          | 27017     | Database        |

### Environment Variables

| Variable        | Default                                   | Description                     |
|-----------------|-------------------------------------------|---------------------------------|
| `USE_SEED_DATA` | `true`                                    | Auto-seed database with F1 data |
| `NODE_ENV`      | `development`                             | Environment mode                |
| `DATABASE_URL`  | `mongodb://mongodb:27017/f1_champions_db` | DB connection                   |

## 🔄 Startup Sequence

The containers start in this specific order:

1. **MongoDB** 🗄️

- Starts MongoDB server with replica set configuration
- Runs initialization script
- Sets up replica set (single-node for development)
- Creates collections and indexes
- Health check: `mongosh ping`

2. **Backend** ⚙️

- Waits for MongoDB health check
- Generates OpenAPI types from schema
- Generates Prisma client
- Pushes database schema
- Seeds database (if `USE_SEED_DATA=true`)
- Starts NestJS server
- Health check: `curl /api/v1/health`

3. **Frontend** 🎨

- Waits for backend health check
- Starts Vite dev server
- Health check: `curl localhost:3000`

## 📊 Database Seeding

### Automatic Seeding

When `USE_SEED_DATA=true` (default), the backend will:

1. Generate seed file from `apps/backend/src/scripts/generate-seed.ts`
2. Use your existing mock data from `apps/backend/src/assets/mock-data.json`
3. Populate the database with F1 champions, race winners, drivers, constructors, and circuits

### Manual Control

```bash
# Disable seeding
echo "USE_SEED_DATA=false" > .env
docker-compose restart backend

# Re-enable seeding
echo "USE_SEED_DATA=true" > .env
docker-compose restart backend
```

## 🛠️ Development Commands

### Container Management

```bash
# Start services
./docker/docker-start.sh start

# Stop services
./docker/docker-start.sh stop

# Restart services
./docker/docker-start.sh restart

# View logs
./docker/docker-start.sh logs
./docker/docker-start.sh logs backend

# Check health
./docker/docker-start.sh status

# Clean everything
./docker/docker-start.sh clean
```

### Direct Docker Commands

```bash
# View all containers
docker-compose ps

# Follow logs
docker-compose logs -f backend

# Execute commands in containers
docker exec -it f1-backend bash
docker exec -it f1-mongodb mongosh f1_champions_db

# Rebuild containers
docker-compose up -d --build
```

## 🔍 Health Monitoring

All services include health checks:

- **MongoDB**: Database ping test
- **Backend**: HTTP health endpoint at `v1/api/health`
- **Frontend**: HTTP availability check

Health check results show in:

```bash
docker-compose ps
./docker/docker-start.sh status
```

## 📁 Persistent Data

### MongoDB Volume

- **Name**: `mongodb_data`
- **Type**: Docker managed volume
- **Persistence**: Survives container restarts and deletions
- **Location**: Docker's internal volume storage

### Source Code Mounting

- Live source code is mounted into containers
- Changes reflect immediately (no rebuild needed)
- Excludes `node_modules` to avoid conflicts

## 🐛 Troubleshooting

### Common Issues & Solutions

#### 1. Port Conflicts

```bash
# Check what's using ports
lsof -i :3000
lsof -i :4000
lsof -i :27017

# Solution: Kill processes or change ports in docker-compose.yml
```

#### 2. Database Connection Issues

```bash
# Check MongoDB status
docker-compose logs mongodb
docker exec -it f1-mongodb mongosh --eval "db.adminCommand('ping')"

# Solution: Restart MongoDB
docker-compose restart mongodb
```

#### 3. Backend Won't Start

```bash
# Check backend logs
docker-compose logs backend

# Common solutions:
docker-compose restart backend
docker-compose up -d --build backend
```

#### 4. Type Generation Fails

```bash
# Check if schema exists
ls -la libs/shared/types/src/lib/openapi-schema.yaml

# Manually run type generation
docker exec -it f1-backend ./scripts/generate-types.sh
```

#### 5. Seeding Issues

```bash
# Check seeding logs
docker-compose logs backend | grep -i seed

# Manually run seeding
docker exec -it f1-backend npx prisma db seed
```

### Nuclear Reset

```bash
# Remove everything and start fresh
./docker/docker-start.sh clean
./docker/docker-start.sh start
```
