"use client";

import { useActionState, useTransition } from "react";
import {
  createPoster,
  resetPosterPassword,
  setPosterDisabled,
  type AccountState,
} from "@/app/admin/accounts/actions";

// 作ったばかりのパスワードを1回だけ見せる枠
function OneTimePassword({ loginId, password }: { loginId?: string; password: string }) {
  return (
    <div className="mt-3 rounded-lg border border-green-300 bg-green-50 p-4 text-sm">
      {loginId && (
        <p>
          ID：<code className="font-mono">{loginId}</code>
        </p>
      )}
      <p>
        パスワード：<code className="select-all font-mono">{password}</code>
      </p>
      <p className="mt-2 text-zinc-600">
        この画面を離れると二度と表示されません。本人だけに伝わる方法で渡し、最初のログイン後に「パスワード変更」で変えてもらってください。
      </p>
    </div>
  );
}

export function CreatePosterForm() {
  const [state, formAction, isPending] = useActionState<AccountState, FormData>(createPoster, { error: "" });

  return (
    <form action={formAction} className="mt-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="block">
          <span className="text-sm text-zinc-600">ログインID（半角の小文字・数字・- _）</span>
          <input
            name="login_id"
            required
            minLength={3}
            maxLength={30}
            pattern="[a-z0-9][a-z0-9_\-]{2,29}"
            placeholder="tanaka"
            className="mt-1 block rounded-lg border border-zinc-300 px-4 py-2"
          />
        </label>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-semibold text-white hover:bg-zinc-700 disabled:opacity-50"
        >
          {isPending ? "作成中…" : "投稿者を作る"}
        </button>
      </div>
      <p className="mt-2 text-sm text-zinc-500">
        パスワードは自動で作られます。表示名は本人がログイン後に付けます。
      </p>
      {state.error && <p className="mt-2 text-sm text-red-600">{state.error}</p>}
      {state.password && <OneTimePassword loginId={state.loginId} password={state.password} />}
    </form>
  );
}

export function PosterActions({ userId, disabled }: { userId: string; disabled: boolean }) {
  const [isToggling, startToggle] = useTransition();
  const [resetState, resetAction, isResetting] = useActionState<AccountState>(
    resetPosterPassword.bind(null, userId),
    { error: "" }
  );

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        <button
          type="button"
          disabled={isToggling}
          onClick={() => startToggle(() => setPosterDisabled(userId, !disabled))}
          className={`rounded-full border px-3 py-1 text-xs disabled:opacity-50 ${
            disabled ? "border-zinc-300 hover:bg-zinc-100" : "border-red-300 text-red-600 hover:bg-red-50"
          }`}
        >
          {isToggling ? "変更中…" : disabled ? "再開する" : "停止する"}
        </button>
        <form action={resetAction}>
          <button
            type="submit"
            disabled={isResetting || disabled}
            className="rounded-full border border-zinc-300 px-3 py-1 text-xs hover:bg-zinc-100 disabled:opacity-50"
          >
            {isResetting ? "再設定中…" : "パスワード再設定"}
          </button>
        </form>
      </div>
      {resetState.error && <p className="text-xs text-red-600">{resetState.error}</p>}
      {resetState.password && <OneTimePassword password={resetState.password} />}
    </div>
  );
}
