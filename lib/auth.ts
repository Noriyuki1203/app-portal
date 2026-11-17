import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";

export type Role = "admin" | "poster";

export type LoginUser = {
    id: string;
    loginId: string;
    role: Role;
};

// ログイン中の人の役割。管理者でも（承認済みで停止していない）投稿者でもなければ null
export async function getRole(userId: string): Promise<Role | null> {
    const supabase = await createClient();
    // どちらの表も「本人は自分の行だけ読める」ので、自分の行が見えるかで判定できる
    const [{ data: admin }, { data: poster }] = await Promise.all([
        supabase.from("admins").select("user_id").eq("user_id", userId).maybeSingle(),
        supabase.from("posters").select("disabled, approved_at").eq("user_id", userId).maybeSingle(),
    ]);
    if (admin) return "admin";
    if (poster && !poster.disabled && poster.approved_at) return "poster";
    return null;
}

// 管理ページに入れる人（管理者・投稿者）だけ通す
export async function requireLogin(): Promise<LoginUser> {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();

    if (!data?.claims) {
        redirect("/admin/login");
    }

    const id = data.claims.sub;
    const role = await getRole(id);
    if (!role) {
        // 停止中のアカウントや、役割のないアカウント
        redirect("/admin/denied");
    }

    return {
        id,
        loginId: String(data.claims.email ?? "").split("@")[0],
        role,
    };
}

// 管理者だけ通す（アカウント管理・変更の記録）
export async function requireAdmin(): Promise<LoginUser> {
    const user = await requireLogin();
    if (user.role !== "admin") {
        redirect("/admin");
    }
    return user;
}
