import Link from "next/link";
import Image from "next/image";
import type { AppInfo } from "@/data/apps";
import { ownerName } from "@/lib/owner";
import PlatformBadge from "./PlatformBadge";
import LimitedBadge from "./LimitedBadge";

type Props = {
  app: AppInfo;
};

export default function AppCard({ app }: Props) {
  return (
    <Link
      href={`/apps/${app.id}`}
      className="flex h-full gap-4 rounded-lg border border-zinc-200 p-4"
    >
      {app.icon_url ? (
        <Image
          src={app.icon_url}
          alt=""
          width={64}
          height={64}
          className="h-16 w-16 shrink-0 rounded-xl"
        />
      ) : (
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-zinc-200 text-2xl font-bold text-zinc-600">
          {app.name[0]}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold" title={app.name}>
          {app.name}
        </p>
        {/* 説明は2行まで。あふれたら「…」にし、短くても2行分の高さを確保してカードをそろえる */}
        <p
          className="line-clamp-2 min-h-10 break-words text-sm text-zinc-600"
          title={app.summary}
        >
          {app.summary}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <PlatformBadge platform={app.platform} />
          <LimitedBadge visibility={app.visibility} />
          <span className="text-xs text-zinc-500">{app.version}</span>
        </div>
        <p className="mt-1 text-xs text-zinc-500">作成者：{ownerName(app)}</p>
      </div>
    </Link>
  );
}
