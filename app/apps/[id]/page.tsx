import { getAppById, getPublishedApps } from "@/data/apps";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ScreenshotGallery from "@/components/ScreenshotGallery";
import { getScreenshotsByAppId } from "@/data/screenshots";

export async function generateStaticParams() {
  const apps = await getPublishedApps();
  return apps.map((app) => ({ id: app.id }));
}

export async function generateMetadata(props: PageProps<"/apps/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const app = await getAppById(id);

  return {
    title: app ? `${app.name} | アプリ配布サイト` : "見つかりません",
  };
}

export default async function AppDetailPage(props: PageProps<"/apps/[id]">) {
  const { id } = await props.params;
  const app = await getAppById(id);

  if (!app) {
    notFound();
  }
  const screenshots = await getScreenshotsByAppId(app.id);

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-2xl font-bold">{app.name}</h1>
      <p className="mt-4">{app.description}</p>
      {screenshots.length > 0 && <ScreenshotGallery screenshots={screenshots} />}
      <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
        <dt className="text-zinc-500">バージョン</dt>
        <dd>{app.version}</dd>
        <dt className="text-zinc-500">対応OS</dt>
        <dd>{app.min_os}</dd>
        <dt className="text-zinc-500">更新日</dt>
        <dd>
          {new Date(app.updated_at).toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" })}
        </dd>

      </dl>
      <div className="mt-8">
        {app.download_url ? (
          <a
            href={app.download_url}
            className="inline-block rounded-full bg-zinc-900 px-6 py-3 font-semibold text-white hover:bg-zinc-700"
          >
            ダウンロード
          </a>
        ) : (
          <p className="text-zinc-500">準備中</p>
        )}
      </div>
    </main>
  );
}
