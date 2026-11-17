import Link from "next/link";
import Image from "next/image";
import type { AppInfo } from "@/data/apps";
import { ownerName } from "@/lib/owner";
import PlatformBadge from "./PlatformBadge";

type Props = {
  app: AppInfo;
};

export default function AppCard({ app }: Props) {
  return (
    <Link
      href={`/apps/${app.id}`}
      className="flex gap-4 rounded-lg border border-zinc-200 p-4"
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
      <div>
        <p className="font-semibold">{app.name}</p>
        <p className="text-sm text-zinc-600">{app.summary}</p>
        <div className="mt-2 flex items-center gap-2">
          <PlatformBadge platform={app.platform} />
          <span className="text-xs text-zinc-500">{app.version}</span>
        </div>
        <p className="mt-1 text-xs text-zinc-500">作成者：{ownerName(app)}</p>
      </div>
    </Link>
  );
}
