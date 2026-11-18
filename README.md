# app-portal

自作のアプリを紹介・配布するための個人サイトです。Android アプリ・PC アプリ（Windows・Mac）の配布と、Web アプリの紹介に対応しています。

Google Play の「テスター12人・14日間」のクローズドテストを満たせなかったため、配布サイトを自分で作っています。作る過程は Qiita で連載しています。

サイト：<https://app-portal-rose.vercel.app>

## 連載記事（Qiita）

1. 構想編：なぜ自分で配布サイトを作るのか（公開後にリンクを追加）

## 主な機能

**利用者向け**

- アプリ一覧（検索と、種類（Android・Windows・Mac・Web）・作成者での絞り込み、並べ替えつき）
- アプリ詳細（説明・スクリーンショット・作成者・バージョン・対応 OS・ダウンロードボタン。Web アプリは「開く」ボタン、ストアでも配っていれば「ストアで入手」ボタン）
- インストール方法（Android・Windows・Mac のタブで切り替え）
- プライバシーポリシー

**投稿者向け（ログインが必要）**

- 招待 URL からの登録（管理者の承認が済むとログインできる）
- 自分のアプリの追加・更新・削除、種類の選択
- 公開の範囲の切り替え（一般：だれでも／限定：登録している投稿者だけ／非公開：自分だけ）
- アイコンとスクリーンショットのアップロード、並べ替え
- 表示名・パスワードの変更

**管理者向け**

- すべてのアプリの管理
- 投稿者の承認・停止・削除、招待 URL の発行
- 変更の記録（だれが・いつ・何を変えたか）の確認

## しくみ

```
 利用者 ──見る──▶ サイト（Next.js / Vercel）
                     │
                     ├─ アプリ情報を読む ──▶ データベース（Supabase）
                     │
                     ├─ ダウンロード ──▶ APK・PC アプリ（GitHub Releases）
                     │
                     └─ 開く ──▶ Web アプリ（それぞれの公開先）

 投稿者・管理者 ──ログイン──▶ 管理ページ ──追加・更新・削除──▶ データベース
```

- APK と PC アプリのファイルは配布専用の公開リポジトリの GitHub Releases に置き、データベースには URL だけを登録します。Web アプリは、そのアプリの URL を登録します
- アイコンやスクリーンショットは Supabase Storage に置きます
- 「だれがどのアプリを見られるか・書き換えられるか」（公開の範囲、投稿者は自分のアプリだけ、管理者はすべて）は、Supabase の RLS（行ごとの権限設定）でデータベース側に設定しています
- Supabase の無料プランは1週間アクセスがないと止まるため、Vercel Cron で毎日1回データベースを読んでいます

## 使っている技術

| 役割 | 技術 |
|---|---|
| 画面 | Next.js 16（App Router・Cache Components）、React 19、TypeScript、Tailwind CSS 4 |
| データベース・ログイン・画像置き場 | Supabase（PostgreSQL・Auth・Storage） |
| 公開 | Vercel |
| APK・PC アプリの置き場所 | GitHub Releases |

## フォルダの構成

```
app/
├── page.tsx                  アプリ一覧
├── apps/[id]/page.tsx        アプリ詳細
├── install/page.tsx          インストール方法
├── privacy/page.tsx          プライバシーポリシー
├── join/page.tsx             招待 URL からの投稿者登録
├── admin/                    管理ページ（ログイン・一覧・追加・編集・アカウント管理・変更の記録など）
└── api/keepalive/route.ts    データベースを止めないための定期アクセス
components/                   画面の部品
data/                         データベースから読む関数
lib/                          Supabase の接続・ログインの確認など
proxy.ts                      管理ページの入り口でログインを確かめる
```

## 手元で動かす

Node.js と、Supabase のプロジェクトが必要です。

1. 依存パッケージを入れる

   ```bash
   npm install
   ```

2. プロジェクトの一番上に `.env.local` を作り、Supabase の URL と publishable key を書く

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxx
   ```

   アカウント管理と招待を使うときは、Supabase の secret key も書く（GitHub には上げない）。本番の Vercel には、定期アクセス用の `CRON_SECRET` も設定する

   ```
   SUPABASE_SECRET_KEY=sb_secret_xxxx
   ```

3. `next.config.ts` の `images.remotePatterns` にある Supabase の URL を、自分のプロジェクトのものに書き換える

4. 開発用のサーバーを起動して、[http://localhost:3000](http://localhost:3000) を開く

   ```bash
   npm run dev
   ```

データベースの表・RLS・Storage の設定は、連載記事の中で順に紹介していきます。
