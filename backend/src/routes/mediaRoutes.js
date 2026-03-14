import fs from "fs";
import path from "path";
import { Router } from "express";
import multer from "multer";
import { config } from "../config.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { db } from "../db/connection.js";
import { writeAuditLog } from "../services/auditService.js";

if (!fs.existsSync(config.uploadsDir)) {
  fs.mkdirSync(config.uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, config.uploadsDir),
  filename: (_req, file, cb) => {
    const safeBase = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${safeBase}`);
  }
});

const allowedTypes = new Set(["image/png", "image/jpeg", "image/webp", "application/pdf"]);

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!allowedTypes.has(file.mimetype)) {
      return cb(new Error("Unsupported file type"));
    }
    return cb(null, true);
  }
});

export const mediaRouter = Router();

mediaRouter.get("/", requireAuth, requireRole("admin", "editor"), (_req, res) => {
  const rows = db
    .prepare(
      `SELECT id, original_name AS originalName, mime_type AS mimeType, file_size AS size, public_url AS publicUrl, uploaded_at AS uploadedAt
       FROM media_files
       ORDER BY uploaded_at DESC`
    )
    .all();

  return res.json(rows);
});

mediaRouter.post("/upload", requireAuth, requireRole("admin", "editor"), upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "file is required" });
  }

  const publicUrl = `/uploads/${path.basename(req.file.path)}`;
  const result = db.prepare(
    `INSERT INTO media_files (original_name, mime_type, file_size, storage_path, public_url, uploaded_by)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(
    req.file.originalname,
    req.file.mimetype,
    req.file.size,
    req.file.path,
    publicUrl,
    req.session.user.id
  );

  writeAuditLog({
    actorUserId: req.session.user.id,
    action: "media.upload",
    targetType: "media_file",
    targetId: String(result.lastInsertRowid),
    details: { originalName: req.file.originalname, publicUrl }
  });

  return res.status(201).json({
    id: result.lastInsertRowid,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    size: req.file.size,
    publicUrl
  });
});
