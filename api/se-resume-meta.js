import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
let cachedClient = null;

async function getDb() {
  if (cachedClient) return cachedClient.db("rakesh");
  const client = new MongoClient(uri);
  await client.connect();
  cachedClient = client;
  return client.db("rakesh");
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const db  = await getDb();
    const doc = await db.collection("data").findOne({ id: "portfolio" });
    if (doc?.resume) return res.status(200).json(doc.resume);
    return res.status(404).json({ error: "No resume" });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
