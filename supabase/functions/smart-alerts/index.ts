import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { action } = await req.json();
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

    // ── Check upcoming appointments and send reminders ──
    if (action === "appointment_reminders") {
      const { data: appointments } = await supabase
        .from("appointments")
        .select("*")
        .eq("date", tomorrow)
        .eq("status", "scheduled");

      let notified = 0;
      for (const apt of appointments || []) {
        if (!apt.patient_id) continue;
        
        // Find user by patient phone
        const { data: patient } = await supabase
          .from("patients").select("phone").eq("id", apt.patient_id).single();
        if (!patient?.phone) continue;

        const { data: profile } = await supabase
          .from("profiles").select("id").eq("phone", patient.phone).single();
        if (!profile?.id) continue;

        // Check if already notified
        const { data: existing } = await supabase
          .from("notifications")
          .select("id")
          .eq("reference_id", apt.id)
          .eq("type", "appointment_reminder")
          .single();
        if (existing) continue;

        await supabase.from("notifications").insert({
          user_id: profile.id,
          clinic_id: apt.clinic_id,
          title: "تذكير بموعدك غداً",
          body: `لديك موعد غداً ${tomorrow} الساعة ${apt.time?.substring(0, 5)}. هل تريد تأكيد الحضور؟`,
          type: "appointment_reminder",
          reference_id: apt.id,
          reference_type: "appointment",
        });
        notified++;
      }
      return jsonResponse({ success: true, reminders_sent: notified });
    }

    // ── Check overdue follow-ups ──
    if (action === "followup_check") {
      const { data: overdueFollowUps } = await supabase
        .from("follow_ups")
        .select("*, patients(phone, name)")
        .eq("status", "pending")
        .lt("follow_up_date", today);

      let alerted = 0;
      for (const fu of overdueFollowUps || []) {
        const patient = (fu as any).patients;
        if (!patient?.phone) continue;

        const { data: profile } = await supabase
          .from("profiles").select("id").eq("phone", patient.phone).single();
        if (!profile?.id) continue;

        await supabase.from("notifications").insert({
          user_id: profile.id,
          clinic_id: fu.clinic_id,
          title: "تذكير متابعة فائت",
          body: `لديك موعد متابعة فائت. السبب: ${fu.reason || "متابعة عامة"}. يرجى حجز موعد جديد.`,
          type: "followup_overdue",
          reference_id: fu.id,
          reference_type: "follow_up",
        });

        await supabase.from("follow_ups").update({ status: "missed" }).eq("id", fu.id);
        alerted++;
      }
      return jsonResponse({ success: true, alerts_sent: alerted });
    }

    // ── Award loyalty points for today's completed visits ──
    if (action === "award_loyalty") {
      const { data: completedVisits } = await supabase
        .from("visits")
        .select("patient_id, clinic_id")
        .eq("date", today)
        .eq("status", "completed");

      let awarded = 0;
      for (const visit of completedVisits || []) {
        // Check if loyalty record exists
        const { data: existing } = await supabase
          .from("loyalty_points")
          .select("id, total_points")
          .eq("patient_id", visit.patient_id)
          .eq("clinic_id", visit.clinic_id)
          .single();

        if (existing) {
          await supabase.from("loyalty_points")
            .update({ total_points: existing.total_points + 10 })
            .eq("id", existing.id);
        } else {
          await supabase.from("loyalty_points").insert({
            patient_id: visit.patient_id,
            clinic_id: visit.clinic_id,
            total_points: 10,
          });
        }

        await supabase.from("loyalty_transactions").insert({
          patient_id: visit.patient_id,
          clinic_id: visit.clinic_id,
          points: 10,
          type: "earn",
          reason: "زيارة مكتملة",
          reference_id: visit.patient_id,
        });
        awarded++;
      }
      return jsonResponse({ success: true, points_awarded: awarded });
    }

    return jsonResponse({ error: "Unknown action" }, 400);
  } catch (e) {
    console.error("smart-alerts error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
      "Content-Type": "application/json",
    },
  });
}
