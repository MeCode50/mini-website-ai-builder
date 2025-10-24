#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🌟 Setting up AI Website Builder with Neon Database...\n');

// Check if .env exists
const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.log('📋 Creating .env file from template...');
  execSync('cp env.example .env', { stdio: 'inherit' });
  console.log('✅ .env file created!\n');
} else {
  console.log('✅ .env file already exists\n');
}

// Check if DATABASE_URL is set
const envContent = fs.readFileSync(envPath, 'utf8');
if (envContent.includes('ep-xxx-xxx')) {
  console.log('⚠️  Please update your DATABASE_URL in .env with your Neon connection string');
  console.log('   Get it from: https://console.neon.tech/\n');
} else {
  console.log('✅ DATABASE_URL appears to be configured\n');
}

// Generate Prisma client
console.log('🔧 Generating Prisma client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated!\n');
} catch (error) {
  console.error('❌ Failed to generate Prisma client:', error.message);
  process.exit(1);
}

// Deploy schema to Neon
console.log('🚀 Deploying schema to Neon...');
try {
  execSync('npx prisma db push', { stdio: 'inherit' });
  console.log('✅ Schema deployed to Neon!\n');
} catch (error) {
  console.error('❌ Failed to deploy schema:', error.message);
  console.log('   Make sure your DATABASE_URL is correct in .env\n');
  process.exit(1);
}

// Seed database
console.log('🌱 Seeding database with sample data...');
try {
  execSync('npm run db:seed', { stdio: 'inherit' });
  console.log('✅ Database seeded!\n');
} catch (error) {
  console.error('❌ Failed to seed database:', error.message);
  console.log('   You can run "npm run db:seed" manually later\n');
}

console.log('🎉 Setup complete! You can now start your application:');
console.log('   npm run start:dev\n');
console.log('📚 API Documentation: http://localhost:3000/api/v1/docs');
console.log('🏥 Health Check: http://localhost:3000/api/v1/health');
