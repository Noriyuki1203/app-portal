"use server";

import { createAdminClient, writeAuditLog } from "@/lib/supabase/admin";
import { isValidInviteCode } from "@/data/invite";
import { LOGIN_DOMAIN } from "@/data/accounts";
import {
  BAN_FOREVER,
  LOGIN_ID_PATTERN,
  LOGIN_ID_RULE,
  PASSWORD_MIN,
  readRealName,
} from "@/lib/accountRules";

export type JoinState = {
  error: string;
  done?: boolean;
  values?: { login_id: string; real_name: string };
  attempt?: number; // エラーごとに変わる番号（フォームを作り直して、入れた値を戻す）
};

// ---- 招待URLからの投稿者登録（管理者が承認するまでログインできない） ----
export async function registerPoster(code: string, _prev: JoinState, formData: FormData): Promise<JoinState> {
  const loginId = String(formData.get("login_id") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  const values = { login_id: loginId, real_name: String(formData.get("real_name") ?? "") };
  const fail = (error: string): JoinState => ({ error, values, attempt: Date.now() });

  if (!(await isValidInviteCode(code))) {
    return fail("この招待URLは使えません。管理者に新しいURLをもらってください");
  }
  if (!LOGIN_ID_PATTERN.test(loginId)) return fail(LOGIN_ID_RULE);
  const realName = readRealName(formData);
  if ("error" in realName) return fail(realName.error);
  if (password.length < PASSWORD_MIN) return fail(`パスワードは${PASSWORD_MIN}文字以上にしてください`);
  if (password !== confirm) return fail("パスワードが、確認用と一致しません");

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email: `${loginId}@${LOGIN_DOMAIN}`,
    password,
    email_confirm: true,
    ban_duration: BAN_FOREVER, // 承認されるまでログインできない
  });
  if (error || !data.user) {
    if (error?.code === "email_exists" || /already/i.test(error?.message ?? "")) {
      return fail("その ID はもう使われています。別の ID にしてください");
    }
    if (error?.code === "weak_password") {
      return fail("パスワードが簡単すぎます。英字と数字をまぜるなど、もっと長く複雑にしてください");
    }
    return fail("登録できませんでした。時間をおいてもう一度試してください");
  }

  const { error: posterError } = await admin
    .from("posters")
    .insert({ user_id: data.user.id, real_name: realName.value, approved_at: null });
  if (posterError) {
    await admin.auth.admin.deleteUser(data.user.id);
    return fail("登録できませんでした。時間をおいてもう一度試してください");
  }

  await writeAuditLog(data.user.id, "account_register", data.user.id, { login_id: loginId });
  return { error: "", done: true };
}
