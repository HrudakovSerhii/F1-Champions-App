# Database service

## Database Scripts Usage

```bash
# Check if your environment is safe for database operations
npm run db:safety-check

# Purge all database data (with safety checks)
npm run db:purge

# Initialize database after purge
npm run db:init

# View database content
npm run db:studio
```

## Safety Features

The `db:purge` script includes multiple safety checks:

- ✅ **Environment Check**: Only works in development mode
- ✅ **Database Location**: Must be localhost/127.0.0.1
- ✅ **Database Name**: Accepts 'f1_champions_db' and other safe names
- ✅ **Replica Set Support**: Detects and works with replica sets
- ✅ **User Confirmation**: Requires typing "yes" to proceed
- ✅ **Error Handling**: Graceful failure and rollback

## Your Replica Set Configuration

The scripts detect your MongoDB replica set configuration:

- **Database**: `f1_champions_db`
- **Replica Set**: `f1rs`
- **Host**: `localhost:27017`

This is considered safe for purge operations since:

1. It's running locally (localhost)
2. Database name contains 'f1_champions_db'
3. Environment is set to development

## MongoDB Replica Set Commands

If you need to manage your replica set:

```bash
# Check replica set status
mongosh --eval "rs.status()"

# Connect to your database
mongosh "mongodb://localhost:27017/f1_champions_db?replicaSet=f1rs"

# View collections after purge
mongosh "mongodb://localhost:27017/f1_champions_db?replicaSet=f1rs" --eval "show collections"
``` 
