import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { listAccounts } from "@/data/accounts";
import { InviteUrlBox, PendingActions, PosterActions, RealNameForm } from "@/components/AccountForms";
import { getOrCreateInviteCode } from "@/data/invite";

export const metadata: Metadata = {
  title: "アカウント管理 | アプリ配布サイト",
};

const dateTime = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }) : "—";

export default function AccountsPage() {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <Link href="/admin" className="text-sm text-blue-600 hover:underline">
        ← 管理ページへ戻る
      </Link>
      <h1 className="mt-4 text-2xl font-bold">アカウント管理</h1>
      <Suspense fallback={<p className="mt-4 text-zinc-500">読み込み中…</p>}>
        <AccountsContent />
      </Suspense>
    </main>
  );
}

async function AccountsContent() {
  await requireAdmin();

  if (!process.env.SUPABASE_SECRET_KEY) {
    return (
      <p className="mt-6 text-red-600">
        アカウント管理には、Vercel の環境変数 SUPABASE_SECRET_KEY の設定が必要です。
      </p>
    );
  }

  const [all, inviteCode] = await Promise.all([listAccounts(), getOrCreateInviteCode()]);
  const pending = all.filter((a) => a.pending);
  const accounts = all.filter((a) => !a.pending);

  return (
    <>
      <section className="mt-6">
        <h2 className="text-xl font-bold">投稿者の招待</h2>
        <InviteUrlBox code={inviteCode} />
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold">
          承認待ち（{pending.length}件）
          {pending.length > 0 && (
            <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 align-middle text-xs text-amber-800">
              確認してください
            </span>
          )}
        </h2>
        {pending.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">承認待ちの登録はありません。</p>
        ) : (
          <table className="mt-4 w-full text-left text-sm">
            <thead className="border-b border-zinc-300 text-zinc-500">
              <tr>
                <th className="py-2">ID</th>
                <th className="py-2">本名</th>
                <th className="py-2">登録した日時</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {pending.map((a) => (
                <tr key={a.id} className="border-b border-zinc-200 align-top">
                  <td className="py-2 font-mono">{a.loginId}</td>
                  <td className="py-2">{a.realName}</td>
                  <td className="py-2 text-zinc-500">{dateTime(a.createdAt)}</td>
                  <td className="py-2">
                    <PendingActions userId={a.id} loginId={a.loginId} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold">アカウント（{accounts.length}件）</h2>
        <table className="mt-4 w-full text-left text-sm">
          <thead className="border-b border-zinc-300 text-zinc-500">
            <tr>
              <th className="py-2">ID / 表示名</th>
              <th className="py-2">本名</th>
              <th className="py-2">役割</th>
              <th className="py-2">最後のログイン</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((a) => (
              <tr key={a.id} className="border-b border-zinc-200 align-top">
                <td className="py-2">
                  <p className="font-mono">{a.loginId}</p>
                  <p className="text-zinc-500">{a.displayName}</p>
                </td>
                <td className="py-2">
                  {a.role === "poster" ? (
                    <RealNameForm userId={a.id} realName={a.realName} />
                  ) : (
                    <span className="text-zinc-400">—</span>
                  )}
                </td>
                <td className="py-2">
                  {a.role === "admin" ? (
                    "管理者"
                  ) : a.role === "poster" ? (
                    a.disabled ? <span className="text-red-600">投稿者（停止中）</span> : "投稿者"
                  ) : (
                    <span className="text-zinc-400">権限なし</span>
                  )}
                </td>
                <td className="py-2 text-zinc-500">{dateTime(a.lastSignInAt)}</td>
                <td className="py-2">
                  {a.role === "poster" && <PosterActions userId={a.id} disabled={a.disabled} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-4 text-sm text-zinc-500">
          停止すると、その人はログインできなくなり、アプリの追加・変更もできなくなります。公開中のアプリはそのまま残るので、必要なら「すべてのアプリ」から非公開にしてください。
        </p>
      </section>
    </>
  );
}
