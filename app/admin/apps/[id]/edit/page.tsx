import { Suspense } from "react";
import DeleteAppButton from "@/components/DeleteAppButton";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireLogin } from "@/lib/auth";
import { getAppForEdit } from "@/data/admin";
import AppForm from "@/components/AppForm";
import { deleteApp, updateApp } from "../../actions";

export const metadata: Metadata = {
    title: "アプリの編集｜アプリ配布サイト",
};

export default function EditAppPage(props: PageProps<"/admin/apps/[id]/edit">) {
    return (
        <main className="mx-auto max-w-3xl p-8">
            <Link href="/admin" className="text-sm text-blue-600 hover:underline">
                ← 管理者ページへ戻る
            </Link>
            <h1 className="mt-4 text-2xl font-bold">アプリの編集</h1>
            <Suspense fallback={<p className="mt-4 text-zinc-500">読み込み中…</p>}>
                <EditContent params={props.params} />
            </Suspense>
        </main>
    )
}

async function EditContent({ params }: { params: Promise<{ id: string }> }) {
    await requireLogin();
    const { id } = await params;
    const app = await getAppForEdit(id);

    if (!app) {
        notFound();
    }

    return (
        <>
            <AppForm action={updateApp.bind(null, app.id)} app={app} />
            <section className="mt-10 border-t border-zinc-200 pt-6">
                <DeleteAppButton action={deleteApp.bind(null, app.id)} appName={app.name} />
            </section>
        </>
    );
}