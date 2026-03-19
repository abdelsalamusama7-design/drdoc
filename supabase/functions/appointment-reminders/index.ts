import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const now = new Date();

    // Get appointments in the next 24 hours and 3 hours
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in3h = new Date(now.getTime() + 3 * 60 * 60 * 1000);

    // Format dates for comparison
    const todayStr = now.toISOString().split("T")[0];
    const tomorrowStr = in24h.toISOString().split("T")[0];

    // Fetch upcoming appointments (today and tomorrow)
    const { data: appointments, error: aptErr } = await supabase
      .from("appointments")
      .select("*")
      .in("date", [todayStr, tomorrowStr])
      .eq("status", "scheduled");

    if (aptErr) throw aptErr;
    if (!appointments || appointments.length === 0) {
      return new Response(JSON.stringify({ message: "No upcoming appointments", created: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get all clinic members to notify (staff of each clinic)
    const clinicIds = [...new Set(appointments.map((a: any) => a.clinic_id).filter(Boolean))];
    
    let members: any[] = [];
    if (clinicIds.length > 0) {
      const { data: m } = await supabase
        .from("clinic_members")
        .select("user_id, clinic_id")
        .in("clinic_id", clinicIds)
        .eq("is_active", true);
      members = m || [];
    }

    let createdCount = 0;

    for (const apt of appointments) {
      const aptDateTime = new Date(`${apt.date}T${apt.time}`);
      const diffMs = aptDateTime.getTime() - now.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      // Skip past appointments
      if (diffHours < 0) continue;

      let reminderType = "";
      let title = "";
      let body = "";

      // 24-hour reminder: between 23 and 25 hours
      if (diffHours >= 23 && diffHours <= 25) {
        reminderType = "reminder_24h";
        title = `⏰ تذكير: موعد غداً`;
        body = `المريض ${apt.patient_name} لديه موعد غداً الساعة ${apt.time}`;
      }
      // 3-hour reminder: between 2.5 and 3.5 hours
      else if (diffHours >= 2.5 && diffHours <= 3.5) {
        reminderType = "reminder_3h";
        title = `🔔 تذكير عاجل: موعد قريب`;
        body = `المريض ${apt.patient_name} لديه موعد بعد ${Math.round(diffHours)} ساعات - الساعة ${apt.time}`;
      } else {
        continue;
      }

      // Check if notification already sent for this appointment + type
      const { data: existing } = await supabase
        .from("notifications")
        .select("id")
        .eq("reference_id", apt.id)
        .eq("type", reminderType)
        .limit(1);

      if (existing && existing.length > 0) continue;

      // Notify all staff of this clinic
      const clinicStaff = members.filter((m: any) => m.clinic_id === apt.clinic_id);

      for (const staff of clinicStaff) {
        await supabase.from("notifications").insert({
          user_id: staff.user_id,
          clinic_id: apt.clinic_id,
          title,
          body,
          type: reminderType,
          reference_id: apt.id,
          reference_type: "appointment",
        });
        createdCount++;
      }
    }

    return new Response(
      JSON.stringify({ message: "Reminders processed", created: createdCount }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
