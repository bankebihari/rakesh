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
  if (req.method !== "GET") return res.status(405).end();

  try {
    const db  = await getDb();
    const doc = await db.collection("se_data").findOne({ id: "se_portfolio" });
    if (!doc?.resume?.url) return res.status(404).json({ error: "No resume found" });

    const fileRes = await fetch(doc.resume.url);
    if (!fileRes.ok) return res.status(502).json({ error: "Could not fetch resume" });

    res.setHeader("Content-Type", fileRes.headers.get("content-type") || "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${doc.resume.name || "resume.pdf"}"`);

    const buffer = await fileRes.arrayBuffer();
    return res.send(Buffer.from(buffer));
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
