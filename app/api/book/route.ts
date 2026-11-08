import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";

// Ensure data directory exists (gracefully handles read-only serverless environments like Vercel)
function ensureDataDir(): string | null {
  const localDir = path.join(process.cwd(), "data");
  try {
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    return localDir;
  } catch {
    // Vercel serverless has a read-only root; fallback to /tmp
    try {
      const tmpDir = path.join("/tmp", "data");
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }
      return tmpDir;
    } catch (e) {
      console.warn("[Storage]: Filesystem is read-only, skipping local disk write.");
      return null;
    }
  }
}

// Append to CSV with proper field escaping
function appendToCsv(lead: Record<string, any>) {
  try {
    const dataDir = ensureDataDir();
    if (!dataDir) return;
    const csvFile = path.join(dataDir, "leads.csv");
    const headers = [
      "ID",
      "Date",
      "Name",
      "Business",
      "Phone",
      "Email",
      "Revenue",
      "Preferred Time",
      "Notes",
    ];

    const escapeCsv = (val: any) => {
      if (val === undefined || val === null) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const row = [
      escapeCsv(lead.id),
      escapeCsv(lead.createdAtFormatted),
      escapeCsv(lead.name),
      escapeCsv(lead.business),
      escapeCsv(lead.phone),
      escapeCsv(lead.email),
      escapeCsv(lead.revenue),
      escapeCsv(lead.timeslot),
      escapeCsv(lead.notes || ""),
    ].join(",") + "\n";

    if (!fs.existsSync(csvFile)) {
      fs.writeFileSync(csvFile, headers.join(",") + "\n" + row, "utf8");
    } else {
      fs.appendFileSync(csvFile, row, "utf8");
    }
  } catch (err) {
    console.warn("[Storage CSV]: Could not write to disk:", err);
  }
}

// Save to JSON array
function saveToJson(lead: Record<string, any>) {
  try {
    const dataDir = ensureDataDir();
    if (!dataDir) return;
    const jsonFile = path.join(dataDir, "leads.json");
    let leads = [];

    if (fs.existsSync(jsonFile)) {
      try {
        const content = fs.readFileSync(jsonFile, "utf8");
        leads = JSON.parse(content);
        if (!Array.isArray(leads)) leads = [];
      } catch {
        leads = [];
      }
    }

    // Prepend newest lead
    leads.unshift(lead);
    fs.writeFileSync(jsonFile, JSON.stringify(leads, null, 2), "utf8");
  } catch (err) {
    console.warn("[Storage JSON]: Could not write to disk:", err);
  }
}

// Send email alert (Supports direct Gmail SMTP or Resend API)
async function sendEmailAlert(lead: Record<string, any>) {
  const rawEmails =
    process.env.NOTIFICATION_EMAIL || process.env.CONTACT_EMAIL || "";
  const toEmails = rawEmails
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

  if (toEmails.length === 0) {
    console.log(
      "[Lead Alert]: Saved to data/leads.json & data/leads.csv. (To enable instant email alerts, configure NOTIFICATION_EMAIL in .env.local)"
    );
    return { sent: false, reason: "Missing notification email" };
  }

  const subject = `🔥 New Discovery Call Lead: ${lead.name} (${lead.business})`;

  const emailHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #fdfbf7; border-radius: 16px; border: 1px solid #e6e1dd;">
      <div style="background: #0f172a; padding: 20px 24px; border-radius: 12px; margin-bottom: 24px; color: #ffffff;">
        <span style="display: inline-block; background: #d95d39; color: #ffffff; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 4px 8px; border-radius: 6px; margin-bottom: 8px;">New Lead</span>
        <h2 style="margin: 0; font-size: 20px; font-weight: 800; color: #ffffff;">New Discovery Call Requested</h2>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14.5px;">
        <tr style="border-bottom: 1px solid #e6e1dd;">
          <td style="padding: 10px 0; color: #64748b; font-weight: 600; width: 35%;">Name:</td>
          <td style="padding: 10px 0; color: #0f172a; font-weight: 700;">${lead.name}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e6e1dd;">
          <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Business:</td>
          <td style="padding: 10px 0; color: #0f172a; font-weight: 700;">${lead.business}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e6e1dd;">
          <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Phone:</td>
          <td style="padding: 10px 0; color: #0f172a; font-weight: 700;">
            <a href="tel:${lead.phone}" style="color: #d95d39; text-decoration: none;">${lead.phone}</a>
          </td>
        </tr>
        <tr style="border-bottom: 1px solid #e6e1dd;">
          <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Email:</td>
          <td style="padding: 10px 0; color: #0f172a; font-weight: 700;">
            <a href="mailto:${lead.email}" style="color: #d95d39; text-decoration: none;">${lead.email}</a>
          </td>
        </tr>
        <tr style="border-bottom: 1px solid #e6e1dd;">
          <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Monthly Revenue:</td>
          <td style="padding: 10px 0; color: #0f172a; font-weight: 700;">${lead.revenue}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e6e1dd;">
          <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Preferred Slot:</td>
          <td style="padding: 10px 0; color: #0f172a; font-weight: 700;">${lead.timeslot}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #64748b; font-weight: 600; vertical-align: top;">Bottleneck / Notes:</td>
          <td style="padding: 10px 0; color: #334155; line-height: 1.5;">${lead.notes || "None provided"}</td>
        </tr>
      </table>

      <div style="text-align: center; margin-top: 24px; padding-top: 18px; border-top: 1px solid #e6e1dd;">
        <a href="tel:${lead.phone}" style="display: inline-block; background: #0f172a; color: #ffffff; padding: 12px 24px; border-radius: 999px; font-weight: 700; text-decoration: none; font-size: 14px; margin-right: 8px;">
          Call ${lead.name}
        </a>
        <a href="mailto:${lead.email}" style="display: inline-block; background: #e2ddd5; color: #0f172a; padding: 12px 24px; border-radius: 999px; font-weight: 700; text-decoration: none; font-size: 14px;">
          Email Lead
        </a>
      </div>
    </div>
  `;

  // 1. Direct Gmail SMTP (Works without a custom domain, sends directly to all recipients)
  const gmailUser = process.env.GMAIL_USER?.trim();
  const gmailPass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, "");

  if (gmailUser && gmailPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: gmailUser,
          pass: gmailPass,
        },
      });

      const info = await transporter.sendMail({
        from: `"Dope Digital Works" <${gmailUser}>`,
        to: toEmails.join(", "),
        subject: subject,
        html: emailHtml,
      });

      console.log("[Gmail SMTP Success]: Delivered lead to", toEmails.join(", "), info.messageId);
      return { sent: true, provider: "gmail", messageId: info.messageId };
    } catch (err: any) {
      console.error("[Gmail SMTP Error]:", err?.message || err);
      // Fall through to Resend fallback
    }
  }

  // 2. Resend API Fallback
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    const fromAddress =
      process.env.EMAIL_FROM || "Dope Digital Works <onboarding@resend.dev>";
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: fromAddress,
          to: toEmails,
          subject: subject,
          html: emailHtml,
        }),
      });

      if (res.ok) {
        console.log("[Resend API Success]: Delivered lead to", toEmails.join(", "));
        return { sent: true, provider: "resend" };
      } else {
        const err = await res.text();
        console.error("[Resend API Error]:", err);
      }
    } catch (err: any) {
      console.error("[Resend Fallback Error]:", err?.message || err);
    }
  }

  return { sent: false };
}

// Optional Discord Webhook (Instant mobile ping)
async function sendDiscordAlert(lead: Record<string, any>) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [
          {
            title: `🔥 New Discovery Call: ${lead.name}`,
            color: 0xd95d39,
            fields: [
              { name: "Business", value: lead.business, inline: true },
              { name: "Phone", value: lead.phone, inline: true },
              { name: "Email", value: lead.email, inline: true },
              { name: "Revenue", value: lead.revenue, inline: true },
              { name: "Time Slot", value: lead.timeslot, inline: true },
              { name: "Notes", value: lead.notes || "None provided" },
            ],
            footer: { text: "Dope Digital Works Lead Intake" },
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    });
  } catch (err) {
    console.error("[Discord Webhook Error]:", err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, business, phone, email, revenue, timeslot, notes } = body;

    // Basic validation
    if (!name || !business || !phone || !email) {
      return NextResponse.json(
        { error: "Name, business, phone, and email are required fields." },
        { status: 400 }
      );
    }

    const now = new Date();
    const lead = {
      id: "lead_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      name: String(name).trim(),
      business: String(business).trim(),
      phone: String(phone).trim(),
      email: String(email).trim().toLowerCase(),
      revenue: revenue || "Generating $10k–$50k/mo",
      timeslot: timeslot || "Morning (9am - 12pm EST)",
      notes: notes ? String(notes).trim() : "",
      createdAt: now.toISOString(),
      createdAtFormatted: now.toLocaleString("en-US", {
        timeZone: "America/New_York",
        dateStyle: "medium",
        timeStyle: "short",
      }),
    };

    // 1. Save to local storage (both JSON and CSV)
    saveToJson(lead);
    appendToCsv(lead);

    // 2. Trigger alerts (await them so Vercel Serverless doesn't terminate before dispatch completes)
    await Promise.allSettled([
      sendEmailAlert(lead),
      sendDiscordAlert(lead),
    ]);

    return NextResponse.json({
      success: true,
      message: "Discovery call requested successfully",
      leadId: lead.id,
    });
  } catch (error: any) {
    console.error("[Booking API Error]:", error);
    return NextResponse.json(
      { error: "Failed to process request. Please try again." },
      { status: 500 }
    );
  }
}

// GET endpoint to view or export leads
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format");
  const dataDir = ensureDataDir();

  if (!dataDir) {
    return format === "csv"
      ? new Response("No leads recorded yet.", { status: 404 })
      : NextResponse.json({ total: 0, leads: [] });
  }

  if (format === "csv") {
    const csvFile = path.join(dataDir, "leads.csv");
    if (!fs.existsSync(csvFile)) {
      return new Response("No leads recorded yet.", { status: 404 });
    }
    const csvContent = fs.readFileSync(csvFile, "utf8");
    return new Response(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="leads-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  const jsonFile = path.join(dataDir, "leads.json");
  if (!fs.existsSync(jsonFile)) {
    return NextResponse.json({ total: 0, leads: [] });
  }

  try {
    const leads = JSON.parse(fs.readFileSync(jsonFile, "utf8"));
    return NextResponse.json({ total: leads.length, leads });
  } catch {
    return NextResponse.json({ total: 0, leads: [] });
  }
}

