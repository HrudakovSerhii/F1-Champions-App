// MongoDB Consolidated Initialization Script
// This script handles both database initialization and replica set setup
// It detects the environment and configures accordingly

// Environment detection
const isDockerEnv = process.env.DOCKER_ENV === 'true' || false;
const replicaSetName = process.env.REPLICA_SET_NAME || 'f1rs';
const nodeCount = parseInt(process.env.REPLICA_NODES || '1');
const databaseName = process.env.DATABASE_NAME || 'f1_champions_db';

print('🚀 F1 Champions MongoDB Consolidated Initialization...');
print(`📊 Environment: ${isDockerEnv ? 'Docker' : 'Local'}`);
print(`🔗 Replica Set: ${replicaSetName}`);
print(`📦 Database: ${databaseName}`);
print(`🏗️  Node Count: ${nodeCount}`);

// Function to initialize replica set
function initializeReplicaSet() {
  try {
    print('\n🔧 Initializing replica set...');

    let config;

    if (isDockerEnv && nodeCount === 3) {
      // Docker 3-node replica set configuration
      config = {
        _id: replicaSetName,
        members: [
          {
            _id: 0,
            host: 'mongodb-primary:27017',
            priority: 2,
          },
          {
            _id: 1,
            host: 'mongodb-secondary1:27017',
            priority: 1,
          },
          {
            _id: 2,
            host: 'mongodb-secondary2:27017',
            priority: 1,
          },
        ],
      };
    } else {
      // Single-node replica set configuration (local or Docker single)
      const hostname = isDockerEnv ? 'mongodb:27017' : 'localhost:27017';
      config = {
        _id: replicaSetName,
        members: [
          {
            _id: 0,
            host: hostname,
            priority: 1,
          },
        ],
      };
    }

    const result = rs.initiate(config);

    if (result.ok === 1) {
      print('✅ Replica set initialized successfully!');
      print(`📊 Replica set name: ${replicaSetName}`);

      if (config.members.length === 3) {
        print('🔗 Primary: mongodb-primary:27017');
        print('🔗 Secondary 1: mongodb-secondary1:27017');
        print('🔗 Secondary 2: mongodb-secondary2:27017');

        // Wait for the replica set to stabilize
        print('\n⏳ Waiting for replica set to stabilize...');
        sleep(10000);
      } else {
        print(`🔗 Member: ${config.members[0].host}`);
        sleep(3000);
      }

      // Check replica set status
      print('\n📈 Checking replica set status...');
      const status = rs.status();
      print('🎯 Current replica set state: ' + status.myState);

      if (status.myState === 1) {
        print('✅ This node is now the PRIMARY');
        return true;
      }
    } else {
      print('❌ Failed to initialize replica set:');
      printjson(result);
      return false;
    }
  } catch (error) {
    if (error.message.includes('already initialized')) {
      print('ℹ️  Replica set is already initialized');
      return true;
    } else {
      print('❌ Error during replica set initialization:');
      print(error.message);
      return false;
    }
  }
  return false;
}

// Function to initialize database and collections
function initializeDatabase() {
  print('\n🏎️  Setting up F1 Champions database...');

  // Switch to the F1 database
  db = db.getSiblingDB(databaseName);

  // Create collections with basic indexes for better performance
  print('📊 Creating collections and indexes...');

  // Drivers collection
  db.createCollection('drivers');
  db.drivers.createIndex({ driverId: 1 }, { unique: true });
  db.drivers.createIndex({ familyName: 1 });
  db.drivers.createIndex({ nationality: 1 });

  // Constructors collection
  db.createCollection('constructors');
  db.constructors.createIndex({ constructorId: 1 }, { unique: true });
  db.constructors.createIndex({ name: 1 });
  db.constructors.createIndex({ nationality: 1 });

  // Circuits collection
  db.createCollection('circuits');
  db.circuits.createIndex({ circuitId: 1 }, { unique: true });
  db.circuits.createIndex({ circuitName: 1 });
  db.circuits.createIndex({ 'location.country': 1 });

  // Season Champions collection
  db.createCollection('season_champions');
  db.season_champions.createIndex({ season: 1, driverId: 1 }, { unique: true });
  db.season_champions.createIndex({ season: 1 });
  db.season_champions.createIndex({ position: 1 });

  // Race Winners collection
  db.createCollection('race_winners');
  db.race_winners.createIndex({ season: 1, round: 1 }, { unique: true });
  db.race_winners.createIndex({ season: 1 });
  db.race_winners.createIndex({ date: 1 });

  // Seasons collection
  db.createCollection('seasons');
  db.seasons.createIndex({ year: 1 }, { unique: true });

  print('✅ Database initialization completed!');
  print('📋 Created collections:');
  print('  - drivers (with indexes on driverId, familyName, nationality)');
  print('  - constructors (with indexes on constructorId, name, nationality)');
  print(
    '  - circuits (with indexes on circuitId, circuitName, location.country)'
  );
  print(
    '  - season_champions (with indexes on season+driverId, season, position)'
  );
  print('  - race_winners (with indexes on season+round, season, date)');
  print('  - seasons (with index on year)');
  print('🎯 Database is ready for seeding!');
}

// Main execution flow
try {
  // Step 1: Initialize replica set (if needed)
  const replicaSetReady = initializeReplicaSet();

  // Step 2: Initialize database and collections
  if (replicaSetReady) {
    initializeDatabase();

    print('\n🎉 F1 Champions MongoDB setup completed successfully!');

    // Display connection string
    if (isDockerEnv && nodeCount === 3) {
      print('🔗 Connection string for application:');
      print(
        `   mongodb://mongodb-primary:27017,mongodb-secondary1:27017,mongodb-secondary2:27017/${databaseName}?replicaSet=${replicaSetName}`
      );
    } else if (isDockerEnv) {
      print('🔗 Connection string for application:');
      print(`   mongodb://mongodb:27017/${databaseName}`);
    } else {
      print('🔗 Connection string for application:');
      print(
        `   mongodb://localhost:27017/${databaseName}?replicaSet=${replicaSetName}`
      );
    }
  } else {
    print('❌ Failed to set up replica set, skipping database initialization');
  }
} catch (error) {
  print('❌ Fatal error during initialization:');
  print(error.message);
}
