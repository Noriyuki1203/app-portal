"use client";

import { useState } from "react";
import AppCard from "./AppCard";
import type { AppInfo } from "@/data/apps";
import { PLATFORMS, PLATFORM_LABELS, type Platform } from "@/lib/platforms";
import { ownerName } from "@/lib/owner";

type Props = {
  apps: AppInfo[];
};

type SortKey = "updated" | "owner" | "name";

const SORT_LABELS: Record<SortKey, string> = {
  updated: "更新が新しい順",
  owner: "作成者順",
  name: "アプリ名順",
};

// 作成者の区別には owner_id を使う（同じ表示名の人がいても混ざらないように）
const ownerKey = (app: AppInfo) => app.owner_id ?? "none";

function FilterButtons<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2" role="group" aria-label={label}>
      <span className="text-sm text-zinc-500">{label}</span>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={`rounded-full border px-4 py-1 text-sm ${
            value === o.value
              ? "border-zinc-900 bg-zinc-900 text-white"
              : "border-zinc-300 hover:bg-zinc-100"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function AppList({ apps }: Props) {
  const [query, setQuery] = useState("");
  // 選んでいる種類・作成者。"all" は「すべて」
  const [platform, setPlatform] = useState<Platform | "all">("all");
  const [owner, setOwner] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("updated");

  // 公開中のアプリがある種類だけ、ボタンを出す（拡張編 問12-3）
  const availablePlatforms = PLATFORMS.filter((p) => apps.some((app) => app.platform === p));

  // 公開中のアプリがある作成者（表示名の順）
  const owners = [...new Map(apps.map((app) => [ownerKey(app), ownerName(app)])).entries()]
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label, "ja"));

  const keyword = query.trim().toLowerCase();
  const filteredApps = apps
    .filter(
      (app) =>
        (platform === "all" || app.platform === platform) &&
        (owner === "all" || ownerKey(app) === owner) &&
        (keyword === "" ||
          app.name.toLowerCase().includes(keyword) ||
          app.summary.toLowerCase().includes(keyword) ||
          ownerName(app).toLowerCase().includes(keyword))
    )
    .sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name, "ja");
      if (sort === "owner") {
        const byOwner = ownerName(a).localeCompare(ownerName(b), "ja");
        if (byOwner !== 0) return byOwner;
      }
      // 「更新が新しい順」と、同じ作成者の中の並び
      return b.updated_at.localeCompare(a.updated_at);
    });

  return (
    <div>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="アプリ名・説明・作成者で探す"
        className="mt-6 w-full rounded-lg border border-zinc-300 px-4 py-2"
      />
      {availablePlatforms.length > 1 && (
        <FilterButtons
          label="種類"
          value={platform}
          onChange={setPlatform}
          options={[
            { value: "all", label: "すべて" },
            ...availablePlatforms.map((p) => ({ value: p, label: PLATFORM_LABELS[p] })),
          ]}
        />
      )}
      {owners.length > 1 && (
        <FilterButtons
          label="作成者"
          value={owner}
          onChange={setOwner}
          options={[{ value: "all", label: "すべて" }, ...owners]}
        />
      )}
      <div className="mt-4 flex items-center justify-between gap-4">
        <p className="text-sm text-zinc-500">{filteredApps.length}件</p>
        <label className="flex items-center gap-2 text-sm text-zinc-500">
          並び順
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-lg border border-zinc-300 px-2 py-1 text-zinc-900"
          >
            {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
              <option key={key} value={key}>
                {SORT_LABELS[key]}
              </option>
            ))}
          </select>
        </label>
      </div>
      {filteredApps.length === 0 ? (
        <p className="mt-6 text-zinc-500">見つかりませんでした</p>
      ) : (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
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
