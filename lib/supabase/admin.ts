import "server-only";
import { createClient } from "@supabase/supabase-js";

// 管理者の権限で Supabase を操作する窓口（アカウントの作成・停止・パスワード再設定だけに使う）。
// 秘密の鍵 SUPABASE_SECRET_KEY は .env.local と Vercel の環境変数だけに置き、ブラウザーには絶対に渡さない。
// "server-only" により、ブラウザー側の部品から読み込むとビルドが失敗する。
export function createAdminClient() {
    const key = process.env.SUPABASE_SECRET_KEY;
    if (!key) {
        throw new Error("SUPABASE_SECRET_KEY が設定されていません（Vercel の環境変数を確認してください）");
    }
    return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
        auth: { persistSession: false, autoRefreshToken: false },
    });
}

// 変更の記録に、アカウント操作を書く（DBのトリガーでは「だれが」が取れないため）
export async function writeAuditLog(
    actor: string,
    action: string,
    targetId: string,
    detail: Record<string, unknown> | null = null
) {
    const admin = createAdminClient();
    await admin.from("audit_log").insert({
        actor,
        action,
        target_table: "accounts",
        target_id: targetId,
        detail,
    });
}
