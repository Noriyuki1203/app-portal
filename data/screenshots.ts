// スクリーンショット1枚の形（仕様書 6-3 の screenshots 表に合わせる）
export type Screenshot = {
  id: number;
  app_id: string;
  image_url: string;
  sort_order: number;
};

// ダミーの画像（あとで Supabase に差し替える）
export const screenshots: Screenshot[] = [
  { id: 1, app_id: "sample-todo", image_url: "/screenshots/Screenshot_20261104-170102.png", sort_order: 2 },
  { id: 2, app_id: "sample-todo", image_url: "/screenshots/Screenshot_20261104-170109.png", sort_order: 1 },
  { id: 3, app_id: "sample-todo", image_url: "/screenshots/Screenshot_20261104-170118.png", sort_order: 3 },
];

export function getScreenshotsByAppId(appId: string): Screenshot[] {
  return screenshots
    .filter((s) => s.app_id === appId)
    .sort((a, b) => a.sort_order - b.sort_order);
}
