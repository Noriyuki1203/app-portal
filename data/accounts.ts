import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { UNSET_NAME } from "@/lib/owner";

export const LOGIN_DOMAIN = "app-portal.local";

export type Account = {
  id: string;
  loginId: string;
  role: "admin" | "poster" | "none";
  disabled: boolean;
  pending: boolean; // 招待URLから登録して、まだ承認していない
  appCount: number; // 作成者になっているアプリの数
  displayName: string;
  realName: string;
  createdAt: string;
  lastSignInAt: string | null;
};

// アカウント一覧（管理者ページ用）。管理者の鍵で読むので、呼ぶ前に必ず requireAdmin() する
export async function listAccounts(): Promise<Account[]> {
  const admin = createAdminClient();

  const users = [];
  for (let page = 1; ; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(`アカウントを読めませんでした：${error.message}`);
    users.push(...data.users);
    if (data.users.length < 200) break;
  }

  const [{ data: admins }, { data: posters }, { data: profiles }, { data: apps }] = await Promise.all([
    admin.from("admins").select("user_id"),
    admin.from("posters").select("user_id, disabled, real_name, approved_at"),
    admin.from("profiles").select("id, display_name"),
    admin.from("apps").select("owner_id"),
  ]);
  const appCounts = new Map<string, number>();
  for (const a of apps ?? []) {
    const owner = a.owner_id as string | null;
    if (owner) appCounts.set(owner, (appCounts.get(owner) ?? 0) + 1);
  }
  const adminIds = new Set((admins ?? []).map((a) => a.user_id as string));
  const posterMap = new Map((posters ?? []).map((p) => [p.user_id as string, p.disabled as boolean]));
  const realNameMap = new Map((posters ?? []).map((p) => [p.user_id as string, (p.real_name as string | null) ?? ""]));
  const pendingIds = new Set((posters ?? []).filter((p) => !p.approved_at).map((p) => p.user_id as string));
  const nameMap = new Map((profiles ?? []).map((p) => [p.id as string, p.display_name as string]));

  return users
    .map((u) => ({
      id: u.id,
      loginId: (u.email ?? "").replace(`@${LOGIN_DOMAIN}`, ""),
      role: adminIds.has(u.id) ? ("admin" as const) : posterMap.has(u.id) ? ("poster" as const) : ("none" as const),
      disabled: posterMap.get(u.id) ?? false,
      pending: pendingIds.has(u.id),
      appCount: appCounts.get(u.id) ?? 0,
      displayName: nameMap.get(u.id)?.trim() || UNSET_NAME,
      realName: realNameMap.get(u.id) ?? "",
      createdAt: u.created_at,
      lastSignInAt: u.last_sign_in_at ?? null,
    }))
    .sort((a, b) => (a.role === b.role ? a.loginId.localeCompare(b.loginId) : a.role === "admin" ? -1 : 1));
}
