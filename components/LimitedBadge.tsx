import { VISIBILITY_LABELS, type Visibility } from "@/lib/visibility";

const STYLES: Record<Exclude<Visibility, "public">, { className: string; title: string }> = {
  limited: {
    className: "bg-amber-100 text-amber-800",
    title: "限定：投稿者として登録している人にだけ表示されています",
  },
  private: {
    className: "bg-zinc-200 text-zinc-700",
    title: "非公開：作成者のあなたにだけ表示されています",
  },
};

// 一般以外のアプリに付ける札（一般のときは何も出さない）
export default function LimitedBadge({ visibility }: { visibility: Visibility }) {
  if (visibility === "public") return null;
  const style = STYLES[visibility];
  return (
    <span
      title={style.title}
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${style.className}`}
    >
      {VISIBILITY_LABELS[visibility]}
    </span>
  );
}
