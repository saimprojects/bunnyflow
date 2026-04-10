import { Router } from "express";
import JSZip from "jszip";
import { extensionFiles } from "./extensionFiles";
import { whiskExtensionFiles } from "./whiskExtensionFiles";
import fs from "fs";
import path from "path";

const router = Router();

async function buildExtensionZip(version: string) {
  const zip = new JSZip();

  for (const { name, data, binary } of extensionFiles) {
    if (binary) {
      zip.file(name, data, { compression: "STORE" });
    } else {
      zip.file(name, data, { compression: "DEFLATE", compressionOptions: { level: 6 } });
    }
  }

  const buffer = await zip.generateAsync({ type: "nodebuffer", platform: "UNIX" });
  return buffer;
}

async function serveZip(res: any, version: string) {
  try {
    const buffer = await buildExtensionZip(version);
    res.setHeader("Content-Disposition", `attachment; filename="bunnyflow-extension-${version}.zip"`);
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Length", buffer.length);
    res.setHeader("Cache-Control", "no-cache");
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: "Failed to build extension package" });
  }
}

// ── Custom uploaded extension (admin-uploaded ZIP) ─────────────────────────
const CUSTOM_EXT = path.join(process.cwd(), "uploads", "custom-extension.zip");
const CUSTOM_META = path.join(process.cwd(), "uploads", "extension-meta.json");

router.get("/custom-extension.zip", (req, res) => {
  if (!fs.existsSync(CUSTOM_EXT)) {
    res.status(404).json({ error: "No custom extension uploaded yet" });
    return;
  }
  let filename = "bunnyflow-extension.zip";
  try {
    const meta = JSON.parse(fs.readFileSync(CUSTOM_META, "utf8"));
    if (meta.filename) filename = meta.filename;
  } catch { /* ignore */ }
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Cache-Control", "no-cache");
  res.sendFile(CUSTOM_EXT);
});

// ── Whisk standalone extension ─────────────────────────────────────────────
router.get("/bunnyflow-whisk-extension-v1.0.zip", async (_req, res) => {
  try {
    const zip = new JSZip();
    for (const { name, data, binary } of whiskExtensionFiles) {
      if (binary) zip.file(name, data, { compression: "STORE" });
      else zip.file(name, data, { compression: "DEFLATE", compressionOptions: { level: 6 } });
    }
    const buffer = await zip.generateAsync({ type: "nodebuffer", platform: "UNIX" });
    res.setHeader("Content-Disposition", 'attachment; filename="bunnyflow-whisk-extension-v1.0.zip"');
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Length", buffer.length);
    res.setHeader("Cache-Control", "no-cache");
    res.send(buffer);
  } catch {
    res.status(500).json({ error: "Failed to build Whisk extension" });
  }
});

// ── Main extension (all versions) ──────────────────────────────────────────
router.get("/bunnyflow-extension-v3.6.0.zip", (_req, res) => serveZip(res, "v3.6.0"));
router.get("/bunnyflow-extension-v3.5.5.zip", (_req, res) => serveZip(res, "v3.5.5"));
router.get("/bunnyflow-extension-v3.5.4.zip", (_req, res) => serveZip(res, "v3.5.4"));
router.get("/bunnyflow-extension-v3.5.3.zip", (_req, res) => serveZip(res, "v3.5.3"));
router.get("/bunnyflow-extension-v3.5.2.zip", (_req, res) => serveZip(res, "v3.5.2"));
router.get("/bunnyflow-extension-v3.5.1.zip", (_req, res) => serveZip(res, "v3.5.1"));
router.get("/bunnyflow-extension-v3.5.0.zip", (_req, res) => serveZip(res, "v3.5.0"));
router.get("/bunnyflow-extension-v3.4.0.zip", (_req, res) => serveZip(res, "v3.4.0"));
router.get("/bunnyflow-extension-v3.3.0.zip", (_req, res) => serveZip(res, "v3.3.0"));
router.get("/bunnyflow-extension-v3.2.0.zip", (_req, res) => serveZip(res, "v3.2.0"));
router.get("/bunnyflow-extension-v3.1.0.zip", (_req, res) => serveZip(res, "v3.1.0"));
router.get("/bunnyflow-extension-v3.0.0.zip", (_req, res) => serveZip(res, "v3.0.0"));

export default router;
