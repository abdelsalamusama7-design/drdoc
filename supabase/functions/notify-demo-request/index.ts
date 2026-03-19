import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { clinic_name, contact_name, phone, email, specialty, message, request_type } = await req.json();

    const RECIPIENT = "instacut95@gmail.com";

    const emailBody = `
طلب ${request_type === "demo" ? "عرض توضيحي" : "تواصل"} جديد من موقع Smart Clinic

━━━━━━━━━━━━━━━━━━━━━━━━━━
اسم العيادة: ${clinic_name || "-"}
اسم المسؤول: ${contact_name || "-"}
رقم الهاتف: ${phone || "-"}
البريد الإلكتروني: ${email || "-"}
التخصص: ${specialty || "-"}
الرسالة: ${message || "-"}
━━━━━━━━━━━━━━━━━━━━━━━━━━
    `.trim();

    // Use Resend-like service or SMTP - for now use a simple fetch to a mail API
    // We'll use the built-in Supabase SMTP by sending via the Deno smtp approach
    // For simplicity, use a webhook/email API

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    
    if (RESEND_API_KEY) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Smart Clinic <onboarding@resend.dev>",
          to: [RECIPIENT],
          subject: `طلب جديد: ${clinic_name} - ${contact_name}`,
          text: emailBody,
        }),
      });

      if (!res.ok) {
        console.error("Resend error:", await res.text());
      }
    } else {
      // Fallback: log the request (email will still be saved in demo_requests table)
      console.log("No RESEND_API_KEY configured. Email notification skipped.");
      console.log("Demo request received:", emailBody);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
