// MongoDB Replica Set Initialization Script for Docker
// This script initializes a 3-node replica set

try {
  print('🚀 Initializing MongoDB Replica Set for F1 Champions App (Docker)...');

  // Configure replica set with 3 nodes
  const config = {
    _id: 'f1rs',
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

  const result = rs.initiate(config);

  if (result.ok === 1) {
    print('✅ Replica set initialized successfully!');
    print('📊 Replica set name: f1rs');
    print('🔗 Primary: mongodb-primary:27017');
    print('🔗 Secondary 1: mongodb-secondary1:27017');
    print('🔗 Secondary 2: mongodb-secondary2:27017');

    // Wait for the replica set to stabilize
    print('\n⏳ Waiting for replica set to stabilize...');
    sleep(10000);

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
      print('🔗 Connection string for application:');
      print(
        '   mongodb://mongodb-primary:27017,mongodb-secondary1:27017,mongodb-secondary2:27017/f1_champions_db?replicaSet=f1rs'
      );
    }

    // Display member information
    print('\n👥 Replica set members:');
    const members = status.members;
    for (let i = 0; i < members.length; i++) {
      const member = members[i];
      print('   - ' + member.name + ' (' + member.stateStr + ')');
    }
  } else {
    print('❌ Failed to initialize replica set:');
    printjson(result);
  }
} catch (error) {
  if (error.message.includes('already initialized')) {
    print('ℹ️  Replica set is already initialized');
    print('📊 Current status:');
    try {
      printjson(rs.status());
    } catch (statusError) {
      print('⚠️  Could not get replica set status: ' + statusError.message);
    }
  } else {
    print('❌ Error during replica set initialization:');
    print(error.message);
  }
}
