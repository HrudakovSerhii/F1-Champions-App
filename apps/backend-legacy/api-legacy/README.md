# F1 Champions API

A NestJS backend application that provides Formula 1 championship data including season champions and race winners.

## 🏗️ Architecture

This application follows a layered architecture based on the C4 model:

### **Presentation Layer (Controllers)**

- `ChampionsController` - Handles `/f1/champions` endpoints
- `RaceWinnersController` - Handles `/f1/seasons/{season}/race-winners` endpoints
- `HealthController` - Provides health check endpoints

### **Business Logic Layer (Services)**

- `ChampionsService` - Business logic for champions data
- `RaceWinnersService` - Business logic for race winners data

### **Data Access Layer**

- `PrismaService` - Database operations with MongoDB
- Repository pattern implementation

### **External Integration Layer**

- `JolpicaF1Service` - Integration with Jolpica F1 API
- `CacheService` - Redis caching layer

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB
- Redis (optional, for caching)

### Installation

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

```bash
cp env.example .env
```

3. Configure your `.env` file:

```env
DATABASE_URL="mongodb://localhost:27017/f1-champions"
REDIS_HOST="localhost"
REDIS_PORT=6379
JOLPICA_F1_API_URL="https://api.jolpi.ca/ergast/f1"
PORT=3000
NODE_ENV="development"
CACHE_TTL=604800
```

4. Generate Prisma client:

```bash
npx prisma generate
```

5. Start the application:

```bash
npm run serve
```

## 📚 API Documentation

Once the application is running, you can access:

- **API Documentation**: http://localhost:3000/api/v1/docs
- **Health Check**: http://localhost:3000/api/v1/health

## 🔄 Data Flow

1. **Initial Load**: On first request, data is fetched from Jolpica F1 API
2. **Caching**: Data is cached in Redis for 1 week
3. **Database Storage**: Data is stored in MongoDB for persistence
4. **Subsequent Requests**: Served from cache or database
5. **Fallback Strategy**: API → Cache → Database → Error

## 🛡️ Features

- **Rate Limiting**: 100 requests per minute
- **Input Validation**: Automatic request validation
- **Error Handling**: Comprehensive error responses
- **Health Checks**: Database connectivity monitoring
- **API Documentation**: Auto-generated Swagger docs
- **CORS Support**: Configured for frontend integration

## 📊 Monitoring

### Health Check Endpoints

- `GET /api/v1/health` - Overall application health
- Monitors database connectivity

### Logging

- Structured logging with NestJS Logger
- Different log levels for development/production
- Request/response logging for debugging

## 🔧 Configuration

### Rate Limiting

- Default: 100 requests per minute
- Configurable via ThrottlerModule

### Caching

- Redis-based caching
- Default TTL: 1 week (604800 seconds)
- Automatic fallback to database

### Database

- MongoDB with Prisma ORM
- Automatic connection management
- Health monitoring included

## 🏷️ API Endpoints

### Champions

- `GET /api/v1/f1/champions` - Get all season champions
  - Query params: `limit`, `offset`, `season`

### Race Winners

- `GET /api/v1/f1/seasons/{season}/race-winners` - Get race winners for a season
  - Path param: `season` (4-digit year)
  - Query params: `limit`, `offset`

### Health

- `GET /api/v1/health` - Application health status

## 🧪 Data Validation Options

The application supports several validation strategies:

1. **Request Validation**: Using class-validator decorators
2. **Response Validation**: Type-safe responses with TypeScript
3. **External API Validation**: Optional validation of Jolpica F1 API responses
4. **Database Validation**: Prisma schema validation

## 📈 Performance

- **Caching Strategy**: Redis for frequently accessed data
- **Database Optimization**: Indexed queries and efficient relations
- **Rate Limiting**: Prevents API abuse
- **Connection Pooling**: Managed by Prisma

## 🔒 Security

- **Input Sanitization**: Automatic with validation pipes
- **Rate Limiting**: Protection against DDoS
- **CORS Configuration**: Restricted origins
- **Error Handling**: No sensitive data exposure 
