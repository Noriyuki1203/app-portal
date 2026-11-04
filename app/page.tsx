import { getPublishedApps } from "@/data/apps";
import AppList from "@/components/AppList";

export default function Home() {
  const apps = getPublishedApps();

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-2xl font-bold">アプリ一覧</h1>
      <AppList apps={apps} />
    </main>
  );
}
