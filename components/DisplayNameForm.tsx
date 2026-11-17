"use client";

import { useActionState } from "react";
import { updateDisplayName } from "@/app/admin/actions";
import { DISPLAY_NAME_MAX, UNSET_NAME } from "@/lib/owner";

type Props = {
  current: string;
};

export default function DisplayNameForm({ current }: Props) {
  const [state, formAction, isPending] = useActionState(updateDisplayName, { error: "" });

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <label className="block">
        <span className="text-sm text-zinc-600">表示名（{DISPLAY_NAME_MAX}文字まで）</span>
        <input
          name="display_name"
          required
          maxLength={DISPLAY_NAME_MAX}
          defaultValue={current === UNSET_NAME ? "" : current}
          placeholder="例：たろう"
          className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2"
        />
      </label>
      <p className="text-sm text-zinc-500">
        あなたが追加したアプリの「作成者」として、サイトでだれでも見られます。本名でなくても構いません。ログインIDやパスワードは入れないでください。
      </p>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.message && <p className="text-sm text-green-700">{state.message}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-full bg-zinc-900 px-6 py-3 font-semibold text-white hover:bg-zinc-700 disabled:opacity-50"
      >
        {isPending ? "保存中…" : "保存する"}
      </button>
    </form>
  );
}
