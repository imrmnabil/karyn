import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { db } from "../db/connection.js";

export const auditRouter = Router();

auditRouter.get("/", requireAuth, requireRole("admin", "editor"), (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit || 50), 1), 200);
  const rows = db
    .prepare(
      `SELECT id, actor_user_id AS actorUserId, action, target_type AS targetType, target_id AS targetId, details_json AS detailsJson, created_at AS createdAt
       FROM audit_logs
       ORDER BY id DESC
       LIMIT ?`
    )
    .all(limit)
    .map((row) => ({
      ...row,
      details: row.detailsJson ? JSON.parse(row.detailsJson) : null,
      detailsJson: undefined
    }));

  return res.json(rows);
});
