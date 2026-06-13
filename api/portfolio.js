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
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const db  = await getDb();
    // Using a separate collection "se_data" so the developer portfolio's
    // "data" collection is never touched.
    const col = db.collection("se_data");

    if (req.method === "GET") {
      const doc = await col.findOne({ id: "se_portfolio" });
      return res.status(200).json(doc || null);
    }

    if (req.method === "POST") {
      const body = req.body;
      await col.updateOne(
        { id: "se_portfolio" },
        { $set: { ...body, id: "se_portfolio" } },
        { upsert: true }
      );
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
