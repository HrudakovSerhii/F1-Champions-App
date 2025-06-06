#!/usr/bin/env node

/**
 * MongoDB Replica Set Initialization Script
 * Initializes the replica set if not already configured
 */

const { MongoClient } = require('mongodb');

class ReplicaSetInitializer {
  constructor() {
    this.connectionString = 'mongodb://mongodb:27017/?directConnection=true';
    this.replicaSetName = 'f1rs';
    this.client = null;
  }

  async connect() {
    console.log('🔗 Connecting to MongoDB...');
    this.client = new MongoClient(this.connectionString);
    await this.client.connect();
    console.log('✅ Connected to MongoDB');
  }

  async checkReplicaSetStatus() {
    try {
      const admin = this.client.db().admin();
      const status = await admin.command({ replSetGetStatus: 1 });
      console.log('✅ Replica set is already initialized');
      console.log(`📊 Set: ${status.set}, Members: ${status.members.length}`);
      return true;
    } catch (error) {
      if (error.message.includes('no replset config')) {
        console.log('📦 Replica set not initialized, proceeding with setup...');
        return false;
      } else {
        console.error('❌ Error checking replica set status:', error.message);
        throw error;
      }
    }
  }

  async initializeReplicaSet() {
    console.log('🔧 Initializing replica set...');
    
    const replicaSetConfig = {
      _id: this.replicaSetName,
      members: [
        {
          _id: 0,
          host: 'mongodb:27017',
          priority: 1
        }
      ]
    };

    try {
      const admin = this.client.db().admin();
      const result = await admin.command({
        replSetInitiate: replicaSetConfig
      });

      if (result.ok === 1) {
        console.log('✅ Replica set initialized successfully!');
        console.log(`📊 Replica set: ${this.replicaSetName}`);
        console.log('🔗 Member: mongodb:27017');
        
        // Wait for replica set to stabilize
        console.log('⏳ Waiting for replica set to stabilize...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Verify the setup
        await this.verifyReplicaSet();
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

  async verifyReplicaSet() {
    try {
      const admin = this.client.db().admin();
      const status = await admin.command({ replSetGetStatus: 1 });
      
      const primary = status.members.find(member => member.stateStr === 'PRIMARY');
      if (primary) {
        console.log('✅ Replica set verification successful');
        console.log(`🎯 Primary node: ${primary.name}`);
      } else {
        console.log('⚠️  No primary found yet, replica set still stabilizing...');
      }
    } catch (error) {
      console.log('⚠️  Replica set verification pending:', error.message);
    }
  }

  async run() {
    try {
      await this.connect();
      
      const isInitialized = await this.checkReplicaSetStatus();
      
      if (!isInitialized) {
        const success = await this.initializeReplicaSet();
        if (!success) {
          throw new Error('Failed to initialize replica set');
        }
      }
      
      console.log('🎉 Replica set setup completed successfully!');
      
    } catch (error) {
      console.error('💥 Replica set initialization failed:', error.message);
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
  const initializer = new ReplicaSetInitializer();
  initializer.run().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = ReplicaSetInitializer; 