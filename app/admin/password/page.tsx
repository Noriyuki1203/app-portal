import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { requireLogin } from "@/lib/auth";
import PasswordForm from "@/components/PasswordForm";

export const metadata: Metadata = {
  title: "パスワード変更 | アプリ配布サイト",
};

export default function PasswordPage() {
  return (
    <main className="mx-auto max-w-sm p-8">
      <Link href="/admin" className="text-sm text-blue-600 hover:underline">
        ← 管理者ページへ戻る
      </Link>
      <h1 className="mt-4 text-2xl font-bold">パスワード変更</h1>
      <Suspense fallback={<p className="mt-4 text-zinc-500">読み込み中…</p>}>
        <PasswordContent />
      </Suspense>
    </main>
  );
}

async function PasswordContent() {
  await requireLogin();
  return <PasswordForm />;
}
