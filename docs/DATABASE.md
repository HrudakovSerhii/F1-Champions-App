# F1 Champions App - Database Setup & Management

This guide covers database initialization, seeding, and management for the F1 Champions App.

## Database Configuration

### Docker Setup (Recommended)

The application uses **MongoDB 7.0** with a replica set configuration:

```yaml
# Docker Configuration
Database: f1_champions_local_db
Host Port: 27000 (external access)
Container Port: 27017 (internal)
Replica Set: f1rs
Connection: mongodb://mongodb:27017/f1_champions_local_db?replicaSet=f1rs
```

**Start with Docker:**

```bash
# Start all services (database, backend, frontend)
docker-compose up --build -d

# Check database status
docker-compose logs mongodb

# Access MongoDB shell
docker exec -it f1-mongodb mongosh f1_champions_local_db
```

### Local Development Setup

For local development without Docker:

```bash
# Start MongoDB locally (macOS with Homebrew)
brew services start mongodb-community

# Or start manually with replica set
mongod --replSet f1rs --bind_ip_all

# Verify MongoDB is running
mongosh --eval "db.runCommand('ping')"
```

## Quick Start

### 🚀 Complete Database Setup (Development)

```bash
# Complete setup: initialize DB + generate client + push schema + seed data
npm run prisma:setup
```

This command will:

1. Initialize database with proper indexes
2. Generate Prisma client
3. Push schema to database
4. Run the seed script to populate the database

### 🧪 Test Database Setup

```bash
# Reset and seed database for testing
npm run prisma:test:setup
```

## Available Commands

### Prisma Commands

| Command             | Description                               |
|---------------------|-------------------------------------------|
| `prisma:init`       | Initialize database indexes and structure |
| `prisma:generate`   | Generate Prisma client from schema        |
| `prisma:push`       | Push schema changes to database           |
| `prisma:pull`       | Pull database schema into Prisma          |
| `prisma:reset`      | Reset database (force-reset)              |
| `prisma:seed`       | Seed database with sample F1 data         |
| `prisma:studio`     | Open Prisma Studio GUI                    |
| `prisma:setup`      | Complete setup: init + push + seed        |
| `prisma:test:setup` | Reset and seed database for testing       |
| `prisma:stats`      | Display database statistics               |
| `prisma:verify`     | Verify database schema and structure      |

### MongoDB Commands

| Command           | Description                     |
|-------------------|---------------------------------|
| `db:mongo:start`  | Start MongoDB server            |
| `db:mongo:stop`   | Stop MongoDB server             |
| `db:mongo:status` | Check MongoDB server status     |
| `db:mongo:setup`  | Set up MongoDB with replica set |
| `db:local:setup`  | Start MongoDB and run setup     |

### Database Management

| Command           | Description                     |
|-------------------|---------------------------------|
| `db:safety-check` | Run database safety checks      |
| `db:purge`        | Purge database (⚠️ DESTRUCTIVE) |

## Environment Configuration

### Docker Environment (Automatic)

When using Docker, the database connection is automatically configured:

```env
DATABASE_URL=mongodb://mongodb:27017/f1_champions_local_db?replicaSet=f1rs
MONGODB_DATABASE_NAME=f1_champions_local_db
MONGODB_REPLICA_SET_NAME=f1rs
MONGODB_HOST_NAME=mongodb
```

### Local Development Environment

Configure your database connection in `apps/backend/.env`:

```env
# Database
DATABASE_URL="mongodb://localhost:27017/f1_champions_local_db?replicaSet=f1rs"

# MongoDB Configuration
MONGODB_DATABASE_PORT=27017
MONGODB_DATABASE_NAME=f1_champions_local_db
MONGODB_REPLICA_SET_NAME=f1rs
MONGODB_HOST_NAME=localhost
```

## Development Workflow

### First Time Setup (Docker - Recommended)

```bash
# 1. Start all services
docker-compose up --build -d

# 2. Check services are running
docker-compose ps

# 3. View logs if needed
docker-compose logs backend

# Database setup is automatic with Docker!
```

### First Time Setup (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Start MongoDB
npm run db:mongo:start

# 3. Setup database
npm run prisma:setup

# 4. Start development server
npm run dev:backend
```

### Daily Development

```bash
# Docker (Recommended)
docker-compose up -d

# Or Local Development
npm run db:local:setup
npm run dev:backend
```

### Schema Changes

When you modify the Prisma schema:

```bash
# Push changes to database
npm run prisma:push

# Generate new Prisma client
npm run prisma:generate

# Or do both at once
npm run prisma:generate-and-push
```

## Database Access

### Via Docker

```bash
# MongoDB shell access
docker exec -it f1-mongodb mongosh f1_champions_local_db

# View collections
show collections

# Query data
db.drivers.find().pretty()
db.constructors.find().pretty()
db.season_winners.find().pretty()
```

### Via Prisma Studio

```bash
# Open Prisma Studio (database browser)
npm run prisma:studio
```

Then navigate to http://localhost:5555

## Troubleshooting

### Database Connection Issues

```bash
# Check MongoDB status
docker-compose logs mongodb

# Restart MongoDB
docker-compose restart mongodb

# Check database health
docker exec -it f1-mongodb mongosh --eval "db.adminCommand('ping')"
```

### Schema Sync Issues

```bash
# Force push schema (⚠️ removes data)
npm run prisma:reset

# Verify database structure
npm run prisma:verify

# Check database stats
npm run prisma:stats
```

### Seed Data Issues

```bash
# Re-run seeding
npm run prisma:seed

# Check if data was inserted
docker exec -it f1-mongodb mongosh f1_champions_local_db --eval "db.drivers.count()"
```

## External API Integration

The application integrates with the **Jolpica F1 API**:

- **Base URL**: `https://api.jolpi.ca/ergast/f1`
- **Purpose**: Fetch live F1 data for seeding and updates
- **Rate Limiting**: Respectful API usage with proper delays

For more information about the API integration, see the backend API documentation.
