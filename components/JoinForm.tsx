"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { JoinState } from "@/app/join/actions";

const inputClass = "mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2";

export default function JoinForm({
  action,
}: {
  action: (prev: JoinState, formData: FormData) => Promise<JoinState>;
}) {
  const [state, formAction, isPending] = useActionState(action, { error: "" });

  if (state.done) {
    return (
      <div className="mt-6 rounded-lg border border-green-300 bg-green-50 p-4 text-sm">
        <p className="font-semibold">登録しました。</p>
        <p className="mt-2">
          管理者が承認すると、
          <Link href="/admin/login" className="text-blue-600 hover:underline">
            ログインページ
          </Link>
          から、いま決めた ID とパスワードでログインできるようになります。承認されたら管理者から連絡があります。
        </p>
      </div>
    );
  }

  return (
    <form key={state.attempt ?? 0} action={formAction} className="mt-6 space-y-4">
      <label className="block">
        <span className="text-sm text-zinc-600">ログインID（半角の小文字・数字・- _、3〜30文字）</span>
        <input
          name="login_id"
          required
          minLength={3}
          maxLength={30}
          pattern="[a-z0-9][a-z0-9_\-]{2,29}"
          autoComplete="username"
          defaultValue={state.values?.login_id}
          placeholder="tanaka"
          className={inputClass}
        />
      </label>
      <label className="block">
        <span className="text-sm text-zinc-600">本名（管理者だけが見られます。サイトには出ません）</span>
        <input
          name="real_name"
          required
          maxLength={50}
          autoComplete="name"
          defaultValue={state.values?.real_name}
          placeholder="田中 太郎"
          className={inputClass}
        />
      </label>
      <label className="block">
        <span className="text-sm text-zinc-600">パスワード（8文字以上）</span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={inputClass}
        />
      </label>
      <label className="block">
        <span className="text-sm text-zinc-600">パスワード（確認のためもう一度）</span>
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
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-full bg-zinc-900 px-6 py-3 font-semibold text-white hover:bg-zinc-700 disabled:opacity-50"
      >
        {isPending ? "登録中…" : "登録する"}
      </button>
      <p className="text-xs text-zinc-500">
        サイトに作成者として出る「表示名」は、承認後にログインしてから決められます。
      </p>
    </form>
  );
}
