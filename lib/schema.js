import sql from './db.js';

async function createTables() {
  try {
    // Create images table
    await sql`
      CREATE TABLE IF NOT EXISTS images (
        id SERIAL PRIMARY KEY,
        url TEXT NOT NULL,
        name TEXT NOT NULL,
        size BIGINT NOT NULL,
        username TEXT,
        email TEXT,
        uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('Database tables created successfully');
  } catch (error) {
    console.error('Error creating database tables:', error);
    throw error;
  }
}

// Export the function to be called when setting up the database
export { createTables };
