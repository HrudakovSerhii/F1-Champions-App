# F1 Champions API - Routes Documentation

## 🏎️ Overview

**Base URL**: `http://localhost:4000/api/v1`  
**API Version**: 1.0.0  
**Description**: API for Formula 1 season champions and race winners data

## 📋 Table of Contents

- [Rate Limiting](#rate-limiting)
- [API Information Routes](#api-information-routes)
- [Health Check Routes](#health-check-routes)
- [Champions Routes](#champions-routes)
- [Race Winners Routes](#race-winners-routes)

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
  "description": "API for Formula 1 season champions and race winners data",
  "documentation": "http://localhost:4000/api/v1/docs",
  "health": "http://localhost:4000/api/v1/health",
  "endpoints": [
    {
      "path": "/champions",
      "method": "GET",
      "description": "Get Formula 1 season champions",
      "tag": "Champions"
    }
  ],
  "features": [
    "Formula 1 Champions Data",
    "Race Winners Information",
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

### GET `/health` (App Controller)

**Summary**: Basic Health Check  
**Description**: Returns basic health status of the API server.

**Response Example**:

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "environment": "development",
  "database": "connected"
}
```

### GET `/f1/champions`

**Summary**: Get All Season Champions  
**Description**: Returns a list of Formula 1 season champions (drivers who won the championship each year). Provides all championship winners from 1950 onwards.

**Query Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `limit` | integer | No | 30 | Maximum number of results (1-100) |
| `offset` | integer | No | 0 | Number of results to skip for pagination |
| `season` | string | No | - | Specific season year (YYYY format) |

**Example Requests**:

```bash
# Get all champions
GET /api/v1/f1/champions

# Get champions with pagination
GET /api/v1/f1/champions?limit=10&offset=20

# Get champion for specific season
GET /api/v1/f1/champions?season=2023
```

**Response Codes**:

- `200` - Successful response
- `400` - Bad request (invalid parameters)
- `500` - Internal server error

**Success Response Example**:

```json
{
  "MRData": {
    "limit": "30",
    "offset": "0",
    "series": "f1",
    "total": "74",
    "StandingsTable": {
      "StandingsLists": [
        {
          "season": "2023",
          "round": "22",
          "DriverStandings": [
            {
              "position": "1",
              "positionText": "1",
              "points": "575",
              "wins": "19",
              "Driver": {
                "driverId": "max_verstappen",
                "givenName": "Max",
                "familyName": "Verstappen",
                "dateOfBirth": "1997-09-30",
                "nationality": "Dutch",
                "url": "http://en.wikipedia.org/wiki/Max_Verstappen"
              },
              "Constructors": [
                {
                  "constructorId": "red_bull",
                  "name": "Red Bull",
                  "nationality": "Austrian",
                  "url": "http://en.wikipedia.org/wiki/Red_Bull_Racing"
                }
              ]
            }
          ]
        }
      ]
    }
  }
}
```

---

### GET `/f1/seasons/{season}/race-winners`

**Summary**: Get Race Winners for a Season  
**Description**: Returns a list of race winners for all races in a specific Formula 1 season.

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `season` | string | Yes | The season year (YYYY format) |

**Query Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `limit` | integer | No | 30 | Maximum number of results (1-100) |
| `offset` | integer | No | 0 | Number of results to skip for pagination |

**Example Requests**:

```bash
# Get all race winners for 2023 season
GET /api/v1/f1/seasons/2023/race-winners

# Get race winners with pagination
GET /api/v1/f1/seasons/2023/race-winners?limit=5&offset=10
```

**Response Codes**:

- `200` - Successful response
- `400` - Bad request (invalid season format)
- `404` - Season not found
- `500` - Internal server error

**Success Response Example**:

```json
{
  "MRData": {
    "limit": "30",
    "offset": "0",
    "series": "f1",
    "total": "22",
    "RaceTable": {
      "season": "2023",
      "Races": [
        {
          "season": "2023",
          "round": "1",
          "raceName": "Bahrain Grand Prix",
          "date": "2023-03-05",
          "time": "15:00:00Z",
          "url": "https://en.wikipedia.org/wiki/2023_Bahrain_Grand_Prix",
          "Circuit": {
            "circuitId": "bahrain",
            "circuitName": "Bahrain International Circuit",
            "url": "http://en.wikipedia.org/wiki/Bahrain_International_Circuit",
            "Location": {
              "lat": "26.0325",
              "long": "50.5106",
              "locality": "Sakhir",
              "country": "Bahrain"
            }
          },
          "Results": [
            {
              "number": "1",
              "position": "1",
              "points": "25",
              "Driver": {
                "driverId": "max_verstappen",
                "givenName": "Max",
                "familyName": "Verstappen",
                "dateOfBirth": "1997-09-30",
                "nationality": "Dutch",
                "url": "http://en.wikipedia.org/wiki/Max_Verstappen"
              },
              "Constructor": {
                "constructorId": "red_bull",
                "name": "Red Bull",
                "nationality": "Austrian",
                "url": "http://en.wikipedia.org/wiki/Red_Bull_Racing"
              },
              "Time": {
                "millis": "5434195",
                "time": "1:30:34.195"
              }
            }
          ]
        }
      ]
    }
  }
}
```

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
- ✅ Pagination support
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

# Test champions endpoint
curl http://localhost:4000/api/v1/f1/champions?limit=5

# Test race winners endpoint
curl http://localhost:4000/api/v1/f1/seasons/2023/race-winners?limit=3
```

---

## 📝 Notes

1. **Data Source**: The API fetches data from the Jolpica F1 API (Ergast API mirror) and caches it in MongoDB
2. **Caching**: Responses are cached to improve performance
3. **Pagination**: All list endpoints support `limit` and `offset` parameters
4. **Validation**: Input parameters are validated according to F1 data standards
5. **CORS**: Configured for development (`localhost:3000`, `localhost:4200`) and production domains
