import { Suspense } from "react";
import type { Metadata } from "next";
import { requireLogin } from "@/lib/auth";
import { logout } from "./actions";

export const metadata : Metadata={
  title:"管理者ページ｜アプリ配布サイト",
};

export default function AdminPage() {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-2xl font-bold">管理者ページ</h1>
      <Suspense fallback={<p className="mt-4 text-zinc-500">読み込み中...</p>}>
      <AdminContent />
      </Suspense>
    </main>
  );
}

async function AdminContent(){
  const user = await requireLogin();

  return(
    <div className="mt-4 flex items-center justify-between">
      <p >{user.loginId}でログイン中</p>
      <form action={logout}>
        <button type="submit" className="rounded-fll border border-zinc-300
        px-4 py-2 text-sm hover:bg-zinc-100">
          ログアウト
        </button>
      </form>
    </div>
  );
}