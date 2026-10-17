import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { env } from "./env.ts";

// Cliente con Service Role para operaciones analíticas, consultas seguras y RPC
export const supabaseAdmin: SupabaseClient = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

// Cliente público para endpoints no administrativos si se requiere aislamiento
export const supabasePublic: SupabaseClient = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);
