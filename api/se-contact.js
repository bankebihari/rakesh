import { MongoClient } from "mongodb";
import nodemailer from "nodemailer";

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
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { name, email, subject, message } = req.body || {};

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Name, email and message are required." });
    }

    // 1. Save to MongoDB
    const db = await getDb();
    await db.collection("messages").insertOne({
      name, email, subject, message,
      receivedAt: new Date(),
    });

    // 2. Send email to Rakesh
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    await transporter.sendMail({
      from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
      to: "rakeshkumardangi@gmail.com",
      replyTo: email,
      subject: subject ? `Portfolio: ${subject}` : `New message from ${name}`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#f9f9f9;border-radius:8px;overflow:hidden;">
          <div style="background:#f59e0b;padding:20px 28px;">
            <h2 style="color:#000;margin:0;font-size:1.2rem;">New Portfolio Message</h2>
          </div>
          <div style="padding:24px 28px;background:#fff;">
            <p style="margin:0 0 12px;"><strong>From:</strong> ${name}</p>
            <p style="margin:0 0 12px;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            ${subject ? `<p style="margin:0 0 12px;"><strong>Subject:</strong> ${subject}</p>` : ""}
            <hr style="border:none;border-top:1px solid #eee;margin:16px 0;">
            <p style="margin:0;white-space:pre-wrap;line-height:1.65;">${message}</p>
          </div>
          <div style="padding:14px 28px;background:#f5f5f5;font-size:0.78rem;color:#888;">
            Sent from Rakesh Kumar's portfolio contact form
          </div>
        </div>
      `,
    });

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
