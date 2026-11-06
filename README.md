# app-portal

自作の Android アプリを紹介・配布するための個人サイトです。

Google Play の「テスター12人・14日間」のクローズドテストを満たせなかったため、配布サイトを自分で作っています。作る過程は Qiita で連載しています。

> **作成中です。** サイトは、APK を配布できる段階になってから公開する予定です。

## 連載記事（Qiita）

1. 構想編：なぜ自分で配布サイトを作るのか（公開後にリンクを追加）

## 主な機能

**利用者向け**

- アプリ一覧（検索つき）
- アプリ詳細（説明・スクリーンショット・バージョン・対応 OS・ダウンロードボタン）
- インストール方法
- プライバシーポリシー

**管理者向け（ログインが必要）**

- アプリの追加・更新・削除、公開／非公開の切り替え
- アイコンとスクリーンショットのアップロード、並べ替え
- パスワードの変更

## しくみ

```
 利用者 ──見る──▶ サイト（Next.js / Vercel）
                     │
                     ├─ アプリ情報を読む ──▶ データベース（Supabase）
                     │
                     └─ ダウンロード ──▶ APK（GitHub Releases）

 管理者 ──ログイン──▶ 管理者ページ ──追加・更新・削除──▶ データベース
```

- APK は配布専用の公開リポジトリの GitHub Releases に置き、データベースには URL だけを登録します
- アイコンやスクリーンショットは Supabase Storage に置きます
- 「利用者は公開中のアプリを見るだけ、管理者は書き換えられる」という制限は、Supabase の RLS（行ごとの権限設定）でデータベース側に設定しています

## 使っている技術

| 役割 | 技術 |
|---|---|
| 画面 | Next.js 16（App Router・Cache Components）、React 19、TypeScript、Tailwind CSS 4 |
| データベース・ログイン・画像置き場 | Supabase（PostgreSQL・Auth・Storage） |
| 公開 | Vercel |
| APK の置き場所 | GitHub Releases |

## フォルダの構成

```
app/
├── page.tsx                  アプリ一覧
├── apps/[id]/page.tsx        アプリ詳細
├── install/page.tsx          インストール方法
├── privacy/page.tsx          プライバシーポリシー
└── admin/                    管理者ページ（ログイン・一覧・追加・編集・パスワード変更）
components/                   画面の部品
data/                         データベースから読む関数
lib/                          Supabase の接続・ログインの確認など
proxy.ts                      管理者ページの入り口でログインを確かめる
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

3. `next.config.ts` の `images.remotePatterns` にある Supabase の URL を、自分のプロジェクトのものに書き換える

4. 開発用のサーバーを起動して、[http://localhost:3000](http://localhost:3000) を開く

   ```bash
   npm run dev
   ```

データベースの表・RLS・Storage の設定は、連載記事の中で順に紹介していきます。
