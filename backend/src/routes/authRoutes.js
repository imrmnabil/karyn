import bcrypt from "bcryptjs";
import { Router } from "express";
import { db } from "../db/connection.js";
import { requireAuth } from "../middleware/auth.js";
import { writeAuditLog } from "../services/auditService.js";

export const authRouter = Router();

authRouter.post("/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  const user = db.prepare("SELECT id, email, password_hash, role FROM users WHERE email = ?").get(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    writeAuditLog({
      action: "auth.login_failed",
      targetType: "user",
      targetId: email,
      details: { email }
    });
    return res.status(401).json({ error: "Invalid credentials" });
  }

  req.session.user = { id: user.id, email: user.email, role: user.role };
  writeAuditLog({
    actorUserId: user.id,
    action: "auth.login_success",
    targetType: "user",
    targetId: String(user.id)
  });
  return res.json({ user: req.session.user });
});

authRouter.post("/logout", requireAuth, (req, res) => {
  const actorUserId = req.session.user.id;
  req.session.destroy(() => {
    writeAuditLog({
      actorUserId,
      action: "auth.logout",
      targetType: "user",
      targetId: String(actorUserId)
    });
    res.clearCookie("karyn.sid");
    return res.status(204).send();
  });
});

authRouter.get("/me", (req, res) => {
  return res.json({ user: req.session?.user || null });
});

  authRouter.put("/change-password", requireAuth, (req, res) => {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "currentPassword and newPassword are required" });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: "New password must be at least 8 characters" });
    }

    const user = db.prepare("SELECT id, password_hash FROM users WHERE id = ?").get(req.session.user.id);
    if (!user || !bcrypt.compareSync(currentPassword, user.password_hash)) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    const newHash = bcrypt.hashSync(newPassword, 12);
    db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(newHash, user.id);

    writeAuditLog({
      actorUserId: user.id,
      action: "auth.password_changed",
      targetType: "user",
      targetId: String(user.id)
    });
    return res.json({ ok: true });
  });
