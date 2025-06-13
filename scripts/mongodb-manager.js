#!/usr/bin/env node

/**
 * F1 Champions MongoDB Manager Script
 * Handles MongoDB start, stop, and status operations using environment variables
 */

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

class MongoDBManager {
  constructor() {
    this.config = {};
    this.loadEnvironmentVariables();
  }

  loadEnvironmentVariables() {
    const envPath = path.join(__dirname, '../.env');

    if (!fs.existsSync(envPath)) {
      console.error('❌ .env file not found');
      console.log('💡 Please create .env with MongoDB configuration');
      process.exit(1);
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};

    envContent.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          envVars[key.trim()] = valueParts.join('=').replace(/"/g, '');
        }
      }
    });

    // Set configuration with defaults
    this.config = {
      port: envVars.MONGODB_DATABASE_PORT || '27000',
      dbName: envVars.MONGODB_DATABASE_NAME || 'f1_champions_local_db',
      replicaSet: envVars.MONGODB_REPLICA_SET_NAME || 'f1rs',
      host: envVars.MONGODB_HOST_NAME || 'localhost',
      // Additional MongoDB settings (can be overridden via env vars)
      dbPath: envVars.MONGODB_DB_PATH || '../mongodb/data',
      logPath: envVars.MONGODB_LOG_PATH || '../mongodb/logs/mongo.log',
      bindIp: envVars.MONGODB_BIND_IP || '127.0.0.1,localhost',
    };
  }

  // Check if port is in use and what process is using it
  async checkPortUsage() {
    return new Promise((resolve) => {
      const lsofCommand = `lsof -i :${this.config.port}`;

      exec(lsofCommand, (error, stdout) => {
        if (error || !stdout.trim()) {
          resolve({ inUse: false });
        } else {
          const lines = stdout.trim().split('\n');
          if (lines.length > 1) {
            const processLine = lines[1];
            const parts = processLine.split(/\s+/);
            const processName = parts[0];
            const pid = parts[1];

            resolve({
              inUse: true,
              processName,
              pid,
              isMongoDB: processName === 'mongod',
            });
          } else {
            resolve({ inUse: false });
          }
        }
      });
    });
  }

  async start() {
    console.log('🏎️  F1 Champions - Starting MongoDB');
    console.log('═'.repeat(50));
    console.log(`📡 Port: ${this.config.port}`);
    console.log(`🔗 Host: ${this.config.host}`);
    console.log(`🏁 Replica Set: ${this.config.replicaSet}`);
    console.log(`💾 Data Path: ${this.config.dbPath}`);
    console.log(`📝 Log Path: ${this.config.logPath}`);
    console.log('');

    // Check if port is already in use
    console.log('🔍 Checking port availability...');
    const portCheck = await this.checkPortUsage();

    if (portCheck.inUse) {
      if (portCheck.isMongoDB) {
        console.log(
          `✅ MongoDB is already running on port ${this.config.port}`
        );
        console.log(`   PID: ${portCheck.pid}`);
        console.log('ℹ️  No action needed - MongoDB is ready to use');
        return; // Exit gracefully without error
      } else {
        console.log(
          `❌ Port ${this.config.port} is already in use by another process`
        );
        console.log(
          `   Process: ${portCheck.processName} (PID: ${portCheck.pid})`
        );
        console.log(`💡 Please stop the process or use a different port`);
        throw new Error(
          `Port ${this.config.port} is occupied by ${portCheck.processName}`
        );
      }
    }

    console.log(`✅ Port ${this.config.port} is available`);
    console.log('');

    // Ensure data and log directories exist
    const dataDir = path.resolve(this.config.dbPath);
    const logDir = path.dirname(path.resolve(this.config.logPath));

    if (!fs.existsSync(dataDir)) {
      console.log(`📁 Creating data directory: ${dataDir}`);
      fs.mkdirSync(dataDir, { recursive: true });
    }

    if (!fs.existsSync(logDir)) {
      console.log(`📁 Creating log directory: ${logDir}`);
      fs.mkdirSync(logDir, { recursive: true });
    }

    // Build MongoDB command arguments from environment variables
    const mongodArgs = [
      '--port',
      this.config.port,
      '--dbpath',
      this.config.dbPath,
      '--logpath',
      this.config.logPath,
      '--replSet',
      this.config.replicaSet,
      '--bind_ip',
      this.config.bindIp,
      '--fork',
    ];

    console.log('🚀 Starting MongoDB with command:');
    console.log(`   mongod ${mongodArgs.join(' ')}`);
    console.log('');

    return new Promise((resolve, reject) => {
      const mongod = spawn('mongod', mongodArgs, {
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      let startupComplete = false;

      // Set timeout for startup
      const startupTimeout = setTimeout(() => {
        if (!startupComplete) {
          console.log('⏳ MongoDB startup taking longer than expected...');
          console.log(`🔍 Check logs for details: ${this.config.logPath}`);
          // Don't reject, just warn - MongoDB might still be starting
        }
      }, 10000);

      // Listen for stdout to detect successful fork
      mongod.stdout.on('data', (data) => {
        const output = data.toString();
        if (
          output.includes('child process started successfully') ||
          output.includes('parent exiting')
        ) {
          if (!startupComplete) {
            startupComplete = true;
            clearTimeout(startupTimeout);
            console.log(
              '✅ MongoDB started successfully (forked to background)'
            );
            resolve();
          }
        }
      });

      // Listen for stderr for errors
      mongod.stderr.on('data', (data) => {
        const error = data.toString();
        console.error('MongoDB stderr:', error);
      });

      mongod.on('close', (code) => {
        clearTimeout(startupTimeout);

        if (!startupComplete) {
          if (code === 0) {
            // Normal exit when forking - check if MongoDB actually started
            setTimeout(async () => {
              const isRunning = await this.checkIfRunning();
              if (isRunning) {
                console.log('✅ MongoDB started successfully');
                resolve();
              } else {
                console.error('❌ MongoDB failed to start');
                reject(new Error('MongoDB not running after start attempt'));
              }
            }, 2000);
          } else {
            console.error(`❌ MongoDB failed to start (exit code: ${code})`);
            reject(new Error(`MongoDB exit code: ${code}`));
          }
        }
      });

      mongod.on('error', (error) => {
        clearTimeout(startupTimeout);
        console.error('❌ Failed to start MongoDB:', error.message);
        reject(error);
      });
    });
  }

  // Helper method to check if MongoDB is running
  async checkIfRunning() {
    return new Promise((resolve) => {
      const checkCommand = `pgrep -f 'mongod.*--port ${this.config.port}'`;

      exec(checkCommand, (error, stdout) => {
        resolve(!error && stdout.trim());
      });
    });
  }

  async stop() {
    console.log('🏎️  F1 Champions - Stopping MongoDB');
    console.log('═'.repeat(50));
    console.log(`📡 Stopping MongoDB on port: ${this.config.port}`);

    return new Promise((resolve, reject) => {
      const killByPortCommand = `pkill -f 'mongod.*--port ${this.config.port}'`;

      exec(killByPortCommand, (error) => {
        if (error && error.code === 1) {
          // Try finding by port usage
          const findByPortCommand = `lsof -ti :${this.config.port}`;

          exec(findByPortCommand, (error2, stdout2) => {
            if (error2 || !stdout2.trim()) {
              console.log('ℹ️  No MongoDB process found');
              resolve();
            } else {
              const pids = stdout2.trim().split('\n');
              const killPidsCommand = `kill ${pids.join(' ')}`;

              exec(killPidsCommand, (error3) => {
                if (error3) {
                  reject(error3);
                } else {
                  console.log('✅ MongoDB stopped successfully');
                  resolve();
                }
              });
            }
          });
        } else if (error) {
          reject(error);
        } else {
          console.log('✅ MongoDB stopped successfully');
          resolve();
        }
      });
    });
  }

  async status() {
    console.log('🏎️  F1 Champions - MongoDB Status');
    console.log('═'.repeat(50));

    return new Promise((resolve) => {
      const checkCommand = `lsof -ti :${this.config.port}`;

      exec(checkCommand, (error, stdout) => {
        if (error || !stdout.trim()) {
          console.log('❌ MongoDB is not running');
          console.log(`   Expected port: ${this.config.port}`);
          resolve(false);
        } else {
          const pids = stdout.trim().split('\n');
          const mainPid = pids[0];

          const psCommand = `ps -p ${mainPid} -o pid,command`;

          exec(psCommand, (psError, psStdout) => {
            console.log('✅ MongoDB is running');
            console.log(`   PID: ${mainPid}`);
            console.log(`   Port: ${this.config.port}`);
            console.log(`   Host: ${this.config.host}`);
            console.log(`   Replica Set: ${this.config.replicaSet}`);

            if (!psError && psStdout) {
              const lines = psStdout.trim().split('\n');
              if (lines.length > 1) {
                const commandLine = lines[1].split(/\s+/).slice(1).join(' ');
                console.log(`   Command: ${commandLine}`);
              }
            }

            resolve(true);
          });
        }
      });
    });
  }

  async run() {
    const command = process.argv[2];

    if (!command) {
      console.log('🏎️  F1 Champions MongoDB Manager');
      console.log('═'.repeat(50));
      console.log('Usage: node mongodb-manager.js <command>');
      console.log('');
      console.log('Commands:');
      console.log('  start   - Start MongoDB server');
      console.log('  stop    - Stop MongoDB server');
      console.log('  status  - Check MongoDB status');
      console.log('');
      console.log('Configuration:');
      console.log(`  Port: ${this.config.port}`);
      console.log(`  Host: ${this.config.host}`);
      console.log(`  Replica Set: ${this.config.replicaSet}`);
      console.log(`  Database: ${this.config.dbName}`);
      return;
    }

    try {
      switch (command.toLowerCase()) {
        case 'start':
          await this.start();
          break;
        case 'stop':
          await this.stop();
          break;
        case 'status':
          await this.status();
          break;
        default:
          console.error(`❌ Unknown command: ${command}`);
          console.log('Available commands: start, stop, status');
          process.exit(1);
      }
    } catch (error) {
      console.error('❌ Operation failed:', error.message);
      process.exit(1);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const manager = new MongoDBManager();
  manager.run().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = MongoDBManager;
