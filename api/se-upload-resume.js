import { put, del } from "@vercel/blob";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
let cachedClient = null;

async function getDb() {
  if (cachedClient) return cachedClient.db("portfolio");
  const client = new MongoClient(uri);
  await client.connect();
  cachedClient = client;
  return client.db("portfolio");
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
      const blob     = await put(`se-resume/${filename}`, req, {
        access: "public",
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      const db  = await getDb();
      const meta = {
        name: filename, url: blob.url,
        size: req.headers["content-length"]
          ? parseInt(req.headers["content-length"]) > 1048576
            ? (parseInt(req.headers["content-length"]) / 1048576).toFixed(2) + " MB"
            : (parseInt(req.headers["content-length"]) / 1024).toFixed(1) + " KB"
          : "—",
        uploadedAt: new Date().toLocaleDateString(),
      };
      await db.collection("se_data").updateOne(
        { id: "se_portfolio" },
        { $set: { resume: meta, id: "se_portfolio" } },
        { upsert: true }
      );
      return res.status(200).json({ url: blob.url });
    }

    if (req.method === "DELETE") {
      const { url } = req.body || {};
      if (url) await del(url, { token: process.env.BLOB_READ_WRITE_TOKEN });
      const db = await getDb();
      await db.collection("se_data").updateOne(
        { id: "se_portfolio" },
        { $unset: { resume: "" } }
      );
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
