import { Request, Response, NextFunction } from "express";
import { verifyToken } from "./auth.service";
import { JwtPayload } from "./auth.types";

// Mở rộng Request để đính kèm user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ success: false, error: "Không tìm thấy token xác thực" });
    return;
  }

  const token = authHeader.split(" ")[1];
  const payload = verifyToken(token);

  if (!payload) {
    res.status(401).json({ success: false, error: "Token không hợp lệ hoặc đã hết hạn" });
    return;
  }

  if (payload.role !== "ADMIN") {
    res.status(403).json({ success: false, error: "Bạn không có quyền truy cập chức năng này" });
    return;
  }

  req.user = payload;
  next();
}
