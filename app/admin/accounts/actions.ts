"use server";

import { randomBytes } from "node:crypto";
import { refresh } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient, writeAuditLog } from "@/lib/supabase/admin";
import { LOGIN_DOMAIN } from "@/data/accounts";

export type AccountState = {
  error: string;
  message?: string;
  loginId?: string;
  password?: string;
};

// 初期パスワード（16文字の乱数）。画面に1回だけ出し、本人に伝えて変えてもらう
function newPassword(): string {
  return randomBytes(12).toString("base64url");
}

// 操作してよい相手か：投稿者であること（管理者や自分自身は対象外）
async function requirePosterTarget(userId: string, adminId: string): Promise<string | null> {
  if (userId === adminId) return "自分自身は操作できません";
  const admin = createAdminClient();
  const [{ data: isAdmin }, { data: poster }] = await Promise.all([
    admin.from("admins").select("user_id").eq("user_id", userId).maybeSingle(),
    admin.from("posters").select("user_id").eq("user_id", userId).maybeSingle(),
  ]);
  if (isAdmin) return "管理者のアカウントはここでは操作できません";
  if (!poster) return "投稿者のアカウントではありません";
  return null;
}

// ---- 投稿者のアカウントを作る ----
export async function createPoster(prevState: AccountState, formData: FormData): Promise<AccountState> {
  const me = await requireAdmin();
  const loginId = String(formData.get("login_id") ?? "").trim().toLowerCase();

  if (!/^[a-z0-9][a-z0-9_-]{2,29}$/.test(loginId)) {
    return { error: "ID は3〜30文字の半角の小文字・数字・ハイフン（-）・アンダーバー（_）にしてください（先頭は英数字）" };
  }

  const admin = createAdminClient();
  const password = newPassword();
  const { data, error } = await admin.auth.admin.createUser({
    email: `${loginId}@${LOGIN_DOMAIN}`,
    password,
    email_confirm: true,
  });
  if (error || !data.user) {
    if (error?.code === "email_exists" || /already/i.test(error?.message ?? "")) {
      return { error: "その ID はもう使われています" };
    }
    return { error: `作成できませんでした：${error?.message ?? "不明なエラー"}` };
  }

  const { error: posterError } = await admin.from("posters").insert({ user_id: data.user.id });
  if (posterError) {
    // 投稿者の登録に失敗したら、作ったアカウントも消して元に戻す
    await admin.auth.admin.deleteUser(data.user.id);
    return { error: `作成できませんでした：${posterError.message}` };
  }

  await writeAuditLog(me.id, "account_create", data.user.id, { login_id: loginId });
  refresh();
  return { error: "", message: "投稿者のアカウントを作りました", loginId, password };
}

// ---- 停止・再開 ----
export async function setPosterDisabled(userId: string, disabled: boolean) {
  const me = await requireAdmin();
  const problem = await requirePosterTarget(userId, me.id);
  if (problem) throw new Error(problem);

  const admin = createAdminClient();
  // ログインそのものを止める（ban）＋ DBの決まりでも止める（disabled）の二重
  const { error: banError } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: disabled ? "876000h" : "none",
  });
  if (banError) throw new Error(`変更できませんでした：${banError.message}`);

  const { error } = await admin.from("posters").update({ disabled }).eq("user_id", userId);
  if (error) throw new Error(`変更できませんでした：${error.message}`);

  await writeAuditLog(me.id, disabled ? "account_disable" : "account_enable", userId);
  refresh();
}

// ---- パスワードの再設定 ----
export async function resetPosterPassword(userId: string, _prevState: AccountState): Promise<AccountState> {
  const me = await requireAdmin();
  const problem = await requirePosterTarget(userId, me.id);
  if (problem) return { error: problem };

  const admin = createAdminClient();
  const password = newPassword();
  const { error } = await admin.auth.admin.updateUserById(userId, { password });
  if (error) return { error: `再設定できませんでした：${error.message}` };

  await writeAuditLog(me.id, "account_password_reset", userId);
  return { error: "", message: "新しいパスワードを設定しました", password };
}
