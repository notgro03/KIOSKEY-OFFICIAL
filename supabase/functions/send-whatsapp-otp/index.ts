import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SendOTPRequest {
  phone: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { phone }: SendOTPRequest = await req.json();

    if (!phone || phone.length < 10) {
      return new Response(
        JSON.stringify({ error: "Número de teléfono inválido" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Crear cliente de Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabaseAdmin = await import("npm:@supabase/supabase-js@2").then(
      (module) => module.createClient(supabaseUrl, supabaseServiceKey)
    );

    // Rate limiting: verificar intentos en la última hora
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: recentOTPs, error: checkError } = await supabaseAdmin
      .from("otp_codes")
      .select("id")
      .eq("phone", phone)
      .gte("created_at", oneHourAgo);

    if (checkError) {
      console.error("Error checking rate limit:", checkError);
    }

    if (recentOTPs && recentOTPs.length >= 3) {
      return new Response(
        JSON.stringify({ 
          error: "Demasiados intentos. Por favor espera una hora e intenta nuevamente." 
        }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Generar código OTP de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutos

    // Guardar OTP en la base de datos
    const { error: insertError } = await supabaseAdmin
      .from("otp_codes")
      .insert({
        phone,
        code,
        expires_at: expiresAt,
        attempts: 0,
        used: false,
      });

    if (insertError) {
      console.error("Error saving OTP:", insertError);
      return new Response(
        JSON.stringify({ error: "Error al generar código" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Enviar OTP vía WhatsApp usando Twilio
    // NOTA: Para usar Twilio, necesitas configurar las variables de entorno:
    // TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER
    
    const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioWhatsAppNumber = Deno.env.get("TWILIO_WHATSAPP_NUMBER");

    if (twilioAccountSid && twilioAuthToken && twilioWhatsAppNumber) {
      try {
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
        const message = `Tu código de verificación de Kioskeys es: ${code}. Válido por 5 minutos.`;
        
        // Asegurar que el número tenga el formato correcto para WhatsApp
        const formattedPhone = phone.startsWith("+") ? phone : `+${phone}`;
        const whatsappTo = `whatsapp:${formattedPhone}`;
        const whatsappFrom = `whatsapp:${twilioWhatsAppNumber}`;

        const twilioResponse = await fetch(twilioUrl, {
          method: "POST",
          headers: {
            "Authorization": "Basic " + btoa(`${twilioAccountSid}:${twilioAuthToken}`),
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            To: whatsappTo,
            From: whatsappFrom,
            Body: message,
          }),
        });

        if (!twilioResponse.ok) {
          const errorData = await twilioResponse.text();
          console.error("Twilio error:", errorData);
          
          // Log del intento fallido
          await supabaseAdmin.from("notifications_log").insert({
            user_id: null,
            type: "otp_verification",
            phone,
            message,
            status: "failed",
            error_message: errorData,
          });
        } else {
          // Log del envío exitoso
          await supabaseAdmin.from("notifications_log").insert({
            user_id: null,
            type: "otp_verification",
            phone,
            message,
            status: "sent",
          });
        }
      } catch (twilioError) {
        console.error("Error enviando WhatsApp:", twilioError);
      }
    } else {
      console.log("Modo desarrollo: Código OTP generado:", code);
      console.log("Configura TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN y TWILIO_WHATSAPP_NUMBER para enviar WhatsApp");
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Código enviado exitosamente",
        // En desarrollo, retornar el código (ELIMINAR EN PRODUCCIÓN)
        ...((!twilioAccountSid || !twilioAuthToken) && { dev_code: code })
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in send-whatsapp-otp:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});