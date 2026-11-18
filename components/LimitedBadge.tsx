// 限定公開のアプリに付ける札（作成者本人にしか見えないアプリ）
export default function LimitedBadge() {
  return (
    <span
      title="限定：作成者のあなたにだけ表示されています"
      className="inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800"
    >
      限定
    </span>
  );
}
