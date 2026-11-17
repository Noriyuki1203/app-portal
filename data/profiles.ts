import { createClient } from "@/lib/supabase/server";
import { UNSET_NAME } from "@/lib/owner";

// ログイン中の人の表示名（管理者ページ用）。行がなければ「未設定」
export async function getMyDisplayName(userId: string): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`表示名を読めませんでした：${error.message}`);
  }
  return data?.display_name?.trim() || UNSET_NAME;
}
