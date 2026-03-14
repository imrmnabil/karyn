import fs from "fs";
import { db } from "./connection.js";
import { config } from "../config.js";

if (!fs.existsSync(config.legacyJsonPath)) {
  console.error("Legacy content file not found:", config.legacyJsonPath);
  process.exit(1);
}

const raw = fs.readFileSync(config.legacyJsonPath, "utf8");
const data = JSON.parse(raw);

const upsert = db.prepare(`
  INSERT INTO content (section, content_key, content_value)
  VALUES (?, ?, ?)
  ON CONFLICT(section, content_key) DO UPDATE SET
    content_value = excluded.content_value,
    updated_at = datetime('now')
`);

db.exec("BEGIN");
try {
  for (const [section, values] of Object.entries(data)) {
    if (!values || typeof values !== "object") continue;
    for (const [contentKey, contentValue] of Object.entries(values)) {
      upsert.run(section, contentKey, contentValue == null ? "" : String(contentValue));
    }
  }
  db.exec("COMMIT");
} catch (error) {
  db.exec("ROLLBACK");
  throw error;
}

console.log("Seeded content from:", config.legacyJsonPath);
