import Link from "next/link"
import type { AppInfo } from "@/data/apps";

type Props = {
    app: AppInfo;
};

export default function AppCard({ app }: Props) {
    return (
        <Link 
            href={`/apps/${app.id}`}
        className="flex gap-4 rounded-lg border border-zinc-200 p-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl
             bg-zinc-200 text-2xl font-bold text-zinc-600">
                {app.name[0]}
            </div>
            <div>
                <p className="font-semibold">{app.name}</p>
                <p className="font-sm text-zinc-600">{app.summary}</p>
                <p className="mt-2 text-xs text-zinc-500">{app.version}</p>
            </div>
        </Link>
    )
}