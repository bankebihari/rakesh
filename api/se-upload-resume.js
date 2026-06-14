import { put, del, list } from "@vercel/blob";

const TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const DATA_KEY = "portfolio-data/main.json";

async function readData() {
  const { blobs } = await list({ prefix: "portfolio-data/main", token: TOKEN });
  if (!blobs.length) return {};
  const r = await fetch(`${blobs[0].url}?t=${Date.now()}`, { cache: "no-store" });
  return r.ok ? r.json() : {};
}

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-filename");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    if (req.method === "PUT") {
      const filename = req.headers["x-filename"] || "resume.pdf";
      const blob = await put(`rakesh-resume/${filename}`, req, {
        access: "public",
        token: TOKEN,
      });

      const cl   = req.headers["content-length"];
      const size = cl
        ? parseInt(cl) > 1048576
          ? (parseInt(cl) / 1048576).toFixed(2) + " MB"
          : (parseInt(cl) / 1024).toFixed(1) + " KB"
        : "—";

      const meta = { name: filename, url: blob.url, size, uploadedAt: new Date().toLocaleDateString() };
      const existing = await readData();
      await put(DATA_KEY, JSON.stringify({ ...existing, resume: meta }), {
        access: "public",
        addRandomSuffix: false,
      allowOverwrite: true,
        token: TOKEN,
        contentType: "application/json",
      });

      return res.status(200).json({ url: blob.url });
    }

    if (req.method === "DELETE") {
      const { url } = req.body || {};
      if (url) await del(url, { token: TOKEN });
      const existing = await readData();
      delete existing.resume;
      await put(DATA_KEY, JSON.stringify(existing), {
        access: "public",
        addRandomSuffix: false,
      allowOverwrite: true,
        token: TOKEN,
        contentType: "application/json",
      });
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
