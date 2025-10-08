import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface DeleteRequest {
  userId?: string;
  email?: string;
  phone?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({
          error: "Missing authorization header",
          message: "Se requiere autenticación para eliminar datos",
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(
      token
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({
          error: "Invalid token",
          message: "Token de autenticación inválido",
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const requestBody: DeleteRequest = await req.json();
    const userIdToDelete = requestBody.userId || user.id;

    if (user.id !== userIdToDelete && !user.user_metadata?.is_admin) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          message: "No tienes permisos para eliminar estos datos",
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Iniciando eliminación de datos para usuario: ${userIdToDelete}`);

    const deletionResults = {
      user: false,
      cart: false,
      orders: false,
      metadata: false,
    };

    try {
      const { error: cartError } = await supabaseAdmin
        .from("cart_items")
        .delete()
        .eq("user_id", userIdToDelete);

      if (cartError) {
        console.error("Error deleting cart:", cartError);
      } else {
        deletionResults.cart = true;
        console.log("Cart items deleted successfully");
      }
    } catch (e) {
      console.error("Cart deletion error:", e);
    }

    try {
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(
        userIdToDelete
      );

      if (authError) {
        console.error("Error deleting user:", authError);
        throw authError;
      } else {
        deletionResults.user = true;
        console.log("User deleted successfully from auth");
      }
    } catch (e) {
      console.error("User deletion error:", e);
      throw e;
    }

    const successMessage = user.id === userIdToDelete
      ? "Tus datos han sido eliminados completamente de nuestro sistema"
      : `Datos del usuario ${userIdToDelete} eliminados correctamente`;

    return new Response(
      JSON.stringify({
        success: true,
        message: successMessage,
        details: deletionResults,
        deletedUserId: userIdToDelete,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Delete user data error:", error);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: "Error al eliminar los datos. Por favor intenta nuevamente.",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});