import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "プライバシーポリシー | アプリ配布サイト",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-2xl font-bold">プライバシーポリシー</h1>
      <p className="mt-4">
        このサイト（以下「本サイト」）と、本サイトで配布しているアプリでの、利用者の情報の扱いについて説明します。
      </p>

      <h2 className="mt-8 text-xl font-bold">1. 本サイトで集める情報</h2>
      <p className="mt-2">
        本サイトには、会員登録・お問い合わせフォーム・アクセス解析の機能はありません。利用者の名前やメールアドレスなどを、本サイトが集めることはありません。
      </p>

      <h2 className="mt-8 text-xl font-bold">2. 外部のサービスが扱う情報</h2>
      <p className="mt-2">
        本サイトは、次のサービスを使っています。各サービスが、それぞれのプライバシーポリシーにしたがって情報を扱います。
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-6">
        <li>Vercel（本サイトの公開）：アクセスの記録（IPアドレス、ブラウザの種類、見たページなど）</li>
        <li>GitHub（アプリのファイルの配布）：ダウンロードの記録</li>
        <li>Supabase（アプリ情報の保存）：利用者の情報は保存していません</li>
      </ul>

      <h2 className="mt-8 text-xl font-bold">3. Cookie について</h2>
      <p className="mt-2">
        Cookie（ブラウザに保存する小さなデータ）は、管理者ページにログインした管理者のログイン状態を保つためだけに使います。一般の利用者が見るページでは使いません。
      </p>

      <h2 className="mt-8 text-xl font-bold">4. 配布しているアプリについて</h2>
      <p className="mt-2">
        アプリが扱う情報は、各アプリの詳細ページに書きます。特に書いていないアプリは、利用者の情報を外部に送りません。
      </p>

      <h2 className="mt-8 text-xl font-bold">5. このページの変更</h2>
      <p className="mt-2">内容を変えたときは、このページでお知らせします。</p>

      <h2 className="mt-8 text-xl font-bold">6. お問い合わせ</h2>
      <p className="mt-2">
        本サイトやアプリについてのお問い合わせは、
        <a
          href="https://github.com/Noriyuki1203/app-portal/issues"
          className="text-blue-600 hover:underline"
        >
          GitHub の Issues
        </a>
        からお願いします。
      </p>

      <p className="mt-8 text-sm text-zinc-500">制定日：2026年11月10日</p>
    </main>
  );
}
