#!/usr/bin/env node

/**
 * Database Safety Check Script
 * Validates environment and database configuration before allowing destructive operations
 */

const path = require('path');
const fs = require('fs');

function loadEnvFile() {
  const envPath = path.join(__dirname, '../apps/backend/.env');
  if (!fs.existsSync(envPath)) {
    return {};
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

  return envVars;
}

function validateSafetyConditions() {
  console.log('🔍 Running database safety checks...');

  const envVars = loadEnvFile();
  const nodeEnv = process.env.NODE_ENV || envVars.NODE_ENV || 'production';
  const databaseUrl = process.env.DATABASE_URL || envVars.DATABASE_URL || '';

  const checks = [
    {
      name: 'Environment Check',
      test: () => nodeEnv === 'development',
      message: `NODE_ENV: ${nodeEnv}`,
      required: true,
    },
    {
      name: 'Database Location',
      test: () =>
        databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1'),
      message:
        databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1')
          ? 'Local database detected'
          : 'Non-local database detected',
      required: true,
    },
    {
      name: 'Database Name',
      test: () =>
        ['f1_champions_db', 'f1_champions_local_db'].some((safeName) =>
          databaseUrl.includes(safeName)
        ),
      message: 'Safe database name check',
      required: false,
    },
  ];

  // Add replica set info if present
  if (databaseUrl.includes('replicaSet=')) {
    const replicaSetMatch = databaseUrl.match(/replicaSet=([^&]+)/);
    const replicaSetName = replicaSetMatch ? replicaSetMatch[1] : 'unknown';
    checks.push({
      name: 'Replica Set',
      test: () => true,
      message: `Detected: ${replicaSetName}`,
      required: false,
    });
  }

  // Display results
  let failed = 0;
  let warnings = 0;

  checks.forEach((check) => {
    const passed = check.test();
    let status;

    if (check.required && !passed) {
      status = '❌';
      failed++;
    } else if (!check.required && !passed) {
      status = '⚠️';
      warnings++;
    } else if (check.name === 'Replica Set') {
      status = '📊';
    } else {
      status = '✅';
    }

    console.log(`${status} ${check.name}: ${check.message}`);
  });

  if (failed > 0) {
    console.log('\n❌ SAFETY CHECK FAILED');
    console.log('Cannot proceed with database operations.');
    process.exit(1);
  }

  if (warnings > 0) {
    console.log('\n⚠️  WARNINGS DETECTED');
    console.log('Please verify you are working with the correct database.');
  }

  console.log(
    '\n✅ Safety checks passed. Proceeding with database operation...'
  );
  console.log(`Database URL: ${databaseUrl}\n`);
}

if (require.main === module) {
  validateSafetyConditions();
}

module.exports = { validateSafetyConditions };
