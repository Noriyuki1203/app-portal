import { createClient } from "@/lib/supabase/server";
import type { AppInfo } from "@/data/apps";
import type { Screenshot } from "@/data/screenshots";

export async function getAllApps(): Promise<AppInfo[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("apps")
        .select("*")
        .order("updated_at", { ascending: false });

    if (error) {
        throw new Error(`アプリ一覧を読めませんでした：${error.message}`);
    }
    return data;
}

export async function getScreenshotsForEdit(appId: string): Promise<Screenshot[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("screenshots")
        .select("*")
        .eq("app_id", appId)
        .order("sort_order")
        .order("id");

    if (error) {
        throw new Error(`画像をよめませんでした：${error.message}`);
    }
    return data;
}

export async function getAppForEdit(id: string): Promise<AppInfo | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("apps")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (error) {
        throw new Error(`アプリを読めませんでした：${error.message}`);
    }
    return data;
}