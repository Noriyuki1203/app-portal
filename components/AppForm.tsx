"use client";

import { act, useActionState } from "react";
import type { AppInfo } from "@/data/apps";
import type { FormState } from "@/app/admin/apps/actions";

type Props = {
    action: (prevState: FormState, formData: FormData) =>
        Promise<FormState>;
    app?: AppInfo; //更新の時だけ渡す。追加の時は空
};

const inputClass = "mt-1 w-full rounded-lg border border-zing-300 px-4 py-2";

export default function AppForm({ action, app }: Props) {
    const [state, formAction, isPending] = useActionState(action, { error: "" });

    return (
        <form action={formAction} className="mt-6 space-y-4">
            <label className="block">
                <span className="text-sm text-zinc-600">
                    ID(URLに使用する。後からは変えられません)
                </span>
                {app ? (
                    <p className="mt-1 px-4 py-2 text-zinc-500">
                        {app.id}
                    </p>
                ) : (
                    <input
                        name="id"
                        required
                        pattern="[a-z0-9/-]+"
                        placeholder="sample-todo"
                        className={inputClass}
                    />
                )}
            </label>
            <label className="block">
                <span className="text-sm text-zinc-600">アプリ名</span>
                <input name="name" required defaultValue={app?.name} className={inputClass} />
            </label>
            <label className="block">
                <span className="text-sm text-zinc-600">ひとこと説明（一覧に出る）</span>
                <input name="summary" defaultValue={app?.summary} className={inputClass} />
            </label>
            <label className="block">
                <span className="text-sm text-zinc-600">くわしい説明</span>
                <textarea
                    name="description"
                    rows={5}
                    defaultValue={app?.description}
                    className={inputClass}
                />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                    <span className="text-sm text-zinc-600">バージョン</span>
                    <input name="version" defaultValue={app?.version} placeholder="1.0.0" className={inputClass} />
                </label>
                <label className="block">
                    <span className="text-sm text-zinc-600">対応OS</span>
                    <input
                        name="min_os"
                        defaultValue={app?.min_os}
                        placeholder="Android 8.0以上"
                        className={inputClass}
                    />
                </label>
            </div>
            <label className="block">
                <span className="text-sm text-zinc-600">ダウンロードURL（APK）</span>
                <input
                    name="download_url"
                    type="url"
                    defaultValue={app?.download_url}
                    className={inputClass}
                />
            </label>
            <label className="flex items-center gap-2">
                <input name="is_published" type="checkbox" defaultChecked={app?.is_published} />
                <span>公開する</span>
            </label>
            {state.error && <p className="text-sm text-red-600">{state.error}</p>}
            {state.message && <p className="text-sm text-green-700">{state.message}</p>}

            <button
                type="submit"
                disabled={isPending}
                className="rounded-full bg-zinc-900 px-6 py-3 font-semibold text-white hover:bg-zinc-700 disabled:opacity-50"
            >
                {isPending ? "保存中…" : app ? "保存する" : "追加する"}
            </button>
        </form>
    );
}