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

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const db  = await getDb();
    const { name, email, subject, message } = req.body || {};
    await db.collection("se_messages").insertOne({
      name, email, subject, message,
      receivedAt: new Date(),
    });
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
