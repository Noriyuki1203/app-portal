import { supabase } from "@/lib/supabase/public";

// Supabase の無料プランは、7日間アクセスがないとプロジェクトが一時停止される。
// Vercel Cron（vercel.json）から1日1回ここを呼び、DB を1回読んで停止を防ぐ。
export async function GET(request: Request) {
  // Vercel は環境変数 CRON_SECRET を「Authorization: Bearer <値>」として送ってくる。
  // 合わない呼び出し（Vercel 以外からのアクセス）は断る。
  // request.headers を読むので、このページはビルド時に固定されず、毎回実行される。
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  // キャッシュを通さず、DB に直接1件だけ問い合わせる（RLS で公開中のものだけ見える）
  const { error } = await supabase.from("apps").select("id").limit(1);

  if (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true, at: new Date().toISOString() });
}
