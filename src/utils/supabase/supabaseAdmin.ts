import { createClient } from "@supabase/supabase-js";

const adminSupabase = createClient(
  `${process.env.SUPABASE_URL}`,
  `${process.env.SUPABASE_SERVICES_KEY}`
);

export default adminSupabase;
