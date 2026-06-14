import { put, list } from "@vercel/blob";

const TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const KEY   = "portfolio-data/main.json";

async function readData() {
  const { blobs } = await list({ prefix: "portfolio-data/main", token: TOKEN });
  if (!blobs.length) return null;
  const res = await fetch(blobs[0].url);
  return res.ok ? res.json() : null;
}

async function writeData(data) {
  await put(KEY, JSON.stringify(data), {
    access: "public",
    addRandomSuffix: false,
      allowOverwrite: true,
    token: TOKEN,
    contentType: "application/json",
  });
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    if (req.method === "GET") {
      const data = await readData();
      return res.status(200).json(data || null);
    }

    if (req.method === "POST") {
      const existing = await readData() || {};
      await writeData({ ...existing, ...req.body });
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
