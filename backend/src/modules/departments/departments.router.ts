/**
 * @file departments.router.ts
 * @description Express Router cho module Chuyên khoa
 * Base path: /api/departments
 */
import { Router, type Request, type Response } from "express";
import { getAllDepartments, getDepartmentById } from "./departments.service";

const router = Router();

// GET /api/departments — Lấy tất cả chuyên khoa
router.get("/", async (_req: Request, res: Response) => {
  try {
    const departments = await getAllDepartments();
    res.json({ success: true, data: departments, total: departments.length });
  } catch (err) {
    console.error("[departments] GET /:", err);
    res.status(500).json({ success: false, error: "Lỗi máy chủ" });
  }
});

// GET /api/departments/:id — Lấy chi tiết một chuyên khoa
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, error: "ID không hợp lệ" });
      return;
    }

    const dept = await getDepartmentById(id);
    if (!dept) {
      res.status(404).json({ success: false, error: "Không tìm thấy chuyên khoa" });
      return;
    }

    res.json({ success: true, data: dept });
  } catch (err) {
    console.error("[departments] GET /:id:", err);
    res.status(500).json({ success: false, error: "Lỗi máy chủ" });
  }
});

export default router;
