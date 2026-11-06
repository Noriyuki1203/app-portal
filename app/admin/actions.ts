"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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
