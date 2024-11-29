import { put } from "@vercel/blob";
import sql from '../lib/db.js';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse the FormData
    const formData = await req.formData();
    const file = formData.get('file');
    const username = formData.get('username');
    const email = formData.get('email');

    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }
    
    // Upload to Vercel Blob
    const blob = await put(file, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
      metadata: {
        username,
        email
      }
    });

    // Store metadata in database
    const result = await sql`
      INSERT INTO images (url, name, size, username, email)
      VALUES (${blob.url}, ${file.name}, ${blob.size}, ${username}, ${email})
      RETURNING *;
    `;

    // Return the combined data
    res.json({
      url: blob.url,
      size: blob.size,
      name: file.name,
      username,
      email,
      uploadedAt: result.rows[0].uploaded_at
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
}