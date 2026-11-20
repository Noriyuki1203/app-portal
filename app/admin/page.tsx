import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { requireLogin } from "@/lib/auth";
import { getAllApps } from "@/data/admin";
import { getMyDisplayName } from "@/data/profiles";
import { UNSET_NAME } from "@/lib/owner";
import { logout } from "./actions";
import { createClient } from "@/lib/supabase/server";
import PlatformBadge from "@/components/PlatformBadge";
import LimitedBadge from "@/components/LimitedBadge";

export const metadata: Metadata = {
  title: "管理ページ｜アプリ配布サイト",
};

export default function AdminPage() {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-2xl font-bold">管理ページ</h1>
      <Suspense fallback={<p className="mt-4 text-zinc-500">読み込み中...</p>}>
        <AdminContent />
      </Suspense>
    </main>
  );
}

async function AdminContent() {
  const user = await requireLogin();
  const apps = await getAllApps(user);
  const displayName = await getMyDisplayName(user.id);
  const isAdmin = user.role === "admin";
  // 承認待ちの人数（管理者だけ。posters 表は管理者ならすべて読める）
  let pendingCount = 0;
  if (isAdmin) {
    const supabase = await createClient();
    const { count } = await supabase
      .from("posters")
      .select("user_id", { count: "exact", head: true })
      .is("approved_at", null);
    pendingCount = count ?? 0;
  }

  return (
    <>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p>
            {user.loginId}でログイン中（{isAdmin ? "管理者" : "投稿者"}）
          </p>
          <p className="text-sm text-zinc-500">
            サイトでの表示名：
            {displayName === UNSET_NAME ? (
              <span className="text-red-600">未設定（「表示名の変更」から付けてください）</span>
            ) : (
              displayName
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/guide"
            className="rounded-full border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-100">
            公開のしかた
          </Link>
          <Link href="/admin/profile"
            className="rounded-full border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-100">
            表示名の変更
          </Link>
          <Link href="/admin/password"
            className="rounded-full border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-100">
            パスワード変更
          </Link>

          <form action={logout}>
            <button type="submit" className="rounded-full border border-zinc-300
        px-4 py-2 text-sm hover:bg-zinc-100">
              ログアウト
            </button>
          </form>
        </div>
      </div>

      {isAdmin && (
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/admin/accounts"
            className="rounded-full border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-100">
            アカウント管理
            {pendingCount > 0 && (
              <span className="ml-2 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-semibold text-white">
                承認待ち {pendingCount}
              </span>
            )}
          </Link>
          <Link href="/admin/logs"
            className="rounded-full border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-100">
            変更の記録
          </Link>
        </div>
      )}

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-xl font-bold">
          {isAdmin ? "すべてのアプリ" : "自分のアプリ"}({apps.length}件)
        </h2>
        <Link
          href="/admin/apps/new"
          className="rounded-full bg-zinc-900 px-4 py-2
          text-sm font-semibold text-white hover:bg-zinc-700">
          +追加
        </Link>
      </div>

      <table className="mt-4 w-full text-left text-sm">
        <thead className="border-b border-zinc-300 text-zinc-500">
          <tr>
            <th className="py-2">アプリ名</th>
            <th className="py-2">ID</th>
            <th className="py-2">種類</th>
            <th className="py-2">状態</th>
            <th className="py-2">更新日</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {apps.map((app) => (
            <tr key={app.id} className="border-b border-zinc-200">
              <td className="py-2">{app.name}</td>
              <td className="py-2 text-zinc-500">{app.id}</td>
              <td className="py-2">
                <PlatformBadge platform={app.platform} />
              </td>
              <td className="py-2">
                {app.visibility === "public" ? "一般" : <LimitedBadge visibility={app.visibility} />}
              </td>
              <td className="py-2">
                {new Date(app.updated_at).toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" })}
              </td>
              <td className="py-2 text-right">
                <Link href={`/admin/apps/${app.id}/edit`} className="text-blue-600 hover:underline">
                  編集
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}