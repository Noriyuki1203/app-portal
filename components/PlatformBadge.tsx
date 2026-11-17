import { PLATFORM_BADGE_CLASSES, PLATFORM_LABELS, type Platform } from "@/lib/platforms";

type Props = {
  platform: Platform;
};

// アプリの種類を表す小さな札（拡張編 問12-1）
export default function PlatformBadge({ platform }: Props) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${PLATFORM_BADGE_CLASSES[platform]}`}
    >
      {PLATFORM_LABELS[platform]}
    </span>
  );
}
