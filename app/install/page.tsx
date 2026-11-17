import { Suspense } from "react";
import type { Metadata } from "next";
import InstallTabs from "@/components/InstallTabs";
import { INSTALLABLE_PLATFORMS, type Platform } from "@/lib/platforms";

export const metadata: Metadata = {
  title: "インストール方法 | アプリ配布サイト",
};

export default function InstallPage(props: PageProps<"/install">) {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-2xl font-bold">インストール方法</h1>
      <p className="mt-4">
        アプリの種類を選んでください。Web アプリは、インストールせずにブラウザでそのまま使えます。
      </p>
      {/* URL の ?platform= は開かれるまで分からないので、Suspense の中で読む。
          読み終わるまでは Android のタブで表示しておく */}
      <Suspense fallback={<InstallTabs initial="android" />}>
        <InstallTabsFromParams searchParams={props.searchParams} />
      </Suspense>
    </main>
  );
}

async function InstallTabsFromParams({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { platform } = await searchParams;
  const initial: Platform = INSTALLABLE_PLATFORMS.find((p) => p === platform) ?? "android";

  // key を付けて、?platform= が変わったら最初のタブを選び直す
  return <InstallTabs key={initial} initial={initial} />;
}
