import fs from "fs";
import path from "path";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import session from "express-session";

import { config } from "./config.js";
import { db } from "./db/connection.js";
import { schemaSql } from "./db/schema.js";
import { authRouter } from "./routes/authRoutes.js";
import { contentRouter } from "./routes/contentRoutes.js";
import { mediaRouter } from "./routes/mediaRoutes.js";
import { auditRouter } from "./routes/auditRoutes.js";
import { userRouter } from "./routes/userRoutes.js";

db.exec(schemaSql);

if (!fs.existsSync(config.uploadsDir)) {
  fs.mkdirSync(config.uploadsDir, { recursive: true });
}

const app = express();
app.set("trust proxy", 1);

app.use(
  helmet({
    contentSecurityPolicy: false
  })
);

app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true
  })
);

app.use(express.json({ limit: "2mb" }));
app.use(
  session({
    name: "karyn.sid",
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: config.env === "production",
      maxAge: 1000 * 60 * 60 * 12
    }
  })
);

app.use("/uploads", express.static(config.uploadsDir));
app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRouter);
app.use("/api/content", contentRouter);
app.use("/api/media", mediaRouter);
app.use("/api/audit", auditRouter);
app.use("/api/users", userRouter);

app.use((err, _req, res, _next) => {
  if (err?.message === "Unsupported file type") {
    return res.status(400).json({ error: err.message });
  }
  return res.status(500).json({ error: "Internal server error" });
});

app.listen(config.port, () => {
  console.log(`CMS backend running on http://localhost:${config.port}`);
});
