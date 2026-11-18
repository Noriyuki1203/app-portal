import { Suspense } from "react";
import { getMemberApps, getPublishedApps, type AppInfo } from "@/data/apps";
import AppList from "@/components/AppList";

export default async function Home() {
  const apps = await getPublishedApps();

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-2xl font-bold">アプリ一覧</h1>
      {/* 一般のアプリはすぐ出し、ログイン中なら見られる限定・非公開のアプリを読み終えたところで足す */}
      <Suspense fallback={<AppList apps={apps} />}>
        <AppListWithMine apps={apps} />
      </Suspense>
    </main>
  );
}

async function AppListWithMine({ apps }: { apps: AppInfo[] }) {
  const mine = await getMemberApps();
  return <AppList apps={[...mine, ...apps]} />;
}
