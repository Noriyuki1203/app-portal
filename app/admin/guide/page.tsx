import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "アプリの公開のしかた | アプリ配布サイト",
};

const h2 = "mt-10 text-xl font-bold";
const h3 = "mt-6 font-semibold";
const p = "mt-2 leading-7";
const ol = "mt-2 list-decimal space-y-1 pl-6 leading-7";
const ul = "mt-2 list-disc space-y-1 pl-6 leading-7";
const code = "rounded bg-zinc-100 px-1 py-0.5 font-mono text-sm";
const pre = "mt-2 overflow-x-auto rounded bg-zinc-900 p-4 font-mono text-sm text-zinc-100";

export default function GuidePage() {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <Link href="/admin" className="text-sm text-blue-600 hover:underline">
        ← 管理ページへ戻る
      </Link>
      <h1 className="mt-4 text-2xl font-bold">アプリの公開のしかた（投稿者向け）</h1>
      <p className={p}>
        このサイトはアプリのファイルそのものは預かりません。ファイルは<strong>自分の GitHub の公開リポジトリの
        Releases（リリース）</strong>に置き、そのダウンロード URL をアプリの登録画面に入れてください。
        Web アプリは、公開済みのアプリの URL を入れるだけです。
      </p>

      <h2 className={h2}>全体の流れ</h2>
      <ol className={ol}>
        <li>（最初に1回だけ）GitHub に配布用の公開リポジトリを作る</li>
        <li>リリースを作り、アプリのファイル（.apk・.zip・.exe など）を添付する</li>
        <li>添付したファイルのダウンロード URL をコピーする</li>
        <li>
          このサイトの管理ページ「+追加」で、アプリの情報と URL を登録する
        </li>
      </ol>

      <h2 className={h2}>1. 配布用の公開リポジトリを作る（最初に1回だけ）</h2>
      <ol className={ol}>
        <li>GitHub のアカウントを用意する（無料プランで足ります）</li>
        <li>
          右上の「+」→「New repository」を開き、名前を決める（例：<code className={code}>my-app-releases</code>）
        </li>
        <li>
          公開範囲は <strong>Public</strong> にする（Private だと利用者がダウンロードできません）
        </li>
        <li>「Add a README file」にチェックを入れて「Create repository」</li>
      </ol>
      <p className={p}>
        このリポジトリは<strong>配るためだけ</strong>に使います。アプリのソースコードは置かず、ソースは別の非公開リポジトリで管理するのがおすすめです。
        Git のコマンド（push など）は使わなくても公開できます。
      </p>

      <h2 className={h2}>2. リリースを作ってファイルを添付する（Android・Windows・Mac）</h2>
      <h3 className={h3}>GitHub の画面で行う場合</h3>
      <ol className={ol}>
        <li>配布用リポジトリを開き、右側の「Releases」→「Create a new release」（または「Draft a new release」）</li>
        <li>
          「Choose a tag」にタグ名を入れ、「Create new tag」を選ぶ。タグ名は
          <code className={code}>アプリID-v版</code> の形にしてください（例：<code className={code}>sample-todo-v1.0.0</code>）。
          アプリIDはこのサイトに登録するIDと同じにします
        </li>
        <li>「Release title」に分かりやすい名前（例：<code className={code}>サンプルToDo 1.0.0</code>）、説明欄に変更点を書く</li>
        <li>下の「Attach binaries」にファイルをドラッグして添付する（1ファイル2GBまで）</li>
        <li>「Publish release」を押す</li>
      </ol>

      <h3 className={h3}>コマンドで行う場合（GitHub CLI の gh を使う人向け）</h3>
      <pre className={pre}>
{`gh release create sample-todo-v1.0.0 ./sample-todo.apk \\
  --repo あなたのユーザー名/my-app-releases \\
  --title "サンプルToDo 1.0.0" \\
  --notes "最初の版"`}
      </pre>

      <h2 className={h2}>3. ダウンロード URL をコピーする</h2>
      <p className={p}>
        公開したリリースの「Assets」に並ぶ<strong>自分が添付したファイル名</strong>を右クリックし、「リンクのアドレスをコピー」を選びます。
        次の形になっていれば正しい URL です。
      </p>
      <pre className={pre}>
        {`https://github.com/ユーザー名/リポジトリ名/releases/download/タグ名/ファイル名`}
      </pre>
      <ul className={ul}>
        <li>リリースのページの URL（<code className={code}>…/releases/tag/…</code>）は、ファイルの URL ではないので使えません</li>
        <li>自動で付く「Source code (zip)」は使いません</li>
        <li>
          <code className={code}>…/releases/latest/download/…</code> という「いつも最新」の URL もありますが、
          サイトに書いた版と中身がずれることがあるため、<strong>版を固定した URL</strong>をおすすめします
        </li>
      </ul>

      <h2 className={h2}>4. このサイトに登録する</h2>
      <ol className={ol}>
        <li>管理ページの「+追加」を開く</li>
        <li>アプリID（タグの頭と同じ）・名前・説明・種類・バージョン・対応OSを入れる</li>
        <li>「ダウンロードURL」に、3でコピーした URL を貼る</li>
        <li>公開の範囲を選んで保存する（最初は「非公開」。確認できたら「限定」か「一般」に）</li>
        <li>サイトでアプリの詳細ページを開き、ダウンロードボタンからファイルが落ちてくるか確かめる</li>
      </ol>

      <h2 className={h2}>Web アプリの場合</h2>
      <p className={p}>
        Vercel・GitHub Pages・Cloudflare Pages など、好きな場所でアプリを公開し、そのアプリを開く URL を「ダウンロードURL」に入れてください。
        種類を「Web」にすると、詳細ページのボタンが「開く」になります。
      </p>

      <h2 className={h2}>新しい版を出すとき</h2>
      <ol className={ol}>
        <li>新しいタグ（例：<code className={code}>sample-todo-v1.1.0</code>）でリリースを作り、新しいファイルを添付する</li>
        <li>管理ページでアプリの「編集」を開き、バージョンとダウンロード URL を新しいものに書き換える</li>
      </ol>
      <p className={p}>古いリリースは消さずに残しておいてかまいません（問題のある版なら、リリースの説明に新しい版を使うよう書き足してください）。</p>

      <h2 className={h2}>気をつけること</h2>
      <ul className={ul}>
        <li>
          <strong>公開リポジトリのファイルは、URL を知っていればだれでもダウンロードできます。</strong>
          このサイトで「限定」「非公開」にしても隠れるのはサイト上の表示だけで、ファイル自体は公開されています
        </li>
        <li>パスワード・APIキーなどの秘密の値を、アプリやリリースに含めないでください</li>
        <li>
          Android アプリの署名に使う鍵（.jks など）とそのパスワードは、リポジトリに上げず自分のPCに大切に保管してください。
          なくすと、同じアプリとして更新を配れなくなります
        </li>
        <li>会社の業務で作ったもの・業務の情報を含むものは載せないでください（自己学習で作ったものだけ）</li>
        <li>
          署名のない Windows・Mac のアプリは、利用者のPCで警告が出ます。利用者向けの対処は
          <Link href="/install" className="text-blue-600 hover:underline">インストール方法</Link>
          のページで案内しています
        </li>
      </ul>
    </main>
  );
}
