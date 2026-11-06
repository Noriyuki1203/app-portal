import { cacheLife, cacheTag } from "next/cache";
import { supabase } from "@/lib/supabase/public";


export type AppInfo = {
  id: string;
  name: string;
  summary: string;
  description: string;
  icon_url: string;
  version: string;
  min_os: string;
  download_url: string;
  is_published: boolean;
  updated_at: string;
  owner_id: string | null;
};

export async function getPublishedApps(): Promise<AppInfo[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("app");

  const { data, error } = await supabase
    .from("apps")
    .select("*")
    .eq("is_published", true)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`アプリ一覧をよめませんでした：${error.message}`);
  }

  return data;
}

export async function getAppById(id: string): Promise<AppInfo | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("apps");

  const { data, error } = await supabase
    .from("apps")
    .select("*")
    .eq("id", id)
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    throw new Error(`アプリを読めませんでした：${error.message}`);
  }
  return data;
}