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
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const db  = await getDb();
    const col = db.collection("data");

    if (req.method === "GET") {
      const doc = await col.findOne({ id: "portfolio" });
      return res.status(200).json(doc || null);
    }

    if (req.method === "POST") {
      await col.updateOne(
        { id: "portfolio" },
        { $set: { ...req.body, id: "portfolio" } },
        { upsert: true }
      );
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
