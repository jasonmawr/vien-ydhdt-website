/**
 * @file patient.middleware.ts
 * @description JWT middleware cho bệnh nhân — tách biệt với admin auth.
 */
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      patient?: { id: number; phone: string; role: string };
    }
  }
}

export function requirePatient(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Cần đăng nhập để tiếp tục' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const secret = process.env.PATIENT_JWT_SECRET || process.env.JWT_SECRET!;
    const payload = jwt.verify(token, secret) as any;

    if (payload.role !== 'patient') {
      res.status(403).json({ success: false, error: 'Token không hợp lệ' });
      return;
    }

    req.patient = { id: payload.sub, phone: payload.phone, role: payload.role };
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Token hết hạn hoặc không hợp lệ' });
  }
}
