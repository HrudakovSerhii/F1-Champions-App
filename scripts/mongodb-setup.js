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

    const envPath = path.join(__dirname, '../.env.local');
    console.log(`🔍 Loading environment from: ${envPath}`);

    if (!fs.existsSync(envPath)) {
      console.error('❌ .env.local file not found');
      console.log('💡 Please create .env.local with MongoDB configuration');
      process.exit(1);
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};

    envContent.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').replace(/"/g, '');
          envVars[key.trim()] = value;
        }
      }
    });

    // Set configuration
    this.config = {
      port: envVars.MONGODB_DATABASE_PORT || '27000',
      dbName: envVars.MONGODB_DATABASE_NAME || 'f1_champions_local_db',
      replicaSet: envVars.MONGODB_REPLICA_SET_NAME || 'f1rs',
      host: envVars.MONGODB_HOST_NAME || 'localhost',
      nodeCount: parseInt(envVars.MONGODB_REPLICA_NODES || '1'),
      isDocker: envVars.DOCKER_ENV === 'true',
    };

    console.log('📋 Configuration loaded:');
    Object.entries(this.config).forEach(([key, value]) => {
      console.log(`  ✅ ${key}: ${value}`);
    });

    this.connectionString = `mongodb://${this.config.host}:${this.config.port}/?directConnection=true`;
    this.appConnectionString = `mongodb://${this.config.host}:${this.config.port}/${this.config.dbName}?replicaSet=${this.config.replicaSet}`;
  }

  async connectToMongoDB() {
    console.log('\n🔌 Connecting to MongoDB...');
    console.log(`   Host: ${this.config.host}:${this.config.port}`);

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
      // Check if replica set is already initialized
      const status = await this.admin.command({ replSetGetStatus: 1 });
      console.log('ℹ️  Replica set is already initialized');
      return true;
    } catch (error) {
      if (error.message.includes('no replset config')) {
        console.log('📦 Setting up new replica set...');
      } else {
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
        console.log(`📊 Replica set: ${this.config.replicaSet}`);
        console.log(`🔗 Member: ${this.config.host}:${this.config.port}`);

        // Wait for replica set to stabilize
        console.log('⏳ Waiting for replica set to stabilize...');
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

  async setupDatabase() {
    console.log('\n🏎️  Setting up F1 Champions database...');

    const db = this.client.db(this.config.dbName);

    console.log('📊 Creating collections and indexes...');

    // Drivers collection
    const drivers = db.collection('drivers');
    await drivers.createIndex({ driverId: 1 }, { unique: true });
    await drivers.createIndex({ familyName: 1 });
    await drivers.createIndex({ nationality: 1 });

    // Constructors collection
    const constructors = db.collection('constructors');
    await constructors.createIndex({ name: 1 }, { unique: true });
    await constructors.createIndex({ nationality: 1 });

    // Season Winners collection
    const seasonWinners = db.collection('season_winners');
    await seasonWinners.createIndex(
      { season: 1, driverId: 1, constructorId: 1 },
      { unique: true }
    );
    await seasonWinners.createIndex({ season: 1 });

    // Season Race Winners collection
    const seasonRaceWinners = db.collection('season_race_winners');
    await seasonRaceWinners.createIndex(
      { season: 1, driverId: 1, constructorId: 1 },
      { unique: true }
    );
    await seasonRaceWinners.createIndex({ season: 1 });
    await seasonRaceWinners.createIndex({ round: 1 });

    console.log('✅ Database setup completed!');
    console.log('📋 Created collections (matching Prisma schema):');
    console.log(
      '  - drivers (with indexes on driverId, familyName, nationality)'
    );
    console.log('  - constructors (with indexes on name, nationality)');
    console.log(
      '  - season_winners (with indexes on season+driverId+constructorId, season)'
    );
    console.log(
      '  - season_race_winners (with indexes on season+driverId+constructorId, season, round)'
    );
  }

  async run() {
    try {
      this.loadEnvironmentVariables();
      await this.connectToMongoDB();
      const replicaSetReady = await this.initializeReplicaSet();

      if (replicaSetReady) {
        await this.setupDatabase();

        console.log('\n🎉 F1 Champions MongoDB setup completed successfully!');
        console.log('🔗 Connection string for your application:');
        console.log(`   ${this.appConnectionString}`);
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
