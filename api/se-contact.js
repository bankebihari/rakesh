import { put, list } from "@vercel/blob";
import { Resend } from "resend";

const TOKEN   = process.env.BLOB_READ_WRITE_TOKEN;
const MSG_KEY = "portfolio-data/messages.json";

async function readMessages() {
  const { blobs } = await list({ prefix: "portfolio-data/messages", token: TOKEN });
  if (!blobs.length) return [];
  const r = await fetch(`${blobs[0].url}?t=${Date.now()}`, { cache: "no-store" });
  return r.ok ? r.json() : [];
}

async function saveMessages(msgs) {
  await put(MSG_KEY, JSON.stringify(msgs), {
    access: "public", addRandomSuffix: false,
    allowOverwrite: true, token: TOKEN,
    contentType: "application/json",
  });
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { name, email, phone, subject, message } = req.body || {};

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Name, email and message are required." });
    }

    // 1. Save to Vercel Blob (non-fatal)
    try {
      const msgs = await readMessages();
      msgs.push({ name, email, phone: phone || "", subject: subject || "", message, receivedAt: new Date().toISOString() });
      await saveMessages(msgs);
    } catch (dbErr) {
      console.error("Blob save error (non-fatal):", dbErr.message);
    }

    // 2. Send email via Resend to both recipients
    const resend = new Resend(process.env.RESEND_API_KEY);

    const emailHtml = `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#f9f9f9;border-radius:8px;overflow:hidden;">
        <div style="background:#0284c7;padding:20px 28px;">
          <h2 style="color:#fff;margin:0;font-size:1.2rem;">New Portfolio Message</h2>
        </div>
        <div style="padding:24px 28px;background:#fff;">
          <p style="margin:0 0 12px;"><strong>From:</strong> ${name}</p>
          <p style="margin:0 0 12px;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          ${phone ? `<p style="margin:0 0 12px;"><strong>Phone:</strong> <a href="tel:${phone}">${phone}</a></p>` : ""}
          ${subject ? `<p style="margin:0 0 12px;"><strong>Subject:</strong> ${subject}</p>` : ""}
          <hr style="border:none;border-top:1px solid #eee;margin:16px 0;">
          <p style="margin:0;white-space:pre-wrap;line-height:1.65;">${message}</p>
        </div>
        <div style="padding:14px 28px;background:#f5f5f5;font-size:0.78rem;color:#888;">
          Sent from Rakesh Kumar's portfolio contact form
        </div>
      </div>
    `;

    const result = await resend.emails.send({
      from: "Portfolio Contact <onboarding@resend.dev>",
      to: ["banke741852@gmail.com"],
      reply_to: email,
      subject: subject ? `Portfolio: ${subject}` : `New message from ${name}`,
      html: emailHtml,
    });

    return res.status(200).json({ ok: true, resend: result });
  } catch (e) {
    return res.status(500).json({ error: e.message, stack: e.stack?.split('\n')[0] });
  }
}
