"use client";

import { useActionState, useState, useSyncExternalStore, useTransition } from "react";
import {
  approvePoster,
  deletePoster,
  rejectPoster,
  renewInviteUrl,
  resetPosterPassword,
  setPosterDisabled,
  updateRealName,
  type AccountState,
} from "@/app/admin/accounts/actions";

// 本名の表示と変更（一覧の行の中で使う）
export function RealNameForm({
  userId,
  realName,
}: {
  userId: string;
  realName: string;
}) {
  const [state, formAction, isPending] = useActionState<AccountState, FormData>(
    updateRealName.bind(null, userId),
    { error: "" },
  );

  return (
    <div>
      <p className={realName ? "" : "text-zinc-400"}>{realName || "未登録"}</p>
      <details className="mt-1" open={Boolean(state.error)}>
        <summary className="cursor-pointer text-xs text-blue-600">変更</summary>
        <form action={formAction} className="mt-1">
          <div className="flex items-center gap-1">
            <input
              name="real_name"
              required
              maxLength={50}
              defaultValue={realName}
              placeholder="本名（未登録）"
              aria-label="本名"
              className="w-36 rounded border border-zinc-300 px-2 py-0.5 text-xs"
            />
            <button
              type="submit"
              disabled={isPending}
              className="rounded border border-zinc-300 px-2 py-0.5 text-xs hover:bg-zinc-100 disabled:opacity-50"
            >
              {isPending ? "…" : "変更"}
            </button>
          </div>
          {state.error && <p className="text-xs text-red-600">{state.error}</p>}
        </form>
      </details>
      {state.message && (
        <p className="text-xs text-green-700">{state.message}</p>
      )}
    </div>
  );
}

// 作ったばかりのパスワードを1回だけ見せる枠
function OneTimePassword({ password }: { password: string }) {
  return (
    <div className="mt-3 rounded-lg border border-green-300 bg-green-50 p-4 text-sm">
      <p>
        パスワード：<code className="select-all font-mono">{password}</code>
      </p>
      <p className="mt-2 text-zinc-600">
        この画面を離れると二度と表示されません。本人だけに伝わる方法で渡し、最初のログイン後に「パスワード変更」で変えてもらってください。
      </p>
    </div>
  );
}

// 招待URL（コピーボタンつき）。URLを知っている人だけが登録ページを開ける
export function InviteUrlBox({ code }: { code: string }) {
  // サイトのアドレス（ブラウザーで表示したときだけ分かる）
  const origin = useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => "",
  );
  const [copied, setCopied] = useState(false);
  const [isRenewing, startRenew] = useTransition();
  const url = `${origin}/join?code=${code}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  function renew() {
    if (!window.confirm("招待URLを作り直しますか？今までのURLは使えなくなります。")) return;
    startRenew(() => renewInviteUrl());
  }

  return (
    <div className="mt-4">
      <div className="flex flex-wrap items-center gap-2">
        <input
          readOnly
          value={origin ? url : "読み込み中…"}
          aria-label="招待URL"
          onFocus={(e) => e.currentTarget.select()}
          className="min-w-0 flex-1 rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 font-mono text-xs"
        />
        <button
          type="button"
          onClick={copy}
          disabled={!origin}
          className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-semibold text-white hover:bg-zinc-700 disabled:opacity-50"
        >
          {copied ? "コピーしました" : "URLをコピー"}
        </button>
      </div>
      <p className="mt-2 text-sm text-zinc-500">
        このURLを投稿してほしい人に送ってください。本人が ID・本名・パスワードを登録すると、下の「承認待ち」に出ます。承認するまでログインできません。
      </p>
      <button
        type="button"
        onClick={renew}
        disabled={isRenewing}
        className="mt-2 text-xs text-red-600 hover:underline disabled:opacity-50"
      >
        {isRenewing ? "作り直し中…" : "URLを作り直す（URLが関係ない人に広まったとき）"}
      </button>
    </div>
  );
}

// 承認待ちの行の「承認」「却下」ボタン
export function PendingActions({ userId, loginId }: { userId: string; loginId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function run(action: () => Promise<void>) {
    setError("");
    startTransition(async () => {
      try {
        await action();
      } catch {
        setError("うまくいきませんでした。画面を読み込み直して、もう一度試してください");
      }
    });
  }

  function reject() {
    if (!window.confirm(`「${loginId}」の登録を却下して削除しますか？元には戻せません。`)) return;
    run(() => rejectPoster(userId));
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() => run(() => approvePoster(userId))}
          className="rounded-full bg-green-700 px-4 py-1 text-xs font-semibold text-white hover:bg-green-600 disabled:opacity-50"
        >
          {isPending ? "処理中…" : "承認する"}
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={reject}
          className="rounded-full border border-red-300 px-3 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          却下
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function PosterActions({
  userId,
  loginId,
  disabled,
  appCount,
}: {
  userId: string;
  loginId: string;
  disabled: boolean;
  appCount: number;
}) {
  const [isToggling, startToggle] = useTransition();
  const [isDeleting, startDelete] = useTransition();
  const [deleteError, setDeleteError] = useState("");

  function remove() {
    const apps =
      appCount > 0
        ? `\nこの人のアプリ${appCount}件は削除されず、あなたが作成者として引き継ぎます。`
        : "";
    if (!window.confirm(`「${loginId}」のアカウントを削除しますか？元には戻せません。${apps}`)) return;
    setDeleteError("");
    startDelete(async () => {
      try {
        await deletePoster(userId);
      } catch {
        setDeleteError("削除できませんでした。画面を読み込み直して、もう一度試してください");
      }
    });
  }
  const [resetState, resetAction, isResetting] = useActionState<AccountState>(
    resetPosterPassword.bind(null, userId),
    { error: "" },
  );

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        <button
          type="button"
          disabled={isToggling}
          onClick={() =>
            startToggle(() => setPosterDisabled(userId, !disabled))
          }
          className={`rounded-full border px-3 py-1 text-xs disabled:opacity-50 ${
            disabled
              ? "border-zinc-300 hover:bg-zinc-100"
              : "border-red-300 text-red-600 hover:bg-red-50"
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
        {disabled && (
          <button
            type="button"
            disabled={isDeleting}
            onClick={remove}
            className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-500 disabled:opacity-50"
          >
            {isDeleting ? "削除中…" : "削除"}
          </button>
        )}
      </div>
      {deleteError && <p className="text-xs text-red-600">{deleteError}</p>}
      {resetState.error && (
        <p className="text-xs text-red-600">{resetState.error}</p>
      )}
      {resetState.password && (
        <OneTimePassword password={resetState.password} />
      )}
    </div>
  );
}
