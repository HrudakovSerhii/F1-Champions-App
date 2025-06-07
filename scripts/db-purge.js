#!/usr/bin/env node

/**
 * Database Purge Script
 * Safely drops all data and recreates the database schema
 * Only works in development with local database
 */

const { execSync } = require('child_process');
const path = require('path');
const { validateSafetyConditions } = require('./db-safety-check');

function runCommand(command, cwd = process.cwd()) {
  try {
    console.log(`📋 Running: ${command}`);
    execSync(command, {
      cwd,
      stdio: 'inherit',
      env: { ...process.env },
    });
  } catch (error) {
    console.error(`❌ Command failed: ${command}`);
    console.error(error.message);
    process.exit(1);
  }
}

function confirmAction() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(
      '⚠️  This will DELETE ALL DATABASE DATA. Are you sure? (type "yes" to confirm): ',
      (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === 'yes');
      }
    );
  });
}

async function purgeDatabase() {
  console.log('🗑️  F1 Champions Database Purge');

  validateSafetyConditions();

  const confirmed = await confirmAction();
  if (!confirmed) {
    console.log('❌ Operation cancelled by user.');
    process.exit(0);
  }

  console.log('🚀 Starting database purge...');
  const backendDir = path.join(__dirname, '../apps/backend');

  try {
    console.log('📦 Resetting database...');
    runCommand('npx prisma db push --force-reset --skip-generate', backendDir);

    console.log('🔧 Generating Prisma client...');
    runCommand('npx prisma generate', backendDir);

    console.log('📋 Applying database schema...');
    runCommand('npx prisma db push', backendDir);

    console.log('✅ Database purge completed successfully!');
    console.log(
      '💡 Database is ready for fresh data. Use "npm run db:studio" to view.'
    );
  } catch (error) {
    console.error('❌ Database purge failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  purgeDatabase().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { purgeDatabase };
