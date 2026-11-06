import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireLogin } from "@/lib/auth";
import { getAppForEdit, getScreenshotsForEdit } from "@/data/admin";
import AppForm from "@/components/AppForm";
import ImageUploadForm from "@/components/ImageUploadForm";
import DeleteAppButton from "@/components/DeleteAppButton";
import {
  addScreenshot,
  deleteApp,
  deleteScreenshot,
  moveScreenshot,
  updateApp,
  uploadIcon,
} from "../../actions";

export const metadata: Metadata = {
  title: "アプリの編集 | アプリ配布サイト",
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
  );
}

async function EditContent({ params }: { params: Promise<{ id: string }> }) {
  await requireLogin();
  const { id } = await params;
  const app = await getAppForEdit(id);

  if (!app) {
    notFound();
  }
  const screenshots = await getScreenshotsForEdit(app.id);

  return (
    <>
      {/* 問8-3 内容の更新 */}
      <AppForm action={updateApp.bind(null, app.id)} app={app} />

      {/* 問8-5 アイコン */}
      <section className="mt-10">
        <h2 className="text-xl font-bold">アイコン</h2>
        {app.icon_url ? (
          <Image
            src={app.icon_url}
            alt={`${app.name}のアイコン`}
            width={64}
            height={64}
            className="mt-3 h-16 w-16 rounded-xl"
          />
        ) : (
          <p className="mt-3 text-sm text-zinc-500">まだありません</p>
        )}
        <ImageUploadForm action={uploadIcon.bind(null, app.id)} buttonLabel="アイコンを変更" />
      </section>

      {/* 問8-6 スクリーンショット */}
      <section className="mt-10">
        <h2 className="text-xl font-bold">スクリーンショット（{screenshots.length}枚）</h2>
        <ul className="mt-3 flex flex-wrap gap-4">
          {screenshots.map((s, index) => (
            <li key={s.id} className="w-32">
              <Image
                src={s.image_url}
                alt={`画面 ${index + 1}`}
                width={1080}
                height={2340}
                className="h-56 w-auto rounded border border-zinc-200"
              />
              <div className="mt-2 flex gap-1 text-sm">
                <form action={moveScreenshot.bind(null, app.id, s.id, -1)}>
                  <button
                    type="submit"
                    disabled={index === 0}
                    className="rounded border border-zinc-300 px-2 disabled:opacity-30"
                  >
                    ←
                  </button>
                </form>
                <form action={moveScreenshot.bind(null, app.id, s.id, 1)}>
                  <button
                    type="submit"
                    disabled={index === screenshots.length - 1}
                    className="rounded border border-zinc-300 px-2 disabled:opacity-30"
                  >
                    →
                  </button>
                </form>
                <form action={deleteScreenshot.bind(null, s.id)}>
                  <button type="submit" className="rounded border border-red-300 px-2 text-red-600">
                    削除
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
        <ImageUploadForm action={addScreenshot.bind(null, app.id)} buttonLabel="画像を追加" />
      </section>

      {/* 問8-4 削除 */}
      <section className="mt-10 border-t border-zinc-200 pt-6">
        <DeleteAppButton action={deleteApp.bind(null, app.id)} appName={app.name} />
      </section>
    </>
  );
}
