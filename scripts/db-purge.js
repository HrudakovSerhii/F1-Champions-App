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
    const result = execSync(command, {
      cwd,
      stdio: 'inherit',
      env: { ...process.env },
    });
    return result;
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
  console.log('🗑️  F1 Champions Database Purge Script');
  console.log('═'.repeat(50));

  // Step 1: Run safety checks
  validateSafetyConditions();

  // Step 2: Get user confirmation
  const confirmed = await confirmAction();
  if (!confirmed) {
    console.log('\n❌ Operation cancelled by user.');
    process.exit(0);
  }

  console.log('\n🚀 Starting database purge process...\n');

  const backendDir = path.join(__dirname, '../apps/backend');

  try {
    // Step 3: Drop and recreate database
    console.log('📦 Step 1: Resetting database...');
    runCommand('npx prisma db push --force-reset --skip-generate', backendDir);

    // Step 4: Generate Prisma client
    console.log('🔧 Step 2: Generating Prisma client...');
    runCommand('npx prisma generate', backendDir);

    // Step 5: Apply schema
    console.log('📋 Step 3: Applying database schema...');
    runCommand('npx prisma db push', backendDir);

    console.log('\n✅ Database purge completed successfully!');
    console.log('═'.repeat(50));
    console.log('📊 Database is now empty and ready for fresh data.');
    console.log('💡 You can now run seed scripts to populate test data.');
    console.log('🔧 Use "npm run db:studio" to view the database.');
  } catch (error) {
    console.error('\n❌ Database purge failed!');
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  purgeDatabase().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { purgeDatabase };
