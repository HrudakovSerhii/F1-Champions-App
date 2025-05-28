# F1 Champions App - Database Setup & Management

This guide covers database initialization, seeding, and management for the F1 Champions App.

## Prerequisites

- **MongoDB**: Running locally on `mongodb://localhost:27017` or configured via `DATABASE_URL`
  ```bash
  # Start MongoDB (macOS with Homebrew)
  brew services start mongodb-community
  
  # Or start manually
  mongod --config /usr/local/etc/mongod.conf
  
  # Verify MongoDB is running
  mongosh --eval "db.runCommand('ping')"
  ```
- **Node.js**: Version 18+ with npm
- **Prisma**: Included in project dependencies

## Quick Start

### 🚀 Complete Database Setup (Development)

```bash
# Complete setup: initialize DB + generate seed data + populate
npm run db:setup
```

This command will:

1. Generate Prisma client
2. Push schema to database
3. Generate Prisma seed file from mock data
4. Run the seed script to populate the database

### 🧪 Test Database Setup

```bash
# Reset and seed database for testing
npm run db:test:setup
```

## Individual Commands

### Database Initialization

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (creates collections)
npm run db:push

# Initialize database (generate + push)
npm run db:init
```

### Seed Data Generation

```bash
# Generate Prisma seed file (default)
npm run db:seed:generate

# Generate specific format
npm run db:seed:generate:json     # JSON format
npm run db:seed:generate:prisma   # Prisma TypeScript format
npm run db:seed:generate:mongodb  # MongoDB shell script
```

### Database Seeding

```bash
# Run the Prisma seed script
npm run db:seed:run
```

### Database Management

```bash
# Reset database (⚠️ DESTRUCTIVE - removes all data)
npm run db:reset

# Pull schema from database
npm run db:pull

# Open Prisma Studio (database browser)
npm run db:studio
```

## Database Schema

The application uses **MongoDB** with the following collections:

### Core Entities

- **drivers**: F1 drivers with personal information
- **constructors**: F1 teams/constructors
- **circuits**: F1 racing circuits with location data
- **seasons**: F1 seasons by year

### Championship Data

- **season_champions**: Championship winners by season
- **race_winners**: Race winners with detailed race information

## Seed Data

The seed data includes:

- **2 Drivers**: Max Verstappen, Lewis Hamilton
- **2 Constructors**: Red Bull Racing, Mercedes
- **2 Circuits**: Bahrain International Circuit, Jeddah Corniche Circuit
- **4 Season Champions**: 2020-2023 championship data
- **2 Race Winners**: Sample race winner data
- **6 Seasons**: 2018-2023

## Environment Configuration

Configure your database connection in `apps/backend/.env`:

```env
# Database
DATABASE_URL="mongodb://localhost:27017/f1-champions"

# Other configurations...
```

## Development Workflow

### First Time Setup

```bash
# 1. Install dependencies
npm install

# 2. Setup database
npm run db:setup

# 3. Start development server
npm run dev:backend
```

### Daily Development

```bash
# Start with fresh data
npm run db:test:setup

# Or just reset if needed
npm run db:reset && npm run db:seed:run
```

### Schema Changes

```
