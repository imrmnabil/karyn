import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { db } from "./connection.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../../..");
const frontendPublic = path.resolve(repoRoot, "frontend/public");

const IMAGES = [
  { name: "logo.png", mime: "image/png" },
  { name: "Homepage_image_1.webp", mime: "image/webp" },
  { name: "Weight_loss_support_page_image_1.webp", mime: "image/webp" },
  { name: "Menopause_support_woman.webp", mime: "image/webp" },
  { name: "woman_with_coffee_cup.webp", mime: "image/webp" },
  { name: "Karyn_Headshot.webp", mime: "image/webp" },
  { name: "weight_loss_programme_page_food_image.webp", mime: "image/webp" },
  { name: "Home_page_image_2.webp", mime: "image/webp" },
  { name: "menopause_support_Image_2.webp", mime: "image/webp" }
];

const existsStmt = db.prepare("SELECT 1 FROM media_files WHERE public_url = ?");
const insertStmt = db.prepare(`
  INSERT INTO media_files (original_name, mime_type, file_size, storage_path, public_url)
  VALUES (?, ?, ?, ?, ?)
`);

db.exec("BEGIN");
try {
  let inserted = 0;

  for (const { name, mime } of IMAGES) {
    const absolutePath = path.join(frontendPublic, name);

    if (!fs.existsSync(absolutePath)) {
      console.warn("Skipping missing file:", name);
      continue;
    }

    const publicUrl = `/${name}`;
    if (existsStmt.get(publicUrl)) {
      console.log("Already seeded, skipping:", publicUrl);
      continue;
    }

    const fileSize = fs.statSync(absolutePath).size;
    const storagePath = path.relative(repoRoot, absolutePath).replace(/\\/g, "/");

    insertStmt.run(name, mime, fileSize, storagePath, publicUrl);
    inserted += 1;
  }

  db.exec("COMMIT");
  console.log(`Seeded ${inserted} image record(s) into media_files.`);
} catch (error) {
  db.exec("ROLLBACK");
  throw error;
}
