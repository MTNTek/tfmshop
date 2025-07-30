import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { imageProcessor } from '../utils/imageProcessor';

/**
 * Image serving routes
 * Base path: /api/images
 */
const router = Router();

/**
 * GET /api/images/:filename
 * Serve image files with proper caching headers
 */
router.get('/:filename', (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    
    // Validate filename to prevent directory traversal
    if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_FILENAME',
          message: 'Invalid filename provided',
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }

    // Check if image exists
    if (!imageProcessor.imageExists(filename)) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'IMAGE_NOT_FOUND',
          message: 'Image not found',
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }

    const imagePath = imageProcessor.getImagePath(filename);
    const stats = imageProcessor.getImageStats(filename);

    if (!stats) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'IMAGE_NOT_FOUND',
          message: 'Image not found',
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }

    // Set appropriate headers
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';

    switch (ext) {
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.gif':
        contentType = 'image/gif';
        break;
      case '.webp':
        contentType = 'image/webp';
        break;
    }

    // Set caching headers (cache for 1 year)
    res.set({
      'Content-Type': contentType,
      'Content-Length': stats.size.toString(),
      'Cache-Control': 'public, max-age=31536000, immutable',
      'ETag': `"${stats.mtime.getTime()}-${stats.size}"`,
      'Last-Modified': stats.mtime.toUTCString(),
    });

    // Check if client has cached version
    const ifNoneMatch = req.headers['if-none-match'];
    const ifModifiedSince = req.headers['if-modified-since'];

    if (ifNoneMatch === `"${stats.mtime.getTime()}-${stats.size}"` ||
        (ifModifiedSince && new Date(ifModifiedSince) >= stats.mtime)) {
      return res.status(304).end();
    }

    // Stream the file
    const stream = fs.createReadStream(imagePath);
    
    stream.on('error', (error) => {
      console.error('Error streaming image:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: {
            code: 'STREAM_ERROR',
            message: 'Error serving image',
          },
          timestamp: new Date().toISOString(),
          path: req.originalUrl,
        });
      }
    });

    stream.pipe(res);

  } catch (error) {
    console.error('Error serving image:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error',
      },
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
    });
  }
});

/**
 * GET /api/images/:filename/info
 * Get image metadata
 */
router.get('/:filename/info', (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    
    // Validate filename
    if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_FILENAME',
          message: 'Invalid filename provided',
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }

    // Check if image exists
    if (!imageProcessor.imageExists(filename)) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'IMAGE_NOT_FOUND',
          message: 'Image not found',
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }

    const stats = imageProcessor.getImageStats(filename);
    
    if (!stats) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'IMAGE_NOT_FOUND',
          message: 'Image not found',
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }

    const ext = path.extname(filename).toLowerCase();
    let mimeType = 'application/octet-stream';

    switch (ext) {
      case '.jpg':
      case '.jpeg':
        mimeType = 'image/jpeg';
        break;
      case '.png':
        mimeType = 'image/png';
        break;
      case '.gif':
        mimeType = 'image/gif';
        break;
      case '.webp':
        mimeType = 'image/webp';
        break;
    }

    res.json({
      success: true,
      data: {
        filename,
        size: stats.size,
        mimeType,
        createdAt: stats.birthtime.toISOString(),
        modifiedAt: stats.mtime.toISOString(),
        url: `/api/images/${filename}`,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error getting image info:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error',
      },
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
    });
  }
});

export default router;