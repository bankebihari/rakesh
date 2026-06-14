import { put, list } from "@vercel/blob";

const TOKEN        = process.env.BLOB_READ_WRITE_TOKEN;
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

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "PUT, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-filename, x-admin-id, x-admin-pass");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "PUT") return res.status(405).json({ error: "Method not allowed" });

  try {
    const adminId   = req.headers["x-admin-id"]   || "";
    const adminPass = req.headers["x-admin-pass"]  || "";
    const creds     = await getCreds();

    if (adminId !== creds.id || adminPass !== creds.password) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const filename = req.headers["x-filename"] || `photo-${Date.now()}.jpg`;
    const blob = await put(`rakesh-photo/${filename}`, req, {
      access: "public",
      token: TOKEN,
    });

    return res.status(200).json({ url: blob.url });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
