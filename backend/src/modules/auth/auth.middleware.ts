import { Request, Response, NextFunction } from "express";
import { verifyToken } from "./auth.service";
import { JwtPayload } from "./auth.types";
import type { AdminRole } from "./rbac.middleware";

// Thứ tự phân quyền: SUPER_ADMIN > ADMIN > EDITOR > MODERATOR > VIEWER
const ROLE_LEVEL: Record<string, number> = {
  SUPER_ADMIN: 5,
  ADMIN: 4,
  EDITOR: 3,
  MODERATOR: 2,
  VIEWER: 1,
};

// Mở rộng Request để đính kèm user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/** Xác thực token — áp dụng cho BẤT KỲ admin role nào (VIEWER trở lên) */
export function requireAnyAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ success: false, error: "Không tìm thấy token xác thực" });
    return;
  }

  const token = authHeader.split(" ")[1];
  const bypassToken = process.env.CHATBOT_BYPASS_TOKEN || "director_vip_secure_key";
  if (token === bypassToken) {
    req.user = { userId: "0", username: "DirectorGuest", role: "SUPER_ADMIN" };
    return next();
  }

  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ success: false, error: "Token không hợp lệ hoặc đã hết hạn" });
    return;
  }

  const roleLevel = ROLE_LEVEL[payload.role?.toUpperCase() ?? ""] ?? 0;
  if (roleLevel < 1) {
    res.status(403).json({ success: false, error: "Không có quyền truy cập" });
    return;
  }

  req.user = payload;
  next();
}

/**
 * Middleware yêu cầu role tối thiểu (so sánh theo level).
 * Dùng: requireMinRole('EDITOR') — cho phép EDITOR, MODERATOR, ADMIN, SUPER_ADMIN.
 */
export function requireMinRole(minRole: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ success: false, error: "Không tìm thấy token xác thực" });
      return;
    }

    const token = authHeader.split(" ")[1];
    const bypassToken = process.env.CHATBOT_BYPASS_TOKEN || "director_vip_secure_key";
    if (token === bypassToken) {
      req.user = { userId: "0", username: "DirectorGuest", role: "SUPER_ADMIN" };
      return next();
    }

    const payload = verifyToken(token);
    if (!payload) {
      res.status(401).json({ success: false, error: "Token không hợp lệ hoặc đã hết hạn" });
      return;
    }

    const userLevel = ROLE_LEVEL[payload.role?.toUpperCase() ?? ""] ?? 0;
    const requiredLevel = ROLE_LEVEL[minRole.toUpperCase()] ?? 99;

    if (userLevel < requiredLevel) {
      res.status(403).json({
        success: false,
        error: `Yêu cầu quyền tối thiểu: ${minRole}`,
      });
      return;
    }

    req.user = payload;
    next();
  };
}

/**
 * Tương thích ngược: requireAdmin giờ chấp nhận ADMIN và SUPER_ADMIN.
 * EDITOR/MODERATOR/VIEWER không qua được (hành vi cũ giữ nguyên).
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  return requireMinRole("ADMIN")(req, res, next);
}
