import fs from "fs";
import { config } from "../config.js";

let schema = {};
let lastLoadedMtimeMs = 0;

function buildSchema(seed) {
  const nextSchema = {};
  for (const [section, values] of Object.entries(seed || {})) {
    nextSchema[section] = new Set(Object.keys(values || {}));
  }
  return nextSchema;
}

function ensureSchemaLoaded() {
  const stats = fs.statSync(config.legacyJsonPath);
  if (stats.mtimeMs === lastLoadedMtimeMs && Object.keys(schema).length > 0) {
    return;
  }

  const raw = fs.readFileSync(config.legacyJsonPath, "utf8");
  const seed = JSON.parse(raw);
  schema = buildSchema(seed);
  lastLoadedMtimeMs = stats.mtimeMs;
}

export function getSchema() {
  ensureSchemaLoaded();
  const shape = {};
  for (const [section, keys] of Object.entries(schema)) {
    shape[section] = Array.from(keys).sort();
  }
  return shape;
}

export function hasSection(section) {
  ensureSchemaLoaded();
  return Boolean(schema[section]);
}

export function hasField(section, field) {
  ensureSchemaLoaded();
  return Boolean(schema[section]?.has(field));
}

export function validateSectionPayload(section, payload) {
  ensureSchemaLoaded();
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { ok: false, error: "Body must be a key/value object" };
  }

  const invalidKeys = Object.keys(payload).filter((key) => !hasField(section, key));
  if (invalidKeys.length) {
    return {
      ok: false,
      error: `Unknown fields for section '${section}': ${invalidKeys.join(", ")}`
    };
  }

  return { ok: true };
}
