import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://rhaqzcwnnesrmxaevhvq.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoYXF6Y3dubmVzcm14YWV2aHZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3NDEyMDYsImV4cCI6MjA3NDMxNzIwNn0.B1-_GxZbkHIVmNtekXgB2ncZriCwsqE2ycXJinBHUKQ"

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function getBotKeys(search = "") {
  let query = supabase.from("bot_keys").select("*").order("created_at", { ascending: false });

  if (search) {
    query = query.ilike("nome", `%${search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}