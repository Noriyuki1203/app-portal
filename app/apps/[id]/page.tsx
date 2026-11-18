import { Suspense } from "react";
import { getAppById, getMyLimitedAppById, getPublishedApps, type AppInfo } from "@/data/apps";
import { ownerName } from "@/lib/owner";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import ScreenshotGallery from "@/components/ScreenshotGallery";
import PlatformBadge from "@/components/PlatformBadge";
import LimitedBadge from "@/components/LimitedBadge";
import { getScreenshotsByAppId, type Screenshot } from "@/data/screenshots";
import { PLATFORM_LABELS, STORE_LABELS } from "@/lib/platforms";

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
    // 一般のアプリになければ、ログイン中の人の限定のアプリを探す（作成者本人だけ見られる）
    return (
      <Suspense fallback={<p className="mx-auto max-w-3xl p-8 text-zinc-500">読み込み中…</p>}>
        <LimitedAppDetail id={id} />
      </Suspense>
    );
  }
  const screenshots = await getScreenshotsByAppId(app.id);
  return <AppDetail app={app} screenshots={screenshots} />;
}

async function LimitedAppDetail({ id }: { id: string }) {
  const found = await getMyLimitedAppById(id);
  if (!found) {
    notFound();
  }
  return <AppDetail app={found.app} screenshots={found.screenshots} />;
}

function AppDetail({ app, screenshots }: { app: AppInfo; screenshots: Screenshot[] }) {
  const isWeb = app.platform === "web";
  const hasStore = !isWeb && !!app.store_url;

  return (
    <main className="mx-auto max-w-3xl p-8">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">{app.name}</h1>
        <PlatformBadge platform={app.platform} />
        {!app.is_published && <LimitedBadge />}
      </div>
      {!app.is_published && (
        <p className="mt-2 text-sm text-amber-800">
          限定のアプリです。作成者のあなたにだけ表示されています（ほかの人には見えません）。
        </p>
      )}
      <p className="mt-4 whitespace-pre-line">{app.description}</p>
      {screenshots.length > 0 && <ScreenshotGallery screenshots={screenshots} />}
      <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
        <dt className="text-zinc-500">作成者</dt>
        <dd>{ownerName(app)}</dd>
        <dt className="text-zinc-500">バージョン</dt>
        <dd>{app.version}</dd>
        <dt className="text-zinc-500">{isWeb ? "対応ブラウザ" : "対応OS"}</dt>
        <dd>{app.min_os}</dd>
        <dt className="text-zinc-500">更新日</dt>
        <dd>
          {new Date(app.updated_at).toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" })}
        </dd>
      </dl>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        {hasStore && (
          // ストアは別サイトなので新しいタブで開く
          <a
            href={app.store_url!}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-full bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-500"
          >
            {STORE_LABELS[app.platform]} で入手
          </a>
        )}
        {!app.download_url ? (
          !hasStore && <p className="text-zinc-500">準備中</p>
        ) : hasStore ? (
          // ストアがあるときは、ファイルを直接もらう方は控えめに出す
          <a
            href={app.download_url}
            className="inline-block rounded-full border border-zinc-300 px-6 py-3 font-semibold text-zinc-700 hover:bg-zinc-100"
          >
            ファイルを直接ダウンロード
          </a>
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
