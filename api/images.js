import sql from '../lib/db.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const result = await sql`
        SELECT * FROM images
        ORDER BY uploaded_at DESC;
      `;
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching images:', error);
      res.status(500).json({ error: 'Failed to fetch images' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
