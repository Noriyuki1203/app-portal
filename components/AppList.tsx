"use client";

import { useState } from "react";
import AppCard from "./AppCard";
import type { AppInfo } from "@/data/apps";
import { PLATFORMS, PLATFORM_LABELS, type Platform } from "@/lib/platforms";

type Props = {
  apps: AppInfo[];
};

export default function AppList({ apps }: Props) {
  const [query, setQuery] = useState("");
  // 選んでいる種類。"all" は「すべて」
  const [platform, setPlatform] = useState<Platform | "all">("all");

  // 公開中のアプリがある種類だけ、ボタンを出す（拡張編 問12-3）
  const availablePlatforms = PLATFORMS.filter((p) => apps.some((app) => app.platform === p));

  const filteredApps = apps.filter(
    (app) =>
      (platform === "all" || app.platform === platform) &&
      (app.name.includes(query) || app.summary.includes(query))
  );

  const buttons: { value: Platform | "all"; label: string }[] = [
    { value: "all", label: "すべて" },
    ...availablePlatforms.map((p) => ({ value: p, label: PLATFORM_LABELS[p] })),
  ];

  return (
    <div>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="アプリを探す"
        className="mt-6 w-full rounded-lg border border-zinc-300 px-4 py-2"
      />
      {availablePlatforms.length > 1 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {buttons.map((b) => (
            <button
              key={b.value}
              type="button"
              onClick={() => setPlatform(b.value)}
              aria-pressed={platform === b.value}
              className={`rounded-full border px-4 py-1 text-sm ${
                platform === b.value
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-zinc-300 hover:bg-zinc-100"
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      )}
      {filteredApps.length === 0 ? (
        <p className="mt-6 text-zinc-500">見つかりませんでした</p>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {filteredApps.map((app) => (
            <li key={app.id}>
              <AppCard app={app} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
