import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { UNSET_NAME } from "@/lib/owner";

export const metadata: Metadata = {
  title: "変更の記録 | アプリ配布サイト",
};

type LogRow = {
  id: number;
  at: string;
  actor: string | null;
  action: string;
  target_table: string | null;
  target_id: string | null;
  detail: Record<string, unknown> | null;
};

const TABLE_LABELS: Record<string, string> = {
  apps: "アプリ",
  screenshots: "スクリーンショット",
  profiles: "表示名",
  posters: "投稿者の状態",
  accounts: "アカウント",
};

const ACTION_LABELS: Record<string, string> = {
  insert: "追加",
  update: "変更",
  delete: "削除",
  account_create: "作成",
  account_disable: "停止",
  account_enable: "再開",
  account_password_reset: "パスワード再設定",
};

function describe(detail: LogRow["detail"]): string {
  if (!detail) return "";
  return Object.entries(detail)
    .filter(([, v]) => v !== null && v !== undefined)
    .map(([k, v]) => `${k}: ${typeof v === "string" ? v : JSON.stringify(v)}`)
    .join(" / ");
}

export default function LogsPage() {
  return (
    <main className="mx-auto max-w-4xl p-8">
      <Link href="/admin" className="text-sm text-blue-600 hover:underline">
        ← 管理ページへ戻る
      </Link>
      <h1 className="mt-4 text-2xl font-bold">変更の記録</h1>
      <p className="mt-2 text-sm text-zinc-500">新しい順に200件まで表示します。</p>
      <Suspense fallback={<p className="mt-4 text-zinc-500">読み込み中…</p>}>
        <LogsContent />
      </Suspense>
    </main>
  );
}

async function LogsContent() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: logs, error } = await supabase
    .from("audit_log")
    .select("*")
    .order("at", { ascending: false })
    .limit(200);
  if (error) {
    throw new Error(`記録を読めませんでした：${error.message}`);
  }

  const { data: profiles } = await supabase.from("profiles").select("id, display_name");
  const names = new Map((profiles ?? []).map((p) => [p.id as string, (p.display_name as string)?.trim() || UNSET_NAME]));
  const who = (id: string | null) => (id ? names.get(id) ?? "（削除されたユーザー）" : "システム");

  if (!logs || logs.length === 0) {
    return <p className="mt-6 text-zinc-500">まだ記録はありません。</p>;
  }

  return (
    <table className="mt-4 w-full text-left text-sm">
      <thead className="border-b border-zinc-300 text-zinc-500">
        <tr>
          <th className="py-2 pr-3">日時</th>
          <th className="py-2 pr-3">だれが</th>
          <th className="py-2 pr-3">何を</th>
          <th className="py-2">内容</th>
        </tr>
      </thead>
      <tbody>
        {(logs as LogRow[]).map((log) => (
          <tr key={log.id} className="border-b border-zinc-200 align-top">
            <td className="py-2 pr-3 whitespace-nowrap text-zinc-500">
              {new Date(log.at).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}
            </td>
            <td className="py-2 pr-3">{who(log.actor)}</td>
            <td className="py-2 pr-3 whitespace-nowrap">
              {TABLE_LABELS[log.target_table ?? ""] ?? log.target_table}の
              {ACTION_LABELS[log.action] ?? log.action}
            </td>
            <td className="py-2 break-all text-zinc-600">
              {log.target_table === "accounts" || log.target_table === "posters" || log.target_table === "profiles"
                ? `対象：${who(log.target_id)}`
                : log.target_id}
              {describe(log.detail) && <span className="block text-xs text-zinc-500">{describe(log.detail)}</span>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
