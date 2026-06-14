import { put } from "@vercel/blob";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
let cachedClient = null;

async function getDb() {
  if (cachedClient) return cachedClient.db("rakesh");
  const client = new MongoClient(uri, { tls: true, tlsAllowInvalidCertificates: true });
  await client.connect();
  cachedClient = client;
  return client.db("rakesh");
}

const DEFAULT_ID   = "rakesh2025";
const DEFAULT_PASS = "Bablu@1234";

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "PUT, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-filename, x-admin-id, x-admin-pass");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "PUT") return res.status(405).json({ error: "Method not allowed" });

  try {
    // Verify credentials from headers
    const adminId   = req.headers["x-admin-id"]   || "";
    const adminPass = req.headers["x-admin-pass"]  || "";

    let storedId   = DEFAULT_ID;
    let storedPass = DEFAULT_PASS;

    try {
      const db  = await getDb();
      const doc = await db.collection("config").findOne({ _id: "admin" });
      if (doc) { storedId = doc.id; storedPass = doc.password; }
    } catch (_) {}

    if (adminId !== storedId || adminPass !== storedPass) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const filename = req.headers["x-filename"] || `photo-${Date.now()}.jpg`;
    const blob = await put(`rakesh-photo/${filename}`, req, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    // Update imageUrl in portfolio data (optional - non-fatal)
    try {
      const db = await getDb();
      await db.collection("data").updateOne(
        { id: "portfolio" },
        { $set: { "hero.imageUrl": blob.url, id: "portfolio" } },
        { upsert: true }
      );
    } catch (_) {}

    return res.status(200).json({ url: blob.url });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
