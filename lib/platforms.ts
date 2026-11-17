// アプリの種類（拡張編 第11章）
// DB の apps.platform の check と、同じ4つにそろえる

export type Platform = "android" | "windows" | "mac" | "web";

// 並べる順番（絞り込みのボタン・管理者ページの選択肢）
export const PLATFORMS: Platform[] = ["android", "windows", "mac", "web"];

// 表示名。Record<Platform, string> にしておくと、1つでも書き忘れると型のエラーになる
export const PLATFORM_LABELS: Record<Platform, string> = {
  android: "Android",
  windows: "Windows",
  mac: "Mac",
  web: "Web",
};

// バッジの色（Tailwind のクラス）
export const PLATFORM_BADGE_CLASSES: Record<Platform, string> = {
  android: "bg-green-100 text-green-800",
  windows: "bg-sky-100 text-sky-800",
  mac: "bg-zinc-200 text-zinc-800",
  web: "bg-amber-100 text-amber-800",
};

// 「ストアで入手」ボタンに出すストアの名前（apps.store_url があるときだけ使う）
export const STORE_LABELS: Record<Platform, string> = {
  android: "Google Play",
  windows: "Microsoft Store",
  mac: "Mac App Store",
  web: "ストア",
};

// インストール方法のページにタブがある種類（Web はインストール不要）
export const INSTALLABLE_PLATFORMS: Platform[] = ["android", "windows", "mac"];

// フォームなどから届いた文字が、4つの種類のどれかか確かめる
export function isPlatform(value: unknown): value is Platform {
  return typeof value === "string" && (PLATFORMS as string[]).includes(value);
}
