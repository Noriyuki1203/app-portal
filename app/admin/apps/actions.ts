"use server";

import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireLogin } from "@/lib/auth";

export type FormState = {
    error: string;
    message?: string;
};

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

export async function createApp(prevState: FormState, formData: FormData): Promise<FormState> {
    await requireLogin();

    const id = String(formData.get("id") ?? "").trim();
    const app = readAppForm(formData);

    if (!/^[a-z0-9-]+$/.test(id)) {
        return { error: "IDは半角の小文字・数字・ハイフン(-)だけで書いてください" };
    }
    if (!app.name) {
        return { error: "アプリ名を入れてください" };
    }

    const supabase = await createClient();
    const { error } = await supabase.from("apps").insert({
        id, ...app
    });

    if (error) {
        if (error.code === "23505") {
            return { error: "そのIDはもう使われています" };
        }
        return { error: `追加できませんでした：${error.message}` };
    }

    updateTag("apps");
    redirect("/admin");
}

export async function updateApp(id: string,
    prevState: FormState,
    formData: FormData
): Promise<FormState> {
    await requireLogin();

    const app = readAppForm(formData);
    if (!app.name) {
        return { error: "アプリ名をいれてください" };
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

export async function deleteApp(id: string) {
  await requireLogin();
  const supabase = await createClient();

  // 行を消す（screenshots の行は on delete cascade で一緒に消える）
  const { error } = await supabase.from("apps").delete().eq("id", id);
  if (error) {
    throw new Error(`削除できませんでした：${error.message}`);
  }

  updateTag("apps");
  redirect("/admin");
}