import { cacheLife, cacheTag } from "next/cache";
import { supabase } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";
import type { Screenshot } from "@/data/screenshots";
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
  // true = 一般（だれでも見られる）、false = 限定（作成者本人だけ）
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

// ---- 限定公開（is_published = false）のアプリ ----
// 限定のアプリは、サイト上では作成者本人にだけ見せる。
// ログイン中の人ごとに結果が変わるので、キャッシュせず、ログイン中の人の権限（RLS）で読む。
// 管理者は RLS 上すべて読めるため、owner_id で本人のものだけに絞る。

async function currentUserId(): Promise<string | null> {
  const client = await createClient();
  const { data } = await client.auth.getClaims();
  return data?.claims?.sub ?? null;
}

// ログイン中の人が作成者の、限定のアプリ。未ログインなら空
export async function getMyLimitedApps(): Promise<AppInfo[]> {
  const userId = await currentUserId();
  if (!userId) return [];

  const client = await createClient();
  const { data, error } = await client
    .from("apps")
    .select(PUBLIC_COLUMNS)
    .eq("is_published", false)
    .eq("owner_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`アプリ一覧をよめませんでした：${error.message}`);
  }
  return data;
}

// ログイン中の人が作成者の、限定のアプリ1件（画像つき）。見つからなければ null
export async function getMyLimitedAppById(
  id: string
): Promise<{ app: AppInfo; screenshots: Screenshot[] } | null> {
  const userId = await currentUserId();
  if (!userId) return null;

  const client = await createClient();
  const { data: app, error } = await client
    .from("apps")
    .select(PUBLIC_COLUMNS)
    .eq("id", id)
    .eq("is_published", false)
    .eq("owner_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`アプリを読めませんでした：${error.message}`);
  }
  if (!app) return null;

  const { data: screenshots, error: shotError } = await client
    .from("screenshots")
    .select("*")
    .eq("app_id", id)
    .order("sort_order");

  if (shotError) {
    throw new Error(`画像を読み込めませんでした：${shotError.message}`);
  }
  return { app, screenshots };
}
