import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  getAllContentAsLegacyShape,
  getSectionContent,
  upsertField,
  upsertSectionContent
} from "../services/contentService.js";
import { writeAuditLog } from "../services/auditService.js";
import {
  getSchema,
  hasField,
  hasSection,
  validateSectionPayload
} from "../services/contentSchema.js";

export const contentRouter = Router();

contentRouter.get("/", (_req, res) => {
  return res.json(getAllContentAsLegacyShape());
});

contentRouter.get("/_schema", requireAuth, requireRole("admin", "editor"), (_req, res) => {
  return res.json(getSchema());
});

contentRouter.put("/", requireAuth, requireRole("admin", "editor"), (req, res) => {
  const payload = req.body;
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return res.status(400).json({ error: "Body must be an object with sections" });
  }

  for (const [section, sectionPayload] of Object.entries(payload)) {
    if (!hasSection(section)) {
      return res.status(400).json({ error: `Unknown section: ${section}` });
    }
    const validation = validateSectionPayload(section, sectionPayload);
    if (!validation.ok) {
      return res.status(400).json({ error: validation.error });
    }
  }

  for (const [section, sectionPayload] of Object.entries(payload)) {
    upsertSectionContent(section, sectionPayload, req.session.user.id);
  }

  writeAuditLog({
    actorUserId: req.session.user.id,
    action: "content.bulk_put",
    targetType: "content",
    targetId: "all",
    details: { sections: Object.keys(payload) }
  });

  return res.json(getAllContentAsLegacyShape());
});

contentRouter.get("/:section", (req, res) => {
  const { section } = req.params;
  if (!hasSection(section)) {
    return res.status(404).json({ error: "Unknown section" });
  }
  const payload = getSectionContent(section);
  if (!payload) {
    return res.status(404).json({ error: "Section has no data" });
  }
  return res.json(payload);
});

contentRouter.patch("/:section", requireAuth, requireRole("admin", "editor"), (req, res) => {
  const { section } = req.params;
  const updates = req.body;
  if (!hasSection(section)) {
    return res.status(404).json({ error: "Unknown section" });
  }
  const validation = validateSectionPayload(section, updates);
  if (!validation.ok) {
    return res.status(400).json({ error: validation.error });
  }

  const updated = upsertSectionContent(section, updates, req.session.user.id);
  writeAuditLog({
    actorUserId: req.session.user.id,
    action: "content.section_patch",
    targetType: "content_section",
    targetId: section,
    details: { keys: Object.keys(updates) }
  });
  return res.json(updated);
});

contentRouter.put("/:section/:key", requireAuth, requireRole("admin", "editor"), (req, res) => {
  const { section, key } = req.params;
  const { value } = req.body || {};

  if (!hasSection(section)) {
    return res.status(404).json({ error: "Unknown section" });
  }
  if (!hasField(section, key)) {
    return res.status(400).json({ error: `Unknown field for section '${section}': ${key}` });
  }
  if (typeof value === "undefined") {
    return res.status(400).json({ error: "Body must include value" });
  }

  const updated = upsertField(section, key, value, req.session.user.id);
  writeAuditLog({
    actorUserId: req.session.user.id,
    action: "content.field_put",
    targetType: "content_field",
    targetId: `${section}.${key}`
  });
  return res.json(updated);
});
