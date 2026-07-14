import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import nodemailer from "npm:nodemailer";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const { record, type } = payload;

    // Only proceed if it's an insert into planner_invites
    if (type !== "INSERT" || !record || !record.invitee_email) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const SMTP_HOST = Deno.env.get("SMTP_HOST");
    const SMTP_PORT = Deno.env.get("SMTP_PORT") || "465";
    const SMTP_USER = Deno.env.get("SMTP_USER");
    const SMTP_PASS = Deno.env.get("SMTP_PASS");
    const SMTP_FROM = Deno.env.get("SMTP_FROM") || "Lumen <invites@orionedgedigital.com>";

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      console.warn("SMTP credentials are not set. Email not sent.");
      return new Response(JSON.stringify({ success: false, reason: "Missing SMTP credentials" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const inviteeEmail = record.invitee_email;
    const role = record.role;

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT),
      secure: parseInt(SMTP_PORT) === 465, // true for 465, false for other ports
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: SMTP_FROM,
      to: inviteeEmail,
      subject: "You've been invited to collaborate on a Lumen Planner",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Lumen Invitation</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #050505; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #050505; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px; background-color: #0f0f11; border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 12px; overflow: hidden;">
                  <tr>
                    <td style="padding: 40px; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
                      <h1 style="margin: 0; color: #10b981; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Lumen</h1>
                      <p style="margin: 5px 0 0; color: #a1a1aa; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">by Orion Edge Digital</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="margin: 0 0 20px; font-size: 22px; font-weight: 600; color: #ffffff;">You've been invited!</h2>
                      <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #a1a1aa;">
                        You have been invited to collaborate on a Lumen planner as an <strong><span style="color: #10b981; text-transform: capitalize;">${role}</span></strong>. 
                      </p>
                      <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: #a1a1aa;">
                        Log in to your Lumen account with this email address to accept or decline the invitation and view the planner dashboard.
                      </p>
                      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                        <tr>
                          <td align="center">
                            <a href="https://venture-ledger-pro.vercel.app/auth" style="display: inline-block; padding: 14px 28px; background-color: #10b981; color: #000000; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px; text-align: center;">Go to Lumen Dashboard</a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 30px; text-align: center; background-color: #0a0a0c; border-top: 1px solid rgba(255, 255, 255, 0.05);">
                      <p style="margin: 0; font-size: 13px; color: #52525b;">
                        If you did not expect this invitation, you can safely ignore this email.
                      </p>
                      <p style="margin: 10px 0 0; font-size: 13px; color: #52525b;">
                        &copy; 2026 Orion Edge Digital. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    console.log("Message sent: %s", info.messageId);

    return new Response(JSON.stringify({ success: true, messageId: info.messageId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
