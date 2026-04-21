import { Router } from "express";
import { login } from "./auth.service";

export const authRouter = Router();

authRouter.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      res.status(400).json({ success: false, error: "Vui lòng cung cấp username và password" });
      return;
    }

    const result = await login(username, password);
    
    if (!result) {
      res.status(401).json({ success: false, error: "Sai tên đăng nhập hoặc mật khẩu" });
      return;
    }

    res.json({
      success: true,
      message: "Đăng nhập thành công",
      data: result
    });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    res.status(500).json({ success: false, error: "Lỗi máy chủ nội bộ" });
  }
});
