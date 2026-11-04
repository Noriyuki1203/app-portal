import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "インストール方法 | アプリ配布サイト",
};

export default function InstallPage() {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-2xl font-bold">インストール方法</h1>
      <p className="mt-4">
        このサイトのアプリは Google Play ではなく、APK ファイルを直接ダウンロードしてインストールします。
      </p>
      <ol className="mt-6 list-decimal space-y-3 pl-6">
        <li>アプリの詳細ページで「ダウンロード」を押し、APK ファイルを保存します。</li>
        <li>
          ダウンロードした APK を開きます。「提供元不明のアプリ」の確認が出たら、設定画面で
          「この提供元のアプリを許可」をオンにします。
        </li>
        <li>元の画面に戻り、「インストール」を押します。</li>
      </ol>
      <p className="mt-6 text-sm text-zinc-500">
        ※ 機種や Android のバージョンによって、画面の言葉は少し違います。
        Play プロテクトの警告が出た場合は、「詳細」から「インストールする」を選びます。
      </p>
    </main>
  );
}
