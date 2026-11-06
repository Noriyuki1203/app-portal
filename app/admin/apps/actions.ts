"use server";

import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireLogin } from "@/lib/auth";
import { BUCKET, extensionOf, pathFromPublicUrl } from "@/lib/storage";

export type FormState = {
  error: string;
  message?: string;
};

// フォームの値を、apps 表に書く形にまとめる（追加と更新で共通）
function readAppForm(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    summary: String(formData.get("summary") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    version: String(formData.get("version") ?? "").trim(),
    min_os: String(formData.get("min_os") ?? "").trim(),
    download_url: String(formData.get("download_url") ?? "").trim(),
    is_published: formData.get("is_published") === "on",
  };
}

// ---- 問8-2 追加 ----
export async function createApp(prevState: FormState, formData: FormData): Promise<FormState> {
  await requireLogin();

  const id = String(formData.get("id") ?? "").trim();
  const app = readAppForm(formData);

  if (!/^[a-z0-9-]+$/.test(id)) {
    return { error: "ID は半角の小文字・数字・ハイフン（-）だけで書いてください" };
  }
  if (!app.name) {
    return { error: "アプリ名を入れてください" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("apps").insert({ id, ...app });

  if (error) {
    if (error.code === "23505") {
      return { error: "その ID はもう使われています" };
    }
    return { error: `追加できませんでした：${error.message}` };
  }

  updateTag("apps");
  redirect("/admin");
}

// ---- 問8-3 更新 ----
export async function updateApp(
  id: string,
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireLogin();

  const app = readAppForm(formData);
  if (!app.name) {
    return { error: "アプリ名を入れてください" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("apps")
    .update({ ...app, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return { error: `保存できませんでした：${error.message}` };
  }

  updateTag("apps");

  refresh(); // 今いる管理者ページも作り直す
  return { error: "", message: "保存しました" };
}

// ---- 問8-4 削除 ----
export async function deleteApp(id: string) {
  await requireLogin();
  const supabase = await createClient();

  // Storage にある、このアプリの画像（id のフォルダの中身）を消す
  const { data: files } = await supabase.storage.from(BUCKET).list(id);
  if (files && files.length > 0) {
    await supabase.storage.from(BUCKET).remove(files.map((f) => `${id}/${f.name}`));
  }

  // 行を消す（screenshots の行は on delete cascade で一緒に消える）
  const { error } = await supabase.from("apps").delete().eq("id", id);
  if (error) {
    throw new Error(`削除できませんでした：${error.message}`);
  }

  updateTag("apps");
  redirect("/admin");
}

// 画像ファイルを確かめて Storage に上げ、公開URL を返す（問8-5・8-6 で共通）
async function uploadImage(
  appId: string,
  file: FormDataEntryValue | null,
  prefix: string
): Promise<{ url: string } | { error: string }> {
  if (!(file instanceof File) || file.size === 0) {
    return { error: "画像ファイルを選んでください" };
  }
  if (!file.type.startsWith("image/")) {
    return { error: "画像ファイル（png・jpg など）を選んでください" };
  }

  const supabase = await createClient();
  const path = `${appId}/${prefix}-${Date.now()}.${extensionOf(file)}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type });

  if (error) {
    return { error: `アップロードできませんでした：${error.message}` };
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl };
}

// ---- 問8-5 アイコン ----
export async function uploadIcon(
  appId: string,
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireLogin();

  const result = await uploadImage(appId, formData.get("file"), "icon");
  if ("error" in result) {
    return { error: result.error };
  }

  const supabase = await createClient();

  // 前のアイコンの URL を覚えておく（新しいものに替えたあとで消す）
  const { data: before } = await supabase
    .from("apps")
    .select("icon_url")
    .eq("id", appId)
    .single();

  const { error } = await supabase
    .from("apps")
    .update({ icon_url: result.url, updated_at: new Date().toISOString() })
    .eq("id", appId);

  if (error) {
    return { error: `保存できませんでした：${error.message}` };
  }

  const oldPath = before ? pathFromPublicUrl(before.icon_url) : null;
  if (oldPath) {
    await supabase.storage.from(BUCKET).remove([oldPath]);
  }

  updateTag("apps");

  refresh(); // 今いる管理者ページも作り直す
  return { error: "", message: "アイコンを変更しました" };
}

// ---- 問8-6 スクリーンショット ----
export async function addScreenshot(
  appId: string,
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireLogin();

  const result = await uploadImage(appId, formData.get("file"), "screenshot");
  if ("error" in result) {
    return { error: result.error };
  }

  const supabase = await createClient();

  // 今ある画像のうち一番大きい sort_order の次にする（一番うしろに追加）
  const { data: last } = await supabase
    .from("screenshots")
    .select("sort_order")
    .eq("app_id", appId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("screenshots").insert({
    app_id: appId,
    image_url: result.url,
    sort_order: (last?.sort_order ?? 0) + 1,
  });

  if (error) {
    return { error: `保存できませんでした：${error.message}` };
  }

  updateTag("apps");

  refresh(); // 今いる管理者ページも作り直す
  return { error: "", message: "画像を追加しました" };
}

export async function deleteScreenshot(screenshotId: number) {
  await requireLogin();
  const supabase = await createClient();

  const { data } = await supabase
    .from("screenshots")
    .delete()
    .eq("id", screenshotId)
    .select("image_url")
    .maybeSingle();

  const path = data ? pathFromPublicUrl(data.image_url) : null;
  if (path) {
    await supabase.storage.from(BUCKET).remove([path]);
  }

  updateTag("apps");

  refresh(); // 今いる管理者ページも作り直す
}

// 画像を1つ前（-1）か1つうしろ（+1）に動かす
export async function moveScreenshot(appId: string, screenshotId: number, step: -1 | 1) {
  await requireLogin();
  const supabase = await createClient();

  const { data: list } = await supabase
    .from("screenshots")
    .select("id")
    .eq("app_id", appId)
    .order("sort_order")
    .order("id");

  if (!list) return;

  const ids = list.map((s) => s.id);
  const from = ids.indexOf(screenshotId);
  const to = from + step;
  if (from === -1 || to < 0 || to >= ids.length) return;

  // 2つを入れ替えてから、上から 1, 2, 3… と振り直す
  [ids[from], ids[to]] = [ids[to], ids[from]];
  for (const [index, id] of ids.entries()) {
    await supabase.from("screenshots").update({ sort_order: index + 1 }).eq("id", id);
  }

  updateTag("apps");

  refresh(); // 今いる管理者ページも作り直す
}
