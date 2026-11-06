import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { requireLogin } from "@/lib/auth";
import AppForm from "@/components/AppForm";
import { createApp } from "../actions";

export const metadata: Metadata = {
    title: "アプリの追加｜アプリ配布サイト",
};

export default function NewAppPage() {
    return (
        <main className="mx-auto max-w-3xl p-8">
            <Link href="/admin" className="text-sm text-blue-600 hover:underline">
                ← 管理者ページに戻る
            </Link>
            <h1 className="mt-4 text-2xl font-bold">アプリの追加</h1>
            <Suspense fallback={<p className="mt-4 text-zinc-500">読み込み中…</p>}>
                <NewAppContent />
            </Suspense>
        </main>
    )

    async function NewAppContent() {
        await requireLogin();
        return<AppForm action={createApp}/>
    }
}
