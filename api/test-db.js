import sql from '../lib/db.js';

export default async function handler(req, res) {
  try {
    // Test query to check connection and get table info
    const result = await sql`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'images';
    `;
    
    // Also get count of images
    const count = await sql`
      SELECT COUNT(*) as count FROM images;
    `;

    res.json({
      message: 'Database connection successful',
      tableInfo: result.rows,
      imageCount: count.rows[0].count
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ 
      error: 'Database test failed', 
      details: error.message 
    });
  }
}
