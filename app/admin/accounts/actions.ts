"use server";

import { randomBytes } from "node:crypto";
import { refresh, updateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient, writeAuditLog } from "@/lib/supabase/admin";
import { regenerateInviteCode } from "@/data/invite";
import { BAN_FOREVER, readRealName } from "@/lib/accountRules";

export type AccountState = {
  error: string;
  message?: string;
  password?: string;
};

// 再設定用のパスワード（16文字の乱数）。画面に1回だけ出し、本人に伝えて変えてもらう
function newPassword(): string {
  return randomBytes(12).toString("base64url");
}

type PosterRow = { approved_at: string | null };

// 操作してよい相手か：投稿者であること（管理者や自分自身は対象外）。投稿者の行を返す
async function findPosterTarget(
  userId: string,
  adminId: string
): Promise<{ poster: PosterRow } | { error: string }> {
  if (userId === adminId) return { error: "自分自身は操作できません" };
  const admin = createAdminClient();
  const [{ data: isAdmin }, { data: poster }] = await Promise.all([
    admin.from("admins").select("user_id").eq("user_id", userId).maybeSingle(),
    admin.from("posters").select("approved_at").eq("user_id", userId).maybeSingle(),
  ]);
  if (isAdmin) return { error: "管理者のアカウントはここでは操作できません" };
  if (!poster) return { error: "投稿者のアカウントではありません" };
  return { poster: poster as PosterRow };
}

// ---- 招待URLを作り直す（前のURLは使えなくなる） ----
export async function renewInviteUrl() {
  const me = await requireAdmin();
  await regenerateInviteCode();
  await writeAuditLog(me.id, "invite_renew", "invite");
  refresh();
}

// ---- 承認（ログインできるようにする） ----
export async function approvePoster(userId: string) {
  const me = await requireAdmin();
  const target = await findPosterTarget(userId, me.id);
  if ("error" in target) throw new Error(target.error);
  if (target.poster.approved_at) return; // もう承認済み

  const admin = createAdminClient();
  const { error: banError } = await admin.auth.admin.updateUserById(userId, { ban_duration: "none" });
  if (banError) throw new Error(`承認できませんでした：${banError.message}`);

  const { error } = await admin
    .from("posters")
    .update({ approved_at: new Date().toISOString(), disabled: false })
    .eq("user_id", userId);
  if (error) throw new Error(`承認できませんでした：${error.message}`);

  await writeAuditLog(me.id, "account_approve", userId);
  refresh();
}

// ---- 却下（承認待ちの登録を消す） ----
export async function rejectPoster(userId: string) {
  const me = await requireAdmin();
  const target = await findPosterTarget(userId, me.id);
  if ("error" in target) throw new Error(target.error);
  if (target.poster.approved_at) throw new Error("承認済みのアカウントは却下できません（停止を使ってください）");

  const admin = createAdminClient();
  // アカウントを消すと、posters・profiles の行も一緒に消える（on delete cascade）
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) throw new Error(`却下できませんでした：${error.message}`);

  await writeAuditLog(me.id, "account_reject", userId);
  refresh();
}

// ---- 停止・再開（承認済みの投稿者だけ） ----
export async function setPosterDisabled(userId: string, disabled: boolean) {
  const me = await requireAdmin();
  const target = await findPosterTarget(userId, me.id);
  if ("error" in target) throw new Error(target.error);
  if (!target.poster.approved_at) throw new Error("承認待ちのアカウントは、承認か却下を選んでください");

  const admin = createAdminClient();
  // ログインそのものを止める（ban）＋ DBの決まりでも止める（disabled）の二重
  const { error: banError } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: disabled ? BAN_FOREVER : "none",
  });
  if (banError) throw new Error(`変更できませんでした：${banError.message}`);

  const { error } = await admin.from("posters").update({ disabled }).eq("user_id", userId);
  if (error) throw new Error(`変更できませんでした：${error.message}`);

  await writeAuditLog(me.id, disabled ? "account_disable" : "account_enable", userId);
  refresh();
}

// ---- 削除（停止中の投稿者だけ）。その人のアプリは、削除した管理者に引き継ぐ ----
export async function deletePoster(userId: string) {
  const me = await requireAdmin();
  const target = await findPosterTarget(userId, me.id);
  if ("error" in target) throw new Error(target.error);
  if (!target.poster.approved_at) throw new Error("承認待ちのアカウントは「却下」を使ってください");

  const admin = createAdminClient();
  const { data: poster } = await admin.from("posters").select("disabled").eq("user_id", userId).single();
  if (!poster?.disabled) throw new Error("削除できるのは停止中のアカウントだけです。先に停止してください");

  // アプリの作成者を管理者に付け替える（アカウントを消すと、作成者の行も消えるため）
  const { data: moved, error: moveError } = await admin
    .from("apps")
    .update({ owner_id: me.id })
    .eq("owner_id", userId)
    .select("id");
  if (moveError) throw new Error(`アプリを引き継げませんでした：${moveError.message}`);

  // アカウントを消すと、posters・profiles の行も一緒に消える（on delete cascade）
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) throw new Error(`削除できませんでした：${error.message}`);

  await writeAuditLog(me.id, "account_delete", userId, { moved_apps: (moved ?? []).map((a) => a.id) });
  updateTag("apps"); // サイトの「作成者」の表示を作り直す
  refresh();
}

// ---- 本名の変更 ----
export async function updateRealName(userId: string, _prev: AccountState, formData: FormData): Promise<AccountState> {
  const me = await requireAdmin();
  const target = await findPosterTarget(userId, me.id);
  if ("error" in target) return { error: target.error };

  const realName = readRealName(formData);
  if ("error" in realName) return { error: realName.error };

  const admin = createAdminClient();
  const { error } = await admin.from("posters").update({ real_name: realName.value }).eq("user_id", userId);
  if (error) return { error: `変更できませんでした：${error.message}` };

  await writeAuditLog(me.id, "account_real_name", userId);
  refresh();
  return { error: "", message: "本名を変更しました" };
}

// ---- パスワードの再設定（承認済みの投稿者だけ） ----
export async function resetPosterPassword(userId: string): Promise<AccountState> {
  const me = await requireAdmin();
  const target = await findPosterTarget(userId, me.id);
  if ("error" in target) return { error: target.error };
  if (!target.poster.approved_at) return { error: "承認待ちのアカウントです" };

  const admin = createAdminClient();
  const password = newPassword();
  const { error } = await admin.auth.admin.updateUserById(userId, { password });
  if (error) return { error: `再設定できませんでした：${error.message}` };

  await writeAuditLog(me.id, "account_password_reset", userId);
  return { error: "", message: "新しいパスワードを設定しました", password };
}
