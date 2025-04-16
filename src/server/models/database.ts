import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

// Add any missing types for node modules with @types/node
// This should be in the package.json dev dependencies

const execAsync = promisify(exec);

// Initialize Prisma client
const prisma = new PrismaClient();

/**
 * Sets up the database connection and ensures the database directory exists
 */
export async function setupDatabase() {
  // Create app data directory if it doesn't exist
  const appDataPath = path.join(os.homedir(), '.mcp-registry');
  
  if (!fs.existsSync(appDataPath)) {
    fs.mkdirSync(appDataPath, { recursive: true });
  }
  
  // Set DATABASE_URL environment variable if not already set
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = `file:${path.join(appDataPath, 'mcp-registry.db')}`;
  }
  
  // Connect to database
  try {
    await prisma.$connect();
    
    // Test connection by running a simple query
    await prisma.$queryRaw`SELECT 1`;
    
    console.log('Database connection established successfully');
    
    return prisma;
  } catch (error: any) {
    console.error('Database connection error:', error);
    
    // If the error is related to missing tables, run migrations
    if (error.message && error.message.includes('no such table')) {
      console.log('Database tables not found, running migrations...');
      
      try {
        await runMigrations();
        console.log('Migrations completed successfully');
        
        // Retry connection
        await prisma.$connect();
        return prisma;
      } catch (migrationError) {
        console.error('Migration error:', migrationError);
        throw migrationError;
      }
    }
    
    throw error;
  }
}

/**
 * Runs Prisma migrations to set up database schema
 */
async function runMigrations() {
  try {
    // Generate a migration named 'init' if none exists
    const migrationName = 'init';
    await execAsync(`npx prisma migrate dev --name ${migrationName} --skip-seed`);
    
    return true;
  } catch (error) {
    console.error('Error running migrations:', error);
    throw error;
  }
}

/**
 * Determines if the database needs to be updated based on last scan date
 * @returns {Promise<boolean>} True if data collection is needed
 */
export async function needsDataCollection(): Promise<boolean> {
  try {
    // Check if any MCPServer exists
    const serverCount = await prisma.mCPServer.count();
    
    // If no servers exist, we definitely need to collect data
    if (serverCount === 0) {
      return true;
    }
    
    // Find the most recently scanned server
    const mostRecentServer = await prisma.mCPServer.findFirst({
      orderBy: {
        lastScannedAt: 'desc'
      }
    });
    
    // If no server has been scanned, we need to collect data
    if (!mostRecentServer || !mostRecentServer.lastScannedAt) {
      return true;
    }
    
    // Check if it's been more than a day since the last scan
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    return mostRecentServer.lastScannedAt < oneDayAgo;
  } catch (error) {
    console.error('Error checking data collection needs:', error);
    // Default to true if there's an error
    return true;
  }
}

export { prisma }; 