import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { put } from '@vercel/blob';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import { sql, testConnection } from './lib/db.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const upload = multer();

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.VERCEL_URL 
    : 'http://localhost:5173',
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Test database connection on startup
testConnection().catch(error => {
  console.error('Failed to connect to database:', error);
  process.exit(1);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    details: err.message 
  });
});

// Test database connection
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await sql`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'images';
    `;
    
    const count = await sql`
      SELECT COUNT(*) as count FROM images;
    `;

    res.json({
      message: 'Database connection successful',
      tableInfo: result,
      imageCount: count[0].count
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ 
      error: 'Database test failed', 
      details: error.message 
    });
  }
});

// Get all images
app.get('/api/images', async (req, res) => {
  try {
    console.log('Fetching images...');
    const images = await sql`
      SELECT * FROM images 
      ORDER BY uploaded_at DESC;
    `;
    console.log('Images fetched:', images);
    res.json(images);
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ 
      error: 'Failed to fetch images',
      details: error.message 
    });
  }
});

// Upload Endpoint
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    console.log('Upload request received');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);

    if (!req.file) {
      return res.status(400).json({ 
        error: 'No file uploaded',
        details: 'File is required' 
      });
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('BLOB_READ_WRITE_TOKEN is not configured');
      return res.status(500).json({ 
        error: 'Server configuration error',
        details: 'Storage configuration is missing' 
      });
    }

    // Create a unique filename
    const filename = `${Date.now()}-${req.file.originalname}`;

    console.log('Uploading to blob storage...');
    const blob = await put(filename, req.file.buffer, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN
    });
    console.log('Blob upload successful:', blob);

    if (!blob || !blob.url) {
      throw new Error('Blob storage upload failed');
    }

    // Ensure we have a valid size value
    const fileSize = blob.size || req.file.size;
    if (!fileSize) {
      throw new Error('Invalid file size');
    }

    console.log('Saving to database with size:', fileSize);
    const result = await sql`
      INSERT INTO images (url, name, size, username, email)
      VALUES (
        ${blob.url}, 
        ${req.file.originalname}, 
        ${fileSize}, 
        ${req.body.username || null}, 
        ${req.body.email || null}
      )
      RETURNING *;
    `;

    console.log('Database query result:', result);

    if (!result || result.length === 0) {
      throw new Error('Database insert failed to return the created record');
    }

    const savedImage = result[0];
    console.log('Database insert successful:', savedImage);

    // Create response object with all required fields
    const response = {
      url: blob.url,
      size: parseInt(fileSize, 10), // Ensure size is a number
      name: req.file.originalname,
      username: req.body.username || null,
      email: req.body.email || null,
      uploadedAt: savedImage.uploaded_at || new Date().toISOString(),
      id: savedImage.id
    };

    console.log('Sending response:', response);
    res.json(response);

  } catch (error) {
    console.error('Upload error details:', {
      message: error.message,
      stack: error.stack,
      body: req.body,
      file: req.file ? {
        originalname: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      } : 'No file',
      blobDetails: error.blob || 'No blob details'
    });
    
    res.status(500).json({ 
      error: 'Upload failed',
      details: error.message,
      step: error.message.includes('blob') ? 'blob_storage' : 
            error.message.includes('sql') ? 'database' : 'unknown'
    });
  }
});

// Delete image endpoint
app.delete('/api/images/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get image URL from database
    const image = await sql`
      SELECT url FROM images WHERE id = ${id}
    `;

    if (!image || image.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Delete from database
    await sql`
      DELETE FROM images WHERE id = ${id}
    `;

    // Delete from Vercel Blob storage
    const blobUrl = new URL(image[0].url);
    const blobPath = blobUrl.pathname.substring(1); // Remove leading slash
    
    try {
      await fetch(`https://api.vercel.com/v2/blobs/${blobPath}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`
        }
      });
    } catch (error) {
      console.error('Error deleting from blob storage:', error);
      // Continue even if blob deletion fails
    }

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ 
      error: 'Failed to delete image',
      details: error.message 
    });
  }
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log('Environment check:', {
    PORT: process.env.PORT,
    DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not set',
    BLOB_TOKEN: process.env.BLOB_READ_WRITE_TOKEN ? 'Set' : 'Not set'
  });
});