import dotenv from 'dotenv';
import { createTables } from '../lib/schema.js';

// Load environment variables
dotenv.config();

// Initialize database
async function init() {
  try {
    await createTables();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

init();
