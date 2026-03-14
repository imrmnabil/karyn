import { db } from "../db/connection.js";

export function getAllContentAsLegacyShape() {
  const rows = db
    .prepare("SELECT section, content_key, content_value FROM content ORDER BY section, content_key")
    .all();

  const payload = {};
  for (const row of rows) {
    if (!payload[row.section]) payload[row.section] = {};
    payload[row.section][row.content_key] = row.content_value;
  }
  return payload;
}

export function getSectionContent(section) {
  const rows = db
    .prepare("SELECT content_key, content_value FROM content WHERE section = ? ORDER BY content_key")
    .all(section);

  if (!rows.length) return null;
  const result = {};
  for (const row of rows) {
    result[row.content_key] = row.content_value;
  }
  return result;
}

export function upsertSectionContent(section, updates, userId) {
  const stmt = db.prepare(`
    INSERT INTO content (section, content_key, content_value, updated_by)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(section, content_key) DO UPDATE SET
      content_value = excluded.content_value,
      updated_by = excluded.updated_by,
      updated_at = datetime('now')
  `);

  const entries = Object.entries(updates);
  db.exec("BEGIN");
  try {
    for (const [key, value] of entries) {
      stmt.run(section, key, String(value ?? ""), userId ?? null);
    }
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }

  return getSectionContent(section);
}

export function upsertField(section, key, value, userId) {
  db.prepare(
    `INSERT INTO content (section, content_key, content_value, updated_by)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(section, content_key) DO UPDATE SET
       content_value = excluded.content_value,
       updated_by = excluded.updated_by,
       updated_at = datetime('now')`
  ).run(section, key, String(value ?? ""), userId ?? null);

  return db
    .prepare("SELECT section, content_key, content_value FROM content WHERE section = ? AND content_key = ?")
    .get(section, key);
}
