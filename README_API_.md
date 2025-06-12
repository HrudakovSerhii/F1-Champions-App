# F1 Champions API - Routes Documentation

## 🏎️ Overview

**Base URL**: `http://localhost:4000/api/v1`  
**API Version**: 1.0.0  
**Description**: API for retrieving Formula 1 championship data including season winners and season race results

## 📋 Table of Contents

- [Rate Limiting](#rate-limiting)
- [API Information Routes](#api-information-routes)
- [Health Check Routes](#health-check-routes)
- [Seasons Routes](#seasons-routes)

---

## ⚡ Rate Limiting

- **Limit**: 30 requests per minute per IP
- **Window**: 60 seconds
- **Headers**: Rate limit information is included in response headers

---

## 📊 API Information Routes

### GET `/`

**Summary**: Get API Information  
**Description**: Returns comprehensive information about the F1 Champions API including available endpoints, features, and configuration details.

**Response Example**:

```json
{
  "name": "F1 Champions API",
  "version": "1.0.0",
  "description": "API for retrieving Formula 1 championship data including season winners and season race results",
  "documentation": "http://localhost:4000/api/v1/docs",
  "health": "http://localhost:4000/api/v1/health",
  "endpoints": [
    {
      "path": "f1/winners",
      "method": "GET",
      "description": "Get seasons with winners",
      "tag": "Seasons"
    },
    {
      "path": "f1/season/{seasonYear}/winners",
      "method": "GET", 
      "description": "Get season winners",
      "tag": "Seasons"
    }
  ],
  "features": [
    "Formula 1 Season Champions Data",
    "Season Race Winners Information",
    "Health Monitoring",
    "Rate Limiting",
    "CORS Support",
    "Input Validation",
    "Swagger Documentation"
  ],
  "rateLimit": {
    "requests": 30,
    "window": "1 minute"
  }
}
```

---

## 🔧 Health Check Routes

### GET `/v1/health`

**Summary**: Get API health status  
**Description**: Check the health status of the backend API server

**Response Codes**:

- `200` - API is healthy
- `503` - API is unhealthy

**Success Response Example**:

```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2023-12-01T10:30:00Z",
  "version": "1.0.0",
  "uptime": 86400,
  "dependencies": {
    "database": "healthy",
    "cache": "healthy"
  }
}
```

**Unhealthy Response Example**:

```json
{
  "success": false,
  "status": "unhealthy",
  "timestamp": "2023-12-01T10:30:00Z",
  "version": "1.0.0",
  "uptime": 86400,
  "dependencies": {
    "database": "unhealthy",
    "cache": "healthy"
  }
}
```

---

## 🏁 Seasons Routes

### GET `/f1/winners`

**Summary**: Get seasons with winners  
**Description**: Retrieve all F1 seasons with their respective championship winners

**Query Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `minYear` | string | No | - | Minimum season year to filter from (inclusive). Must be 4-digit year (1950-2050) |
| `maxYear` | string | No | - | Maximum season year to filter to (inclusive). Must be 4-digit year (1950-2050) |

**Example Requests**:

```bash
# Get all seasons with winners
GET /api/v1/winners

# Get seasons with winners for specific year range
GET /api/v1/winners?minYear=2020&maxYear=2023
```

**Response Codes**:
- `200` - Successful response
- `500` - Internal server error

**Success Response Example**:

```json
[
  {
    "season": "2023",
    "wins": 15,
    "driver": {
      "familyName": "Verstappen",
      "givenName": "Max",
      "url": "https://example.com/drivers/max_verstappen",
      "nationality": "Dutch",
      "driverId": "max_verstappen"
    },
    "constructor": {
      "name": "Red Bull",
      "url": "https://example.com/constructors/red_bull",
      "nationality": "Austrian"
    }
  }
]
```

### GET `/f1/season/{seasonYear}/winners`

**Summary**: Get season winners  
**Description**: Retrieve all race winners for a specific F1 season

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `seasonYear` | string | Yes | The F1 season year. Must be 4-digit year (1950-2050) |

**Example Requests**:

```bash
# Get race winners for 2023 season
GET /api/v1/f1/season/2023/winners
```

**Response Codes**:

- `200` - Successfully retrieved race winners for the specified season
- `404` - Season not found
- `500` - Internal server error

**Success Response Example**:

```json
[
  {
    "season": "2023",
    "round": 1,
    "wins": 5,
    "points": 347,
    "driver": {
      "familyName": "Verstappen",
      "givenName": "Max",
      "url": "https://example.com/drivers/max_verstappen",
      "nationality": "Dutch",
      "driverId": "max_verstappen"
    },
    "constructor": {
      "name": "Red Bull",
      "url": "https://example.com/constructors/red_bull",
      "nationality": "Austrian"
    }
  }
]
```

**Error Response Example**:

```json
{
  "success": false,
  "errorCode": "SEASON_NOT_FOUND",
  "error": {
    "message": "Season not found",
    "code": "SEASON_NOT_FOUND"
  }
}
```

---

## 📝 Data Models

### Driver

| Field         | Type         | Required | Description               |
|---------------|--------------|----------|---------------------------|
| `familyName`  | string       | Yes      | Driver's family name      |
| `givenName`   | string       | Yes      | Driver's given name       |
| `url`         | string (uri) | Yes      | URL to driver information |
| `nationality` | string       | Yes      | Driver's nationality      |
| `driverId`    | string       | Yes      | Unique driver identifier  |

### Constructor

| Field         | Type         | Required | Description                    |
|---------------|--------------|----------|--------------------------------|
| `name`        | string       | Yes      | Constructor team name          |
| `url`         | string (uri) | Yes      | URL to constructor information |
| `nationality` | string       | Yes      | Constructor's nationality      |

### SeasonWinner

| Field         | Type        | Required | Description             |
|---------------|-------------|----------|-------------------------|
| `season`      | string      | Yes      | The F1 season year      |
| `wins`        | integer     | Yes      | Number of wins          |
| `driver`      | Driver      | Yes      | Driver information      |
| `constructor` | Constructor | Yes      | Constructor information |

### SeasonRaceWinner

| Field         | Type        | Required | Description                |
|---------------|-------------|----------|----------------------------|
| `season`      | string      | Yes      | The F1 season year         |
| `round`       | integer     | Yes      | Round number in the season |
| `wins`        | integer     | Yes      | Number of wins             |
| `points`      | integer     | Yes      | Total points per season    |
| `driver`      | Driver      | Yes      | Driver information         |
| `constructor` | Constructor | Yes      | Constructor information    |

---

## 🔧 Development Information

### Database

- **Type**: MongoDB
- **Connection**: `mongodb://localhost:27017/f1_champions_db`
- **ORM**: Prisma

### Features

- ✅ Rate limiting (30 requests/minute)
- ✅ CORS support
- ✅ Input validation
- ✅ Health monitoring
- ✅ Error handling
- ✅ MongoDB integration
- ✅ Swagger documentation (available at `/docs`)

### Testing

```bash
# Run all backend tests
npm run test:backend

# Test health check
curl http://localhost:4000/api/v1/health

# Test API info
curl http://localhost:4000/api/v1/

# Test seasons winners endpoint
curl http://localhost:4000/api/v1/f1/winners?minYear=2020&maxYear=2023

# Test specific season winners endpoint
curl http://localhost:4000/api/v1/f1/season/2023/winners
```

---

## 📝 Notes

1. **Data Source**: The API fetches data from the Jolpica F1 API (Ergast API mirror) and caches it in MongoDB
2. **Caching**: Responses are cached to improve performance
3. **Validation**: Input parameters are validated according to F1 data standards (4-digit years between 1950-2050)
4. **CORS**: Configured for development (`localhost:3000`, `localhost:4200`) and production domains
5. **Error Handling**: All endpoints return structured error responses with appropriate HTTP status codes
6. **Health Monitoring**: Health endpoint provides detailed status of API and its dependencies
