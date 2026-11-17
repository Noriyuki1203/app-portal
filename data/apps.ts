import { cacheLife, cacheTag } from "next/cache";
import { supabase } from "@/lib/supabase/public";
import type { Platform } from "@/lib/platforms";


export type AppInfo = {
  id: string;
  name: string;
  summary: string;
  description: string;
  icon_url: string;
  version: string;
  min_os: string;
  download_url: string;
  // ストアのページの URL（Microsoft Store など）。ストアで配っていなければ null
  store_url: string | null;
  is_published: boolean;
  updated_at: string;
  owner_id: string | null;
  platform: Platform;
  // 作成者の表示名（profiles 表）。公開ページで読むときだけ入る
  owner?: { display_name: string } | null;
};

// 公開ページで読む列。owner は apps.owner_id → profiles.id をたどった作成者の表示名
const PUBLIC_COLUMNS = "*, owner:profiles(display_name)";

export async function getPublishedApps(): Promise<AppInfo[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("apps");

  const { data, error } = await supabase
    .from("apps")
    .select(PUBLIC_COLUMNS)
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
    .select(PUBLIC_COLUMNS)
    .eq("id", id)
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    throw new Error(`アプリを読めませんでした：${error.message}`);
  }
  return data;
}