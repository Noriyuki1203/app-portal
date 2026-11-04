export type AppInfo = {
  id: string;
  name: string;
  summary: string;
  description: string;
  icon_url: string;
  version: string;
  min_os: string;
  download_url: string;
  is_published: boolean;
  updated_at: string;
  owner_id: string;
};

// アプリ1件の形（仕様書 6-3 の apps 表に合わせる）
export function getPublishedApps():AppInfo[]{
    return apps.filter((app)=>app.is_published);
}

export function getAppById(id:string):AppInfo | undefined{
    return getPublishedApps().find((app)=>app.id ===id);
}

// ダミーのアプリ（あとで Supabase に差し替える）
export const apps: AppInfo[] = [
  {
    id: "sample-todo",
    name: "サンプルToDo",
    summary: "やることを記録するアプリ",
    description: "やることを書き留めて、終わったらチェックを付けられるシンプルなアプリです。",
    icon_url: "",
    version: "1.0.0",
    min_os: "Android 8.0以上",
    download_url: "https://github.com/Noriyuki1203/app-portal-releases/releases/download/sample-todo-v1.0.0/sample-todo.apk",
    is_published: true,
    updated_at: "2026-11-01",
    owner_id: "admin",
  },
  {
    id: "sample-timer",
    name: "サンプルタイマー",
    summary: "勉強時間をはかるタイマー",
    description: "25分の作業と5分の休憩をくり返して、集中する時間をつくるアプリです。",
    icon_url: "",
    version: "0.9.0",
    min_os: "Android 9.0以上",
    download_url: "https://github.com/Noriyuki1203/app-portal-releases/releases/download/sample-timer-v0.9.0/sample-timer.apk",
    is_published: true,
    updated_at: "2026-10-20",
    owner_id: "admin",
  },
  {
    id: "sample-memo",
    name: "サンプルメモ（非公開）",
    summary: "まだ公開していないメモアプリ",
    description: "公開前のアプリの例です。一覧には出さない予定です。",
    icon_url: "",
    version: "0.1.0",
    min_os: "Android 8.0以上",
    download_url: "",
    is_published: false,
    updated_at: "2026-10-15",
    owner_id: "admin",
  },
];
