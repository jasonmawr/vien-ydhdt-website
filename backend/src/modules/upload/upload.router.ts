/**
 * @file upload.router.ts
 * @description File upload + Media Library API.
 * Base path: /api/upload
 */
import { Router, type Request, type Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { requireAdmin } from '../auth/auth.middleware';
import { logger } from '../../shared/logger';

export const uploadRouter = Router();

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|gif|webp|pdf|doc|docx|xls|xlsx|ppt|pptx|zip|mp4|mp3)$/i;
    if (!allowed.test(file.originalname)) {
      cb(new Error('Loại file không được hỗ trợ'));
      return;
    }
    cb(null, true);
  },
});

// POST /api/upload — Tải lên 1 hoặc nhiều file
uploadRouter.post('/', requireAdmin, upload.array('files', 20), (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    const singleFile = req.file;

    if (!files?.length && !singleFile) {
      res.status(400).json({ success: false, error: 'Không tìm thấy file tải lên' });
      return;
    }

    const fileList = files?.length ? files : [singleFile!];
    const data = fileList.map(f => ({
      url: `/uploads/${f.filename}`,
      filename: f.filename,
      originalName: f.originalname,
      mimetype: f.mimetype,
      size: f.size,
    }));

    // Tương thích ngược — trả cả data[0] lẫn mảng
    res.json({ success: true, data: data.length === 1 ? data[0] : data, files: data });
  } catch (error) {
    logger.error('[Upload] Error: %o', error);
    res.status(500).json({ success: false, error: 'Lỗi upload file' });
  }
});

// GET /api/upload/list — Danh sách tất cả files trong Media Library
uploadRouter.get('/list', requireAdmin, (_req: Request, res: Response) => {
  try {
    const files = fs.readdirSync(uploadDir).map(filename => {
      const filepath = path.join(uploadDir, filename);
      const stat = fs.statSync(filepath);
      const ext = path.extname(filename).toLowerCase().slice(1);
      return {
        filename,
        url: `/uploads/${filename}`,
        size: stat.size,
        type: getFileType(ext),
        ext,
        createdAt: stat.birthtime.toISOString(),
        modifiedAt: stat.mtime.toISOString(),
      };
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({ success: true, data: files, total: files.length });
  } catch (err) {
    logger.error('[Upload] list error: %o', err);
    res.status(500).json({ success: false, error: 'Lỗi đọc danh sách file' });
  }
});

// GET /api/upload/stats — Thống kê dung lượng
uploadRouter.get('/stats', requireAdmin, (_req: Request, res: Response) => {
  try {
    const files = fs.readdirSync(uploadDir);
    let totalSize = 0;
    const byType: Record<string, { count: number; size: number }> = {};

    for (const filename of files) {
      const stat = fs.statSync(path.join(uploadDir, filename));
      totalSize += stat.size;
      const ext = path.extname(filename).toLowerCase().slice(1);
      const type = getFileType(ext);
      if (!byType[type]) byType[type] = { count: 0, size: 0 };
      byType[type].count++;
      byType[type].size += stat.size;
    }

    res.json({
      success: true,
      data: {
        totalFiles: files.length,
        totalSize,
        totalSizeMb: (totalSize / 1024 / 1024).toFixed(2),
        byType,
      },
    });
  } catch (err) {
    logger.error('[Upload] stats error: %o', err);
    res.status(500).json({ success: false, error: 'Lỗi thống kê' });
  }
});

// DELETE /api/upload/:filename — Xóa file
uploadRouter.delete('/:filename', requireAdmin, (req: Request, res: Response) => {
  try {
    const filename = path.basename(req.params.filename);
    const filepath = path.join(uploadDir, filename);

    if (!fs.existsSync(filepath)) {
      res.status(404).json({ success: false, error: 'File không tồn tại' });
      return;
    }

    fs.unlinkSync(filepath);
    logger.info(`[Upload] Đã xóa file: ${filename}`);
    res.json({ success: true, message: 'Đã xóa file thành công' });
  } catch (err) {
    logger.error('[Upload] delete error: %o', err);
    res.status(500).json({ success: false, error: 'Lỗi xóa file' });
  }
});

function getFileType(ext: string): string {
  if (/^(jpg|jpeg|png|gif|webp|svg|bmp)$/.test(ext)) return 'image';
  if (/^(mp4|avi|mov|webm|mkv)$/.test(ext)) return 'video';
  if (/^(mp3|wav|ogg|flac)$/.test(ext)) return 'audio';
  if (ext === 'pdf') return 'pdf';
  if (/^(doc|docx)$/.test(ext)) return 'word';
  if (/^(xls|xlsx)$/.test(ext)) return 'excel';
  if (/^(ppt|pptx)$/.test(ext)) return 'powerpoint';
  return 'other';
}
