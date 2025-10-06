import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface VerifyOTPRequest {
  phone: string;
  code: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { phone, code }: VerifyOTPRequest = await req.json();

    if (!phone || !code) {
      return new Response(
        JSON.stringify({ error: "Teléfono y código son requeridos" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Crear cliente de Supabase Admin
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabaseAdmin = await import("npm:@supabase/supabase-js@2").then(
      (module) => module.createClient(supabaseUrl, supabaseServiceKey)
    );

    // Buscar el código OTP más reciente para este teléfono
    const { data: otpData, error: otpError } = await supabaseAdmin
      .from("otp_codes")
      .select("*")
      .eq("phone", phone)
      .eq("code", code)
      .eq("used", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (otpError) {
      console.error("Error fetching OTP:", otpError);
      return new Response(
        JSON.stringify({ error: "Error al verificar código" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!otpData) {
      return new Response(
        JSON.stringify({ error: "Código inválido o expirado" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verificar si el código ha expirado
    const now = new Date();
    const expiresAt = new Date(otpData.expires_at);
    
    if (now > expiresAt) {
      return new Response(
        JSON.stringify({ error: "Código expirado. Solicita uno nuevo." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verificar intentos
    if (otpData.attempts >= 3) {
      return new Response(
        JSON.stringify({ error: "Demasiados intentos fallidos. Solicita un nuevo código." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verificar el código
    if (otpData.code !== code) {
      // Incrementar intentos
      await supabaseAdmin
        .from("otp_codes")
        .update({ attempts: otpData.attempts + 1 })
        .eq("id", otpData.id);

      return new Response(
        JSON.stringify({ 
          error: "Código incorrecto",
          attempts_left: 3 - (otpData.attempts + 1)
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Código correcto - marcar como usado
    await supabaseAdmin
      .from("otp_codes")
      .update({ used: true })
      .eq("id", otpData.id);

    // Buscar o crear usuario
    const { data: existingUser, error: userFetchError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("phone", phone)
      .maybeSingle();

    if (userFetchError && userFetchError.code !== "PGRST116") {
      console.error("Error fetching user:", userFetchError);
    }

    let userId: string;
    let isNewUser = false;

    if (!existingUser) {
      // Crear nuevo usuario
      const { data: newUser, error: createError } = await supabaseAdmin
        .from("users")
        .insert({
          phone,
          name: "",
          role: "user",
        })
        .select()
        .single();

      if (createError) {
        console.error("Error creating user:", createError);
        return new Response(
          JSON.stringify({ error: "Error al crear usuario" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      userId = newUser.id;
      isNewUser = true;

      // Crear preferencias de notificaciones por defecto
      await supabaseAdmin.from("notification_preferences").insert({
        user_id: userId,
        order_updates: true,
        promotions: true,
        cart_reminders: true,
      });
    } else {
      userId = existingUser.id;
    }

    // Crear o actualizar usuario en Supabase Auth
    // Generar un token JWT personalizado
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      phone,
      phone_confirm: true,
      user_metadata: {
        phone,
        user_id: userId,
      },
    });

    let session;
    if (authError) {
      // Si el usuario ya existe en auth, generar sesión
      const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
        phone,
        password: code, // Temporal
      });
      
      if (signInError) {
        // Crear sesión manualmente
        const jwt = await generateJWT(userId, phone);
        session = { access_token: jwt, user: existingUser };
      } else {
        session = signInData;
      }
    } else {
      // Generar sesión para el nuevo usuario
      const jwt = await generateJWT(userId, phone);
      session = { access_token: jwt, user: existingUser || { id: userId, phone } };
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Verificación exitosa",
        session,
        user: existingUser || { id: userId, phone, name: "", role: "user" },
        is_new_user: isNewUser,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in verify-whatsapp-otp:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// Función auxiliar para generar JWT simple (en producción usa una librería más robusta)
async function generateJWT(userId: string, phone: string): Promise<string> {
  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const payload = {
    sub: userId,
    phone,
    role: "authenticated",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7), // 7 días
  };

  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));
  const signature = "mock_signature_" + Math.random().toString(36);

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}