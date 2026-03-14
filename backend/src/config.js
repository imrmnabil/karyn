import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, "..");

export const config = {
  env: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 4000),
  sessionSecret: process.env.SESSION_SECRET || "dev-secret-change-me",
  dbFile: path.resolve(backendRoot, process.env.DB_FILE || "./data/cms.sqlite"),
  uploadsDir: path.resolve(backendRoot, process.env.UPLOADS_DIR || "./uploads"),
  frontendDist: path.resolve(backendRoot, "../frontend/dist"),
  legacyJsonPath: path.resolve(backendRoot, "../_data/content.json"),
  adminEmail: process.env.ADMIN_EMAIL || "admin@example.com",
  adminPassword: process.env.ADMIN_PASSWORD || "ChangeMeNow123!"
};
