import { list, put } from "@vercel/blob";

const TOKEN        = process.env.BLOB_READ_WRITE_TOKEN;
const KEY          = "portfolio-data/admin.json";
const DEFAULT_ID   = "rakesh2025";
const DEFAULT_PASS = "Bablu@1234";

async function getCreds() {
  try {
    const { blobs } = await list({ prefix: "portfolio-data/admin", token: TOKEN });
    if (!blobs.length) return { id: DEFAULT_ID, password: DEFAULT_PASS };
    const r = await fetch(blobs[0].url);
    return r.ok ? r.json() : { id: DEFAULT_ID, password: DEFAULT_PASS };
  } catch {
    return { id: DEFAULT_ID, password: DEFAULT_PASS };
  }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { id, password, action, newId, newPass } = req.body || {};
    const creds = await getCreds();

    if (id !== creds.id || password !== creds.password) {
      return res.status(401).json({ ok: false, error: "Invalid ID or password." });
    }

    if (action === "update") {
      if (!newId?.trim() || !newPass?.trim()) {
        return res.status(400).json({ ok: false, error: "New ID and password required." });
      }
      await put(KEY, JSON.stringify({ id: newId.trim(), password: newPass.trim() }), {
        access: "public",
        addRandomSuffix: false,
        token: TOKEN,
        contentType: "application/json",
      });
      return res.status(200).json({ ok: true, message: "Credentials updated." });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
