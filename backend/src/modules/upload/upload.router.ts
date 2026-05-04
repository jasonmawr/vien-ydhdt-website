import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { requireAdmin } from '../auth/auth.middleware';

export const uploadRouter = Router();

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max file size
});

// POST /api/upload
// Requires admin privilege. Uploads a single file and returns the URL.
uploadRouter.post('/', requireAdmin, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
       res.status(400).json({ success: false, error: 'Không tìm thấy file tải lên' });
       return;
    }
    
    // Xây dựng URL công khai để truy cập file
    const fileUrl = `/uploads/${req.file.filename}`;
    
    res.json({
      success: true,
      data: {
        url: fileUrl,
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error('[Upload] Error:', error);
    res.status(500).json({ success: false, error: 'Lỗi upload file' });
  }
});
