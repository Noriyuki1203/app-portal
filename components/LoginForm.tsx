"use client";

import { useActionState } from "react";
import { login } from "@/app/admin/actions";

export default function LoginForm() {
    const [state, formAction, isPending] =
        useActionState(login, { error: "" });

    return (
        <form action={formAction} className="mt-6 space-y-4">
            <label className="block">
                <span className="text-sm text-zinc-600">ID</span>
                <input name="id"
                    required
                    autoComplete="username"
                    className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2"
                />
            </label>
            <label className="block">
                <span className="text-sm text-zinc-600">パスワード</span>
                <input
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2"
                />
            </label>
            {state.error && <p className="text-sm text-red-600">{state.error}</p>}
            <button type="submit" disabled={isPending} className="w-full rounded-full bg-zinc-900 px-6 py-3 font-semibold text-white hover:bg-zinc-700 disabled:opacity-50">
                {isPending ? "ログイン中..." : "ログイン"}
            </button>
        </form>
    );
}