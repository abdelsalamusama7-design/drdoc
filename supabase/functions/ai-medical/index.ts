import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const HEALTH_ASSISTANT_SYSTEM = `أنت مساعد طبي ذكي متخصص في التوعية الصحية، وخاصة في مجال طب الذكورة والعقم والمسالك البولية.

دورك:
1. تقديم معلومات صحية عامة ودقيقة
2. شرح الفحوصات والتحاليل الطبية الشائعة
3. توضيح الأعراض العامة ومتى يجب زيارة الطبيب
4. تقديم نصائح للحفاظ على الصحة العامة
5. شرح العلاجات والأدوية الشائعة بشكل مبسط

قواعد صارمة:
- لا تشخص أي مرض أبداً
- لا تصف أي دواء
- وجّه دائماً لزيارة الطبيب المختص للتشخيص والعلاج
- كن واضحاً أن المعلومات توعوية وليست بديلاً عن الاستشارة الطبية
- أجب بالعربية إلا إذا سُئلت بالإنجليزية
- كن ودوداً ومطمئناً
- إذا كانت الأعراض خطيرة، انصح بالتوجه فوراً للطوارئ`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const body = await req.json();
    const { action, patient_id, data: requestData, messages } = body;

    // ── Legacy mode: simple chat (backward compatible) ──
    if (!action && messages) {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [{ role: "system", content: HEALTH_ASSISTANT_SYSTEM }, ...messages.slice(-10)],
        }),
      });
      if (!response.ok) {
        if (response.status === 429) return jsonResponse({ reply: "عذراً، عدد الطلبات كثير. يرجى المحاولة بعد قليل." });
        if (response.status === 402) return jsonResponse({ reply: "عذراً، الخدمة غير متاحة مؤقتاً." });
        throw new Error("AI gateway error");
      }
      const data = await response.json();
      return jsonResponse({ reply: data.choices?.[0]?.message?.content || "عذراً، لم أتمكن من الإجابة." });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // ── Action: Generate Smart Doctor Summary ──
    if (action === "doctor_summary") {
      const [patientRes, visitsRes, notesRes, alertsRes, formsRes, prescRes] = await Promise.all([
        supabase.from("patients").select("*").eq("id", patient_id).single(),
        supabase.from("visits").select("*").eq("patient_id", patient_id).order("date", { ascending: false }).limit(5),
        supabase.from("doctor_notes").select("*").eq("patient_id", patient_id).order("date", { ascending: false }).limit(10),
        supabase.from("medical_alerts").select("*").eq("patient_id", patient_id).eq("is_active", true),
        supabase.from("pre_visit_forms").select("*").eq("patient_id", patient_id).order("created_at", { ascending: false }).limit(1),
        supabase.from("prescriptions").select("*").eq("patient_id", patient_id).order("created_at", { ascending: false }).limit(3),
      ]);

      const patient = patientRes.data;
      const visits = visitsRes.data || [];
      const notes = notesRes.data || [];
      const alerts = alertsRes.data || [];
      const preVisitForm = formsRes.data?.[0];

      const prompt = `You are a medical assistant. Generate a concise Arabic summary for a doctor about to see this patient.

Patient: ${patient?.name}, Age: ${patient?.age}, Gender: ${patient?.gender}
Allergies: ${patient?.allergies?.join(", ") || "None"}
Current Medications: ${patient?.current_medications?.join(", ") || "None"}
Medical History: ${patient?.medical_history || "None"}
Visit Count: ${patient?.visit_count || 0}

Recent Visits (last 5):
${visits.map((v: any) => `- ${v.date}: ${v.visit_type} | Diagnosis: ${v.diagnosis || "N/A"} | Notes: ${v.doctor_notes || "N/A"}`).join("\n")}

Active Medical Alerts:
${alerts.map((a: any) => `- [${a.severity}] ${a.title}: ${a.description || ""}`).join("\n") || "None"}

${preVisitForm ? `Pre-Visit Form:
- Symptoms: ${preVisitForm.symptoms || "N/A"}
- Complaints: ${preVisitForm.complaints || "N/A"}
- Pain Level: ${preVisitForm.pain_level}/10
- Notes: ${preVisitForm.additional_notes || "N/A"}` : "No pre-visit form."}

Doctor Notes: ${notes.slice(0, 5).map((n: any) => `[${n.date}] ${n.title}: ${n.description || ""}`).join(" | ") || "None"}

Generate JSON:
- summary: Brief overview (2-3 sentences in Arabic)
- key_findings: Array of important findings (Arabic strings)
- critical_alerts: Array of critical things doctor must know (Arabic strings)
- recommended_actions: Array of suggested next steps (Arabic strings)
- risk_level: "low" | "medium" | "high"
Return ONLY valid JSON.`;

      const aiResponse = await callAI(LOVABLE_API_KEY, prompt);
      return jsonResponse({ ...aiResponse, pre_visit_form: preVisitForm });
    }

    // ── Action: Patient Health Assistant ──
    if (action === "health_assistant") {
      const { question } = requestData;
      const { data: patient } = await supabase.from("patients").select("*").eq("id", patient_id).single();

      const prompt = `You are a friendly health assistant for a clinic patient. Answer in Arabic.
Patient: ${patient?.name}, Age: ${patient?.age}
Allergies: ${patient?.allergies?.join(", ") || "None"}
Current Medications: ${patient?.current_medications?.join(", ") || "None"}

Patient Question: "${question}"

Rules: Never diagnose. Recommend doctor visits. Give general guidance only.
Respond with JSON:
- answer: Your response in Arabic
- category: "medication" | "general" | "appointment" | "emergency"
- urgency: "low" | "medium" | "high"
Return ONLY valid JSON.`;

      const aiResponse = await callAI(LOVABLE_API_KEY, prompt);
      return jsonResponse(aiResponse);
    }

    // ── Action: Patient Behavior Analysis ──
    if (action === "behavior_analysis") {
      const { data: patient } = await supabase.from("patients").select("*").eq("id", patient_id).single();
      const { data: appointments } = await supabase.from("appointments").select("*").eq("patient_id", patient_id).order("date", { ascending: false }).limit(20);
      const { data: followUps } = await supabase.from("follow_ups").select("*").eq("patient_id", patient_id);

      const noShows = appointments?.filter((a: any) => a.status === "no_show" || a.status === "cancelled").length || 0;
      const missedFollowUps = followUps?.filter((f: any) => f.status === "missed").length || 0;

      const prompt = `Analyze patient behavior. Respond in Arabic.
Patient: ${patient?.name}, Segment: ${patient?.segment}
Total Appointments: ${appointments?.length || 0}, No-Shows: ${noShows}
Missed Follow-ups: ${missedFollowUps}, Visit Count: ${patient?.visit_count || 0}
Risk Score: ${patient?.risk_score || 0}

Provide JSON:
- compliance_score: 0-100
- risk_factors: Array (Arabic)
- recommendations: Array (Arabic)
- engagement_level: "high" | "medium" | "low"
- predicted_no_show_risk: "low" | "medium" | "high"
Return ONLY valid JSON.`;

      const aiResponse = await callAI(LOVABLE_API_KEY, prompt);
      return jsonResponse(aiResponse);
    }

    // ── Action: Transcribe voice note ──
    if (action === "transcribe") {
      const { text } = requestData;
      const prompt = `Clean up this Arabic medical transcription. Fix grammar, punctuation, organize into clear notes.
Raw: "${text}"
Return JSON: { "cleaned_text": "..." }
Return ONLY valid JSON.`;
      const aiResponse = await callAI(LOVABLE_API_KEY, prompt);
      return jsonResponse(aiResponse);
    }

    return jsonResponse({ error: "Unknown action" }, 400);
  } catch (e) {
    console.error("ai-medical error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function callAI(apiKey: string, prompt: string) {
  const models = ["google/gemini-3-flash-preview", "google/gemini-2.5-flash"];
  for (const model of models) {
    try {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }] }),
      });
      if (response.status === 429) return { error: "rate_limited" };
      if (response.status === 402) return { error: "payment_required" };
      if (!response.ok) continue;
      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content?.trim();
      if (!reply) continue;
      try {
        return JSON.parse(reply.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim());
      } catch { return { raw: reply }; }
    } catch (err) { console.error(`${model} failed:`, err); }
  }
  return { error: "AI service unavailable" };
}

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
