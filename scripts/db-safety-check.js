#!/usr/bin/env node

/**
 * Database Safety Check Script
 * Validates environment and database configuration before allowing destructive operations
 */

const path = require('path');
const fs = require('fs');

function loadEnvFile() {
  const envPath = path.join(__dirname, '../apps/backend/.env');
  if (fs.existsSync(envPath)) {
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

    return envVars;
  }
  return {};
}

function validateSafetyConditions() {
  console.log('🔍 Running database safety checks...\n');

  // Load environment variables
  const envVars = loadEnvFile();
  const nodeEnv = process.env.NODE_ENV || envVars.NODE_ENV || 'production';
  const databaseUrl = process.env.DATABASE_URL || envVars.DATABASE_URL || '';

  const checks = [];

  // Check 1: NODE_ENV must be development
  if (nodeEnv === 'development') {
    checks.push({
      name: 'Environment Check',
      status: '✅',
      message: `NODE_ENV: ${nodeEnv}`,
    });
  } else {
    checks.push({
      name: 'Environment Check',
      status: '❌',
      message: `NODE_ENV: ${nodeEnv} (must be 'development')`,
    });
  }

  // Check 2: Database URL must be local
  const isLocalDb =
    databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1');
  if (isLocalDb) {
    checks.push({
      name: 'Database Location',
      status: '✅',
      message: 'Local database detected',
    });
  } else {
    checks.push({
      name: 'Database Location',
      status: '❌',
      message: 'Non-local database detected',
    });
  }

  // Check 3: Database name should be safe for development
  const safeDatabaseNames = [
    'f1_champions_dev',
    'f1_champions_local_db',
    'dev',
    'local',
    'test',
  ];
  const dbNameSafe = safeDatabaseNames.some((safeName) =>
    databaseUrl.includes(safeName)
  );

  if (dbNameSafe) {
    checks.push({
      name: 'Database Name',
      status: '✅',
      message: 'Safe database name detected',
    });
  } else {
    checks.push({
      name: 'Database Name',
      status: '⚠️',
      message:
        'Database name should contain f1_champions_local_db or f1_champions_dev for safety',
    });
  }

  // Check 4: Replica Set detection (informational)
  if (databaseUrl.includes('replicaSet=')) {
    const replicaSetMatch = databaseUrl.match(/replicaSet=([^&]+)/);
    const replicaSetName = replicaSetMatch ? replicaSetMatch[1] : 'unknown';
    checks.push({
      name: 'Replica Set',
      status: '📊',
      message: `Detected replica set: ${replicaSetName}`,
    });
  }

  // Display results
  console.log('Safety Check Results:');
  console.log('═'.repeat(60));
  checks.forEach((check) => {
    console.log(`${check.status} ${check.name}: ${check.message}`);
  });
  console.log('═'.repeat(60));

  // Determine if safe to proceed
  const failed = checks.filter((check) => check.status === '❌');
  const warnings = checks.filter((check) => check.status === '⚠️');

  if (failed.length > 0) {
    console.log('\n❌ SAFETY CHECK FAILED');
    console.log('Cannot proceed with database operations.');
    console.log(
      'Please ensure you are in development environment with local database.'
    );
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.log('\n⚠️  WARNINGS DETECTED');
    console.log('Please verify you are working with the correct database.');
  }

  console.log(
    '\n✅ Safety checks passed. Proceeding with database operation...\n'
  );
  console.log(`Database URL: ${databaseUrl}\n`);
}

// Run validation if called directly
if (require.main === module) {
  validateSafetyConditions();
}

module.exports = { validateSafetyConditions };
