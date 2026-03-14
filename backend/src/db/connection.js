import fs from "fs";
import path from "path";
import { DatabaseSync } from "node:sqlite";
import { config } from "../config.js";

const dbDir = path.dirname(config.dbFile);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new DatabaseSync(config.dbFile);
db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA foreign_keys = ON;");
