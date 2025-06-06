#!/usr/bin/env node

/**
 * F1 Champions MongoDB Setup Script
 * Single file that handles environment loading, MongoDB connection, replica set initialization, and database setup
 */

const { MongoClient } = require('mongodb');
const path = require('path');
const fs = require('fs');

class F1MongoDBSetup {
  constructor() {
    this.config = {};
    this.client = null;
    this.admin = null;
  }

  loadEnvironmentVariables() {
    console.log('🏎️  F1 Champions - MongoDB Setup');
    console.log('═'.repeat(60));

    const envPath = path.join(__dirname, '../.env');

    if (!fs.existsSync(envPath)) {
      console.error('❌ .env file not found');
      process.exit(1);
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};

    // Simplified env parsing
    envContent.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, value] = trimmed.split('=', 2);
        envVars[key.trim()] = value.replace(/"/g, '');
      }
    });

    this.config = {
      port: envVars.MONGODB_DATABASE_PORT || '27000',
      dbName: envVars.MONGODB_DATABASE_NAME || 'f1_champions_local_db',
      replicaSet: envVars.MONGODB_REPLICA_SET_NAME || 'f1rs',
      host: envVars.MONGODB_HOST_NAME || 'localhost',
    };

    this.connectionString = `mongodb://${this.config.host}:${this.config.port}/?directConnection=true`;
    this.appConnectionString = `mongodb://${this.config.host}:${this.config.port}/${this.config.dbName}?replicaSet=${this.config.replicaSet}`;
  }

  async connectToMongoDB() {
    console.log('\n🔌 Connecting to MongoDB...');

    try {
      this.client = new MongoClient(this.connectionString);
      await this.client.connect();
      this.admin = this.client.db().admin();
      console.log('✅ Connected to MongoDB');
    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:', error.message);
      console.log('\n💡 Make sure MongoDB is running:');
      console.log(
        `   mongod --port ${this.config.port} --dbpath ./mongodb/data --replSet ${this.config.replicaSet} --fork`
      );
      process.exit(1);
    }
  }

  async initializeReplicaSet() {
    console.log('\n🔧 Initializing replica set...');

    try {
      await this.admin.command({ replSetGetStatus: 1 });
      console.log('✅ Replica set already initialized');
      return true;
    } catch (error) {
      if (!error.message.includes('no replset config')) {
        throw error;
      }
    }

    const replicaSetConfig = {
      _id: this.config.replicaSet,
      members: [
        {
          _id: 0,
          host: `${this.config.host}:${this.config.port}`,
          priority: 1,
        },
      ],
    };

    try {
      const result = await this.admin.command({
        replSetInitiate: replicaSetConfig,
      });

      if (result.ok === 1) {
        console.log('✅ Replica set initialized successfully!');
        await new Promise((resolve) => setTimeout(resolve, 3000));
        return true;
      } else {
        console.error('❌ Failed to initialize replica set:', result);
        return false;
      }
    } catch (error) {
      console.error('❌ Error initializing replica set:', error.message);
      return false;
    }
  }

  async checkDatabaseExists() {
    const db = this.client.db(this.config.dbName);
    const collections = await db.listCollections().toArray();

    if (collections.length > 0) {
      console.log('\n⚠️  Database already exists with collections:');
      collections.forEach((col) => console.log(`  - ${col.name}`));
      console.log('\n💡 To recreate database, run: npm run db:purge');
      return true;
    }

    return false;
  }

  async setupDatabase() {
    console.log('\n🏎️  Setting up F1 Champions database...');

    const db = this.client.db(this.config.dbName);

    try {
      // Create collections and indexes
      const drivers = db.collection('drivers');
      await drivers.createIndex({ driverId: 1 }, { unique: true });
      await drivers.createIndex({ familyName: 1 });
      await drivers.createIndex({ nationality: 1 });

      const constructors = db.collection('constructors');
      await constructors.createIndex({ name: 1 }, { unique: true });
      await constructors.createIndex({ nationality: 1 });

      const seasonWinners = db.collection('season_winners');
      await seasonWinners.createIndex(
        { season: 1, driverId: 1, constructorId: 1 },
        { unique: true }
      );
      await seasonWinners.createIndex({ season: 1 });

      const seasonRaceWinners = db.collection('season_race_winners');
      await seasonRaceWinners.createIndex(
        { season: 1, round: 1, driverId: 1, constructorId: 1 },
        { unique: true }
      );
      await seasonRaceWinners.createIndex({ season: 1 });
      await seasonRaceWinners.createIndex({ round: 1 });

      console.log('✅ Database schema setup completed!');
    } catch (error) {
      console.error('❌ Error setting up database schema:', error.message);
      throw error;
    }
  }

  async run() {
    try {
      this.loadEnvironmentVariables();
      await this.connectToMongoDB();
      const replicaSetReady = await this.initializeReplicaSet();

      if (replicaSetReady) {
        const dbExists = await this.checkDatabaseExists();

        if (!dbExists) {
          await this.setupDatabase();
          console.log(
            '\n🎉 F1 Champions MongoDB setup completed successfully!'
          );
          console.log('🔗 Connection string for your application:');
          console.log(`   ${this.appConnectionString}`);
        }
      } else {
        console.error(
          '❌ Failed to set up replica set, skipping database setup'
        );
        process.exit(1);
      }
    } catch (error) {
      console.error('\n❌ Setup failed:', error.message);
      process.exit(1);
    } finally {
      if (this.client) {
        await this.client.close();
      }
    }
  }
}

// Run if called directly
if (require.main === module) {
  const setup = new F1MongoDBSetup();
  setup.run().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = F1MongoDBSetup;
