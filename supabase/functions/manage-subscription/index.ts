import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const authHeader = req.headers.get("authorization");
    if (!authHeader) throw new Error("Missing authorization");

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Unauthorized");

    const { action, clinic_id, plan, invoice_id, amount, payment_method } = await req.json();

    // Verify user is admin or clinic owner
    const { data: clinic } = await supabase
      .from("clinics").select("owner_id").eq("id", clinic_id).single();
    
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (!isAdmin && clinic?.owner_id !== user.id) throw new Error("Forbidden");

    switch (action) {
      case "upgrade": {
        // Update clinic plan
        await supabase.from("clinics").update({ subscription_plan: plan }).eq("id", clinic_id);
        
        // Create or update subscription
        const { data: existing } = await supabase
          .from("subscriptions").select("id")
          .eq("clinic_id", clinic_id).eq("status", "active").single();

        if (existing) {
          await supabase.from("subscriptions")
            .update({ plan, updated_at: new Date().toISOString() })
            .eq("id", existing.id);
        } else {
          await supabase.from("subscriptions")
            .insert({ clinic_id, plan, status: "active" });
        }

        // Create invoice
        const prices: Record<string, number> = { starter: 0, professional: 18000, premium: 25000 };
        await supabase.from("invoices").insert({
          clinic_id,
          amount: prices[plan] || 0,
          status: "pending",
          due_date: new Date().toISOString().split("T")[0],
        });

        return new Response(JSON.stringify({ success: true, plan }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "pay_invoice": {
        await supabase.from("invoices").update({
          status: "paid",
          paid_at: new Date().toISOString(),
          payment_method: payment_method || "card",
        }).eq("id", invoice_id);

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "get_status": {
        const { data: sub } = await supabase
          .from("subscriptions").select("*")
          .eq("clinic_id", clinic_id).eq("status", "active").single();

        const { data: invoices } = await supabase
          .from("invoices").select("*")
          .eq("clinic_id", clinic_id).order("created_at", { ascending: false }).limit(10);

        return new Response(JSON.stringify({ subscription: sub, invoices }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        throw new Error("Unknown action");
    }
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
