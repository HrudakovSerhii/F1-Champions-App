# F1 Champions App

F1 Champions List App built for Web and Native devices. Using shared NX.Lib for Tailwind Theme.

## Quick Start - Docker (Recommended)

The fastest way to get started is using Docker:

```bash
# Start all services (frontend, backend, database)
docker-compose up --build

# Start in detached mode
docker-compose up --build -d

# Stop all services
docker-compose down
```

**Services:**

- 🌐 **Frontend**: http://localhost:3000 (React + Vite + Nginx)
- 🚀 **Backend API**: http://localhost:4000/api/v1 (NestJS)
- 📊 **Database**: MongoDB on port 27000 (replica set: f1rs)
- 🩺 **Health Check**: http://localhost:4000/api/v1/health

✅ **CORS is properly configured** - frontend can communicate with backend without issues.

### Port Mappings

| Service  | Container Port | Host Port | Description                |
|----------|----------------|-----------|----------------------------|
| Frontend | 3000           | 3000      | React app (Nginx/Vite)     |
| Backend  | 4000           | 4000      | NestJS API server          |
| MongoDB  | 27017          | 27000     | Database (external: 27000) |

## Quick Start - Development

### Database Setup

**Quick Setup for Development:**

```bash
# Complete database setup (first time)
npm run prisma:setup

# Reset database for testing
npm run prisma:test:setup

# Check database status
npm run prisma:stats
```

**Key Commands:**

- `prisma:setup` - Complete database initialization and seeding
- `prisma:test:setup` - Reset and seed database for testing
- `prisma:studio` - Open database browser (http://localhost:5555)
- `db:mongo:start/stop` - Local MongoDB management

📖 **[Complete Database Guide](docs/DATABASE.md)** - Comprehensive database setup, seeding, and management documentation.

### Development Servers

```bash
# Backend API server
npm run dev:backend

# Web application
npm run dev:web-app

# Mobile application  
npm run dev:mobile-app
```

## Infrastructure & Docker

### Directory Structure

```
📦 F1-Champions-App/
├── 📄 docker-compose.yml          # Main Docker Compose file (root level for convenience)
├── 📁 infrastructure/             # All Docker-related infrastructure files
│   ├── 📁 frontend/
│   │   ├── 📄 Dockerfile           # Frontend React app container
│   │   └── 📄 nginx.conf           # Nginx configuration for production
│   ├── 📁 backend/
│   │   └── 📄 Dockerfile           # Backend NestJS API container
│   ├── 📁 mongo-init/
│   │   ├── 📄 Dockerfile           # MongoDB initialization container
│   │   ├── 📄 entrypoint.sh        # MongoDB setup script
│   │   └── 📄 init-replica-set.js  # MongoDB replica set configuration
│   ├── 📁 types-generator/         # Type generation utilities
│   ├── 📄 docker-compose-replica.yml # Alternative compose for replica set
│   ├── 📄 docker-start.sh          # Docker startup scripts
│   ├── 📄 docker.env               # Environment variables template
│   └── 📄 README.md                # Docker-specific documentation
├── 📁 docs/                        # All documentation files
│   ├── 📄 ARCHITECTURE.md          # System architecture documentation
│   ├── 📄 DATABASE.md              # Database schema and design
│   ├── 📄 DEPLOYMENT.md            # Deployment guides
│   └── 📄 F1-Champions-App.drawio.pdf # Architecture diagrams
├── 📁 apps/                        # Application source code
│   ├── 📁 backend/                 # NestJS backend API
│   └── 📁 frontend/                # React frontend applications
├── 📁 libs/                        # Shared libraries and components
├── 📁 scripts/                     # Database and build scripts
└── 📁 public/                      # Static assets (fonts, images)
```

### CORS Configuration ✅

The backend is configured to accept requests from:

- `http://localhost:3000` (Frontend development)
- `http://frontend:3000` (Docker container communication)
- `http://f1-frontend:3000` (Docker container name)

### Environment Variables

**Frontend:**

- `VITE_API_BASE_URL`: Backend API URL (http://localhost:4000)
- `NODE_ENV`: Environment mode (production)
- `PORT`: Frontend port (3000)

**Backend:**

- `DATABASE_URL`: MongoDB connection string
- `EXTERNAL_API_URL`: Jolpica F1 API URL
- `NODE_ENV`: Environment mode (development)
- `PORT`: Backend port (4000)

### Troubleshooting

#### CORS Issues

If you encounter CORS errors:

1. **Backend CORS Configuration** (`apps/backend/src/constants/constants.ts`):
   ```typescript
   export const CORS_OPTIONS = {
     origin: [
       'http://localhost:3000',    // Frontend dev server
       'http://frontend:3000',     // Docker network
       'http://f1-frontend:3000'   // Container name
     ]
   };
   ```

2. **Test CORS Headers**:
   ```bash
   curl -H "Origin: http://localhost:3000" \
        -H "Access-Control-Request-Method: GET" \
        -H "Access-Control-Request-Headers: X-Requested-With" \
        -X OPTIONS http://localhost:4000/api/v1/health
   ```

#### Common Issues & Solutions

**Port Conflicts:**

```bash
# Check what's using ports
lsof -i :3000
lsof -i :4000
lsof -i :27000

# Kill processes if needed
lsof -ti:3000 | xargs kill -9
```

**Database Connection Issues:**

```bash
# Check MongoDB status
docker-compose logs mongodb

# Restart MongoDB
docker-compose restart mongodb
```

**Docker Container Management:**

```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb

# Clean restart
docker-compose down
docker system prune -a
docker-compose up -d --build

# Access container shell
docker exec -it f1-frontend sh
docker exec -it f1-backend bash
```

📖 **Additional Documentation:**

- **[Architecture Guide](docs/ARCHITECTURE.md)** - System architecture and design patterns
- **[Database Guide](docs/DATABASE.md)** - Database setup and management
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Deployment strategies and guides
