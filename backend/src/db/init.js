import bcrypt from "bcryptjs";
import { db } from "./connection.js";
import { schemaSql } from "./schema.js";
import { config } from "../config.js";

db.exec(schemaSql);

const existingAdmin = db.prepare("SELECT id FROM users WHERE email = ?").get(config.adminEmail);
if (!existingAdmin) {
  const passwordHash = bcrypt.hashSync(config.adminPassword, 12);
  db.prepare(
    `INSERT INTO users (email, password_hash, role) VALUES (?, ?, 'admin')`
  ).run(config.adminEmail, passwordHash);
}

console.log("Database initialized:", config.dbFile);
