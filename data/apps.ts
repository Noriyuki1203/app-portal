import { cacheLife, cacheTag } from "next/cache";
import { supabase } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";
import type { Screenshot } from "@/data/screenshots";
import type { Platform } from "@/lib/platforms";
import type { Visibility } from "@/lib/visibility";


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
  // 公開の範囲（一般・限定・非公開）。lib/visibility.ts
  visibility: Visibility;
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
    .eq("visibility", "public")
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
    .eq("visibility", "public")
    .maybeSingle();

  if (error) {
    throw new Error(`アプリを読めませんでした：${error.message}`);
  }
  return data;
}

// ---- 限定・非公開のアプリ ----
// 限定は投稿者（承認済み・停止していない）と管理者、非公開は作成者本人だけがサイト上で見られる。
// ログイン中の人ごとに結果が変わるので、キャッシュせず、ログイン中の人の権限（RLS）で読む。
// 管理者は RLS 上すべて読めるため、非公開は owner_id で本人のものだけに絞る。
// 限定を読めるかは RLS（「限定のアプリは投稿者が読める」）が決める。

async function currentUserId(): Promise<string | null> {
  const client = await createClient();
  const { data } = await client.auth.getClaims();
  return data?.claims?.sub ?? null;
}

// 「限定」または「自分の非公開」の条件（PostgREST の or 指定）
const membersOnly = (userId: string) =>
  `visibility.eq.limited,and(visibility.eq.private,owner_id.eq.${userId})`;

// ログイン中の人が見られる、一般以外のアプリ。未ログインなら空
export async function getMemberApps(): Promise<AppInfo[]> {
  const userId = await currentUserId();
  if (!userId) return [];

  const client = await createClient();
  const { data, error } = await client
    .from("apps")
    .select(PUBLIC_COLUMNS)
    .or(membersOnly(userId))
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`アプリ一覧をよめませんでした：${error.message}`);
  }
  return data;
}

// ログイン中の人が見られる、一般以外のアプリ1件（画像つき）。見つからなければ null
export async function getMemberAppById(
  id: string
): Promise<{ app: AppInfo; screenshots: Screenshot[] } | null> {
  const userId = await currentUserId();
  if (!userId) return null;

  const client = await createClient();
  const { data: app, error } = await client
    .from("apps")
    .select(PUBLIC_COLUMNS)
    .eq("id", id)
    .or(membersOnly(userId))
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
