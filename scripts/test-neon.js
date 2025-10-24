#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function testNeonConnection() {
  console.log('🔍 Testing Neon Database Connection...\n');
  
  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.log('❌ DATABASE_URL not found in environment variables');
    console.log('   Please add your Neon connection string to .env file\n');
    return;
  }

  // Check if it's a Neon URL
  if (!process.env.DATABASE_URL.includes('neon.tech')) {
    console.log('⚠️  DATABASE_URL doesn\'t appear to be a Neon connection string');
    console.log('   Expected format: postgresql://...@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require\n');
  }

  console.log('📋 Connection Details:');
  console.log(`   URL: ${process.env.DATABASE_URL.replace(/:[^:@]+@/, ':***@')}`); // Hide password
  console.log('');

  try {
    console.log('🔌 Attempting to connect to Neon...');
    const prisma = new PrismaClient();
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Successfully connected to Neon database!');
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT version()`;
    console.log('✅ Database query successful!');
    console.log(`   PostgreSQL version: ${result[0].version}`);
    
    // Check if tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    console.log(`✅ Found ${tables.length} tables in database`);
    if (tables.length > 0) {
      console.log('   Tables:', tables.map(t => t.table_name).join(', '));
    }
    
    await prisma.$disconnect();
    console.log('\n🎉 Neon database is working perfectly!');
    
  } catch (error) {
    console.log('❌ Failed to connect to Neon database:');
    console.log(`   Error: ${error.message}\n`);
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      console.log('💡 Troubleshooting tips:');
      console.log('   1. Check if your Neon connection string is correct');
      console.log('   2. Make sure your Neon project is active');
      console.log('   3. Verify your internet connection');
      console.log('   4. Check if your Neon project has been paused (free tier)');
    }
    
    if (error.message.includes('authentication')) {
      console.log('💡 Authentication error:');
      console.log('   1. Check your username and password in the connection string');
      console.log('   2. Make sure your Neon project credentials are correct');
    }
  }
}

testNeonConnection();
