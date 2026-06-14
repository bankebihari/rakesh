import { list } from "@vercel/blob";

const TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-admin-id, x-admin-pass");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  // Simple auth check
  const id   = req.headers["x-admin-id"];
  const pass = req.headers["x-admin-pass"];
  if (!id || !pass) return res.status(401).json({ error: "Unauthorized" });

  try {
    const { blobs } = await list({ prefix: "portfolio-data/messages", token: TOKEN });
    if (!blobs.length) return res.status(200).json([]);
    const r = await fetch(`${blobs[0].url}?t=${Date.now()}`, { cache: "no-store" });
    const msgs = r.ok ? await r.json() : [];
    return res.status(200).json(msgs.reverse()); // newest first
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
