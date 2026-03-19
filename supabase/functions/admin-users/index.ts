import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user is admin
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const method = req.method;

    // GET: List all users
    if (method === "GET") {
      const { data: { users }, error: listError } = await adminClient.auth.admin.listUsers();
      if (listError) throw listError;

      const { data: profiles } = await adminClient.from("profiles").select("*");
      const { data: roles } = await adminClient.from("user_roles").select("*");

      const enrichedUsers = users.map((u) => {
        const profile = profiles?.find((p) => p.id === u.id);
        const userRole = roles?.find((r) => r.user_id === u.id);
        return {
          id: u.id,
          email: u.email,
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at,
          full_name: profile?.full_name || "",
          phone: profile?.phone || "",
          specialty: profile?.specialty || "",
          role: userRole?.role || null,
        };
      });

      return new Response(JSON.stringify(enrichedUsers), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST: Actions
    if (method === "POST") {
      const body = await req.json();
      const { action, user_id, role, email, password, full_name, phone, specialty } = body;

      if (action === "create_user") {
        // Validate inputs
        if (!email || typeof email !== "string" || email.length > 255) {
          return new Response(JSON.stringify({ error: "Invalid email" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (!password || typeof password !== "string" || password.length < 6 || password.length > 128) {
          return new Response(JSON.stringify({ error: "Password must be 6-128 characters" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (!role || !["admin", "doctor", "receptionist", "patient"].includes(role)) {
          return new Response(JSON.stringify({ error: "Invalid role" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const trimmedName = (full_name || "").trim().slice(0, 100);

        // Create user via admin API (auto-confirmed)
        const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
          email: email.trim(),
          password,
          email_confirm: true,
          user_metadata: { full_name: trimmedName },
        });

        if (createError) throw createError;

        // Update profile with extra fields
        if (newUser.user) {
          const updates: Record<string, string> = {};
          if (phone) updates.phone = phone.trim().slice(0, 20);
          if (specialty) updates.specialty = specialty.trim().slice(0, 100);
          if (Object.keys(updates).length > 0) {
            await adminClient
              .from("profiles")
              .update(updates)
              .eq("id", newUser.user.id);
          }

          // Assign role
          await adminClient
            .from("user_roles")
            .insert({ user_id: newUser.user.id, role });
        }

        return new Response(JSON.stringify({ success: true, user_id: newUser.user?.id }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (action === "assign_role") {
        if (!user_id || !role || !["admin", "doctor", "receptionist"].includes(role)) {
          return new Response(JSON.stringify({ error: "Invalid parameters" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { data: existing } = await adminClient
          .from("user_roles")
          .select("id")
          .eq("user_id", user_id)
          .single();

        if (existing) {
          const { error } = await adminClient
            .from("user_roles")
            .update({ role })
            .eq("user_id", user_id);
          if (error) throw error;
        } else {
          const { error } = await adminClient
            .from("user_roles")
            .insert({ user_id, role });
          if (error) throw error;
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (action === "delete_user") {
        if (!user_id) {
          return new Response(JSON.stringify({ error: "Missing user_id" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (user_id === user.id) {
          return new Response(JSON.stringify({ error: "Cannot delete yourself" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const { error } = await adminClient.auth.admin.deleteUser(user_id);
        if (error) throw error;

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "Unknown action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
