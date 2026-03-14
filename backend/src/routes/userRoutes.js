import bcrypt from "bcryptjs";
import { Router } from "express";
import { db } from "../db/connection.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { writeAuditLog } from "../services/auditService.js";

export const userRouter = Router();

userRouter.get("/", requireAuth, requireRole("admin"), (_req, res) => {
  const users = db
    .prepare("SELECT id, email, role, created_at AS createdAt, updated_at AS updatedAt FROM users ORDER BY id ASC")
    .all();
  return res.json(users);
});

userRouter.post("/", requireAuth, requireRole("admin"), (req, res) => {
  const { email, password, role } = req.body || {};
  if (!email || !password || !role) {
    return res.status(400).json({ error: "email, password and role are required" });
  }
  if (!["admin", "editor"].includes(role)) {
    return res.status(400).json({ error: "role must be admin or editor" });
  }

  const exists = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (exists) {
    return res.status(409).json({ error: "User already exists" });
  }

  const passwordHash = bcrypt.hashSync(password, 12);
  const result = db
    .prepare("INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)")
    .run(email, passwordHash, role);

  writeAuditLog({
    actorUserId: req.session.user.id,
    action: "user.create",
    targetType: "user",
    targetId: String(result.lastInsertRowid),
    details: { email, role }
  });

  return res.status(201).json({ id: result.lastInsertRowid, email, role });
});

userRouter.put("/:id/role", requireAuth, requireRole("admin"), (req, res) => {
  const id = Number(req.params.id);
  const { role } = req.body || {};

  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Invalid user id" });
  }
  if (!["admin", "editor"].includes(role)) {
    return res.status(400).json({ error: "role must be admin or editor" });
  }

  db.prepare("UPDATE users SET role = ?, updated_at = datetime('now') WHERE id = ?").run(role, id);

  writeAuditLog({
    actorUserId: req.session.user.id,
    action: "user.role_update",
    targetType: "user",
    targetId: String(id),
    details: { role }
  });

  const user = db
    .prepare("SELECT id, email, role, created_at AS createdAt, updated_at AS updatedAt FROM users WHERE id = ?")
    .get(id);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  return res.json(user);
});
