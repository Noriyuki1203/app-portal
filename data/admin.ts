import { createClient } from "@/lib/supabase/server";
import type { AppInfo } from "@/data/apps";
import type { Screenshot } from "@/data/screenshots";
import type { LoginUser } from "@/lib/auth";

// 編集してよいアプリか（管理者は全部、投稿者は自分のものだけ）
export function canEdit(user: LoginUser, app: Pick<AppInfo, "owner_id">): boolean {
    return user.role === "admin" || app.owner_id === user.id;
}

// 管理者は全部、投稿者は自分が登録したアプリだけ
// （投稿者は「公開中のアプリはだれでも読める」で他人の公開アプリも読めてしまうので、ここで絞る）
export async function getAllApps(user: LoginUser): Promise<AppInfo[]> {
    const supabase = await createClient();
    let query = supabase.from("apps").select("*");
    if (user.role !== "admin") {
        query = query.eq("owner_id", user.id);
    }
    const { data, error } = await query.order("updated_at", { ascending: false });

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