"use client";

import { useActionState } from "react";
import { changePassword } from "@/app/admin/actions";

const inputClass = "mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2";

export default function PasswordForm() {
  const [state, formAction, isPending] = useActionState(changePassword, { error: "" });

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <label className="block">
        <span className="text-sm text-zinc-600">今のパスワード</span>
        <input
          name="current"
          type="password"
          required
          autoComplete="current-password"
          className={inputClass}
        />
      </label>
      <label className="block">
        <span className="text-sm text-zinc-600">新しいパスワード（8文字以上）</span>
        <input
          name="next"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={inputClass}
        />
      </label>
      <label className="block">
        <span className="text-sm text-zinc-600">新しいパスワード（確認のため、もう一度）</span>
        <input
          name="confirm"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={inputClass}
        />
      </label>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.message && <p className="text-sm text-green-700">{state.message}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-full bg-zinc-900 px-6 py-3 font-semibold text-white hover:bg-zinc-700 disabled:opacity-50"
      >
        {isPending ? "変更中…" : "変更する"}
      </button>
    </form>
  );
}
