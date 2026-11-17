"use server";

import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireLogin } from "@/lib/auth";
import { DISPLAY_NAME_MAX } from "@/lib/owner";

type LoginState = {
  error: string;
};

export async function login(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const id = String(formData.get("id") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: `${id}@app-portal.local`,
    password,
  });

  if (error) {
    return { error: "ID かパスワードが違います" };
  }
  redirect("/admin");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

// ---- 問8-7 パスワード変更 ----
type PasswordState = {
  error: string;
  message?: string;
};

export async function changePassword(
  prevState: PasswordState,
  formData: FormData
): Promise<PasswordState> {
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (next.length < 8) {
    return { error: "新しいパスワードは8文字以上にしてください" };
  }
  if (next !== confirm) {
    return { error: "新しいパスワードが、確認用と一致しません" };
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const email = data?.claims.email;
  if (!email) {
    redirect("/admin/login");
  }

  // 今のパスワードが正しいか、ログインし直して確かめる
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password: current,
  });
  if (signInError) {
    return { error: "今のパスワードが違います" };
  }

  const { error } = await supabase.auth.updateUser({ password: next });
  if (error) {
    return { error: `変更できませんでした：${error.message}` };
  }
  return { error: "", message: "パスワードを変更しました" };
}

// ---- 作成者の表示名 ----
type DisplayNameState = {
  error: string;
  message?: string;
};

export async function updateDisplayName(
  prevState: DisplayNameState,
  formData: FormData
): Promise<DisplayNameState> {
  const user = await requireLogin();
  // 前後の空白と、改行・タブなどの制御文字を取り除く
  const name = String(formData.get("display_name") ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim();

  if (name.length === 0) {
    return { error: "表示名を入れてください" };
  }
  if (name.length > DISPLAY_NAME_MAX) {
    return { error: `表示名は${DISPLAY_NAME_MAX}文字以内にしてください` };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .upsert({ id: user.id, display_name: name, updated_at: new Date().toISOString() });

  if (error) {
    return { error: `保存できませんでした：${error.message}` };
  }

  updateTag("apps"); // 一覧・詳細の「作成者」を新しい名前で作り直す
  return { error: "", message: "表示名を保存しました" };
}
