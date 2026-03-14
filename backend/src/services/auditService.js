import { db } from "../db/connection.js";

export function writeAuditLog({ actorUserId = null, action, targetType, targetId = null, details = null }) {
  db.prepare(
    `INSERT INTO audit_logs (actor_user_id, action, target_type, target_id, details_json)
     VALUES (?, ?, ?, ?, ?)`
  ).run(actorUserId, action, targetType, targetId, details ? JSON.stringify(details) : null);
}
