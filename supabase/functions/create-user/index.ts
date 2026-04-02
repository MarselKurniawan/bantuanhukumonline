import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Verify caller role using service role to avoid RLS issues
  const callerClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } }, auth: { autoRefreshToken: false, persistSession: false } }
  );
  const { data: { user: caller } } = await callerClient.auth.getUser();
  if (!caller) {
    return new Response(JSON.stringify({ error: "Invalid token" }), { status: 401 });
  }

  const { data: callerRole } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", caller.id).single();
  if (!callerRole || !["superadmin", "admin"].includes(callerRole.role)) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { email, password, nama, nomor_wa, role, nik, tanggal_lahir, jenis_kelamin, penyandang_disabilitas } = await req.json();

  if (callerRole.role === "admin" && ["admin", "superadmin"].includes(role)) {
    return new Response(JSON.stringify({ error: "Admin cannot create admin/superadmin" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Create user with admin API
  const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nama },
  });

  if (createError) {
    return new Response(JSON.stringify({ error: createError.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const userId = userData.user.id;

  // Wait briefly for trigger to complete, then upsert with correct data
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Upsert profile with correct data (trigger creates initial 'client' entry)
  const profileData: Record<string, any> = {
    user_id: userId,
    nama,
    email,
    nomor_wa: nomor_wa || null,
    approval_status: "approved",
    approved_at: new Date().toISOString(),
  };
  if (nik) profileData.nik = nik;
  if (tanggal_lahir) profileData.tanggal_lahir = tanggal_lahir;
  if (jenis_kelamin) profileData.jenis_kelamin = jenis_kelamin;
  if (penyandang_disabilitas !== undefined) profileData.penyandang_disabilitas = penyandang_disabilitas;

  await supabaseAdmin.from("profiles").upsert(profileData, { onConflict: "user_id" });

  // Upsert role - override the default 'client' role set by the trigger
  const { error: roleError } = await supabaseAdmin
    .from("user_roles")
    .upsert({ user_id: userId, role }, { onConflict: "user_id" });

  if (roleError) {
    console.error("Role upsert error:", roleError);
    // Try update as fallback
    await supabaseAdmin
      .from("user_roles")
      .update({ role })
      .eq("user_id", userId);
  }

  return new Response(JSON.stringify({ success: true, userId }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
