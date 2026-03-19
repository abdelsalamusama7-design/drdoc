import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `أنت المساعد الذكي لعيادة Smart Clinic المتخصصة في طب الذكورة والعقم.

معلومات العيادة:
- الاسم: Smart Clinic
- التخصص: طب الذكورة والعقم والمسالك البولية
- أوقات العمل: السبت - الخميس من 9 صباحاً حتى 9 مساءً (الجمعة إجازة)
- العنوان: القاهرة
- هاتف: 01227080430
- خدمات: استشارة أولية، متابعة، تحاليل هرمونات، تحليل سائل منوي، أشعة دوبلر، عمليات دوالي

أسعار تقريبية:
- استشارة أولية: 300 ج.م
- متابعة: 150 ج.م
- تحليل هرمونات: 450 ج.م
- تحليل سائل منوي: 350 ج.م
- أشعة دوبلر: 500 ج.م

قواعد:
1. أجب دائماً بالعربية إلا إذا سأل بالإنجليزية
2. كن ودوداً ومهنياً
3. لا تشخص أمراض، وجه المريض للطبيب
4. إذا سأل عن حجز موعد، وجهه لصفحة الحجز /booking
5. اجعل إجاباتك مختصرة ومفيدة
6. أذكر رقم التواصل عند الحاجة`;

const FALLBACK_REPLY = `أعتذر، المساعد الذكي غير متاح الآن بشكل مؤقت.

يمكنني مساعدتك حالياً في:
- حجز موعد من صفحة /booking
- معرفة مواعيد العمل
- رقم التواصل: 01227080430`;

const MODELS = [
  "google/gemini-3-flash-preview",
  "google/gemini-2.5-flash",
  "openai/gpt-5-mini",
];

function buildStaticReply(userMessage: string) {
  const text = userMessage.toLowerCase();

  if (text.includes("حجز") || text.includes("موعد") || text.includes("booking")) {
    return "يمكنك حجز موعد من صفحة /booking، ولو تحب أقدر أوضح لك الخطوات أيضاً. رقم التواصل: 01227080430";
  }

  if (text.includes("سعر") || text.includes("تكلفة") || text.includes("الاسعار") || text.includes("الأسعار")) {
    return "الأسعار التقريبية: الاستشارة الأولى 300 ج.م، المتابعة 150 ج.م، تحليل الهرمونات 450 ج.م، تحليل السائل المنوي 350 ج.م، وأشعة الدوبلر 500 ج.م. للتأكيد: 01227080430";
  }

  if (text.includes("عنوان") || text.includes("مكان") || text.includes("فين") || text.includes("العنوان")) {
    return "العيادة في القاهرة، ومواعيد العمل من السبت إلى الخميس من 9 صباحاً إلى 9 مساءً، والجمعة إجازة. للتفاصيل: 01227080430";
  }

  return FALLBACK_REPLY;
}

async function callGateway(apiKey: string, messages: Array<{ role: string; content: string }>) {
  let lastError = "";

  for (const model of MODELS) {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages.slice(-12)],
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content?.trim();
      if (reply) return reply;
      lastError = `Empty response from ${model}`;
      continue;
    }

    if (response.status === 429) return "عذراً، عدد الطلبات كبير حالياً. يرجى المحاولة بعد قليل.";
    if (response.status === 402) return "الخدمة غير متاحة مؤقتاً حالياً. يمكنك التواصل معنا على 01227080430";

    const errorText = await response.text();
    lastError = `${model}: ${response.status} ${errorText}`;
    console.error("AI gateway error:", lastError);
  }

  throw new Error(lastError || "All models failed");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) throw new Error("LOVABLE_API_KEY is not configured");

    const safeMessages = Array.isArray(messages)
      ? messages.filter((m) => m?.role && typeof m?.content === "string")
      : [];

    const lastUserMessage = [...safeMessages].reverse().find((m) => m.role === "user")?.content || "";

    try {
      const reply = await callGateway(lovableApiKey, safeMessages);
      return new Response(JSON.stringify({ reply }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (gatewayError) {
      console.error("ai-chat gateway fallback:", gatewayError);
      const fallbackReply = buildStaticReply(lastUserMessage);
      return new Response(JSON.stringify({ reply: fallbackReply, fallback: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (e) {
    console.error("ai-chat error:", e);
    return new Response(JSON.stringify({ reply: FALLBACK_REPLY, fallback: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
