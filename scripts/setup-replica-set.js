// MongoDB Replica Set Initialization Script
// Run this script with: mongosh --file setup-replica-set.js

try {
  print('🚀 Initializing MongoDB Replica Set for F1 Champions App...');

  // Initialize the replica set
  const config = {
    _id: 'f1rs',
    members: [
      {
        _id: 0,
        host: 'localhost:27017',
        priority: 1,
      },
    ],
  };

  const result = rs.initiate(config);

  if (result.ok === 1) {
    print('✅ Replica set initialized successfully!');
    print('📊 Replica set name: f1rs');
    print('🔗 Member: localhost:27017');

    // Wait a moment for the replica set to stabilize
    sleep(3000);

    // Check replica set status
    print('\n📈 Checking replica set status...');
    const status = rs.status();
    print('🎯 Current replica set state: ' + status.myState);

    if (status.myState === 1) {
      print('✅ This node is now the PRIMARY');

      // Create the F1 Champions database
      print('\n🏎️  Setting up F1 Champions database...');
      db = db.getSiblingDB('f1_champions_db');

      // Create a test collection to ensure database exists
      db.createCollection('_init');
      print("✅ Database 'f1_champions_db' created successfully!");

      print('\n🎉 Replica set setup complete!');
      print(
        '🔗 Connection string: mongodb://localhost:27017/f1_champions_db?replicaSet=f1rs'
      );
    }
  } else {
    print('❌ Failed to initialize replica set:');
    printjson(result);
  }
} catch (error) {
  if (error.message.includes('already initialized')) {
    print('ℹ️  Replica set is already initialized');
    print('📊 Current status:');
    printjson(rs.status());
  } else {
    print('❌ Error during replica set initialization:');
    print(error.message);
  }
}
