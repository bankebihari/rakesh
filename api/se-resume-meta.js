import { list } from "@vercel/blob";

const TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { blobs } = await list({ prefix: "portfolio-data/main", token: TOKEN });
    if (!blobs.length) return res.status(404).json({ error: "No resume" });
    const r = await fetch(blobs[0].url);
    const data = r.ok ? await r.json() : null;
    if (data?.resume) return res.status(200).json(data.resume);
    return res.status(404).json({ error: "No resume" });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
