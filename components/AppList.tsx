"use client";

import { useState } from "react";
import AppCard from "./AppCard";
import type { AppInfo } from "@/data/apps";

type Props = {
  apps: AppInfo[];
};

export default function AppList({ apps }: Props) {
  const [query, setQuery] = useState("");

  const filteredApps = apps.filter(
    (app) => app.name.includes(query) || app.summary.includes(query)
  );

  return (
    <div>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="アプリを探す"
        className="mt-6 w-full rounded-lg border border-zinc-300 px-4 py-2"
      />
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
