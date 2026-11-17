import { getAppById, getPublishedApps } from "@/data/apps";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import ScreenshotGallery from "@/components/ScreenshotGallery";
import PlatformBadge from "@/components/PlatformBadge";
import { getScreenshotsByAppId } from "@/data/screenshots";
import { PLATFORM_LABELS } from "@/lib/platforms";

export async function generateStaticParams() {
  const apps = await getPublishedApps();
  return apps.map((app) => ({ id: app.id }));
}

export async function generateMetadata(props: PageProps<"/apps/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const app = await getAppById(id);

  if (!app) {
    return { title: "見つかりません" };
  }

  return {
    title: `${app.name} | アプリ配布サイト`,
    description: app.summary,
    openGraph: {
      title: `${app.name} | アプリ配布サイト`,
      description: app.summary,
      siteName: "アプリ配布サイト",
    },
  };
}

export default async function AppDetailPage(props: PageProps<"/apps/[id]">) {
  const { id } = await props.params;
  const app = await getAppById(id);

  if (!app) {
    notFound();
  }
  const screenshots = await getScreenshotsByAppId(app.id);
  const isWeb = app.platform === "web";

  return (
    <main className="mx-auto max-w-3xl p-8">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">{app.name}</h1>
        <PlatformBadge platform={app.platform} />
      </div>
      <p className="mt-4 whitespace-pre-line">{app.description}</p>
      {screenshots.length > 0 && <ScreenshotGallery screenshots={screenshots} />}
      <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
        <dt className="text-zinc-500">バージョン</dt>
        <dd>{app.version}</dd>
        <dt className="text-zinc-500">{isWeb ? "対応ブラウザ" : "対応OS"}</dt>
        <dd>{app.min_os}</dd>
        <dt className="text-zinc-500">更新日</dt>
        <dd>
          {new Date(app.updated_at).toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" })}
        </dd>
      </dl>
      <div className="mt-8">
        {!app.download_url ? (
          <p className="text-zinc-500">準備中</p>
        ) : isWeb ? (
          // Web アプリは新しいタブで開く。rel を付けて、開いた先から元のページを操作されないようにする
          <a
            href={app.download_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-full bg-zinc-900 px-6 py-3 font-semibold text-white hover:bg-zinc-700"
          >
            開く
          </a>
        ) : (
          <a
            href={app.download_url}
            className="inline-block rounded-full bg-zinc-900 px-6 py-3 font-semibold text-white hover:bg-zinc-700"
          >
            ダウンロード
          </a>
        )}
      </div>
      {!isWeb && (
        <p className="mt-4 text-sm">
          <Link
            href={`/install?platform=${app.platform}`}
            className="text-blue-600 hover:underline"
          >
            {PLATFORM_LABELS[app.platform]} でのインストール方法
          </Link>
        </p>
      )}
    </main>
  );
}
