"use client";

import { useState } from "react";
import { INSTALLABLE_PLATFORMS, PLATFORM_LABELS, type Platform } from "@/lib/platforms";

type Props = {
  initial: Platform; // 最初に選んでおくタブ（/install?platform=windows など）
};

// インストール方法を、種類ごとのタブで切り替える（拡張編 問15-2）
export default function InstallTabs({ initial }: Props) {
  const [current, setCurrent] = useState<Platform>(initial);

  return (
    <div className="mt-6">
      <div role="tablist" className="flex gap-2 border-b border-zinc-200">
        {INSTALLABLE_PLATFORMS.map((p) => (
          <button
            key={p}
            type="button"
            role="tab"
            aria-selected={current === p}
            onClick={() => setCurrent(p)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-semibold ${
              current === p
                ? "border-zinc-900 text-zinc-900"
                : "border-transparent text-zinc-500 hover:text-zinc-900"
            }`}
          >
            {PLATFORM_LABELS[p]}
          </button>
        ))}
      </div>

      <div role="tabpanel" className="mt-6">
        {current === "android" && <AndroidSteps />}
        {current === "windows" && <WindowsSteps />}
        {current === "mac" && <MacSteps />}
      </div>
    </div>
  );
}

function AndroidSteps() {
  return (
    <section id="android">
      <p>Android のアプリは Google Play ではなく、APK ファイルを直接ダウンロードしてインストールします。</p>
      <ol className="mt-4 list-decimal space-y-3 pl-6">
        <li>アプリの詳細ページで「ダウンロード」を押し、APK ファイルを保存します。</li>
        <li>
          ダウンロードした APK を開きます。「提供元不明のアプリ」の確認が出たら、設定画面で
          「この提供元のアプリを許可」をオンにします。
        </li>
        <li>元の画面に戻り、「インストール」を押します。</li>
      </ol>
      <p className="mt-4 text-sm text-zinc-500">
        ※ 機種や Android のバージョンによって、画面の言葉は少し違います。
        Play プロテクトの警告が出た場合は、「詳細」から「インストールする」を選びます。
      </p>
    </section>
  );
}

function WindowsSteps() {
  return (
    <section id="windows">
      <ol className="list-decimal space-y-3 pl-6">
        <li>アプリの詳細ページで「ダウンロード」を押し、ファイルを保存します。</li>
        <li>
          ファイルが <code>.zip</code> のときは、右クリックして「すべて展開」を選び、展開したフォルダーを開きます。
        </li>
        <li>アプリのファイル（<code>.exe</code> など）をダブルクリックして起動します。</li>
      </ol>
      <p className="mt-4 text-sm text-zinc-500">
        ※「Windows によって PC が保護されました」と出た場合は、「詳細情報」を押してから「実行」を選びます。
        このサイトのアプリは、有料の電子署名をしていないため、この確認が出ます。
      </p>
    </section>
  );
}

function MacSteps() {
  return (
    <section id="mac">
      <ol className="list-decimal space-y-3 pl-6">
        <li>アプリの詳細ページで「ダウンロード」を押し、ファイルを保存します。</li>
        <li>
          <code>.zip</code> はダブルクリックで展開します。<code>.dmg</code> はダブルクリックで開き、
          アプリを「アプリケーション」フォルダーへドラッグします。
        </li>
        <li>アプリをダブルクリックして起動します。</li>
      </ol>
      <p className="mt-4 text-sm text-zinc-500">
        ※「開いていません」「開発元を検証できません」などと出た場合は、いったん「完了」で閉じます。
        そのあと「システム設定」→「プライバシーとセキュリティ」を開き、下のほうの「このまま開く」を押します。
        このサイトのアプリは、Apple の公証（確認）を受けていないため、この確認が出ます。
      </p>
    </section>
  );
}
