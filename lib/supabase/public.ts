import { createClient } from "@supabase/supabase-js";

//ログインしていない人としてDBを読むための窓口

export const supabase = createClient(
   process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);