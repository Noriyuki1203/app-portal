"use client";

import { useActionState } from "react";
import type { FormState } from "@/app/admin/apps/actions";

type Props = {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
  buttonLabel: string;
};

// 画像を1枚選んで送るフォーム（アイコンとスクリーンショットで共通）
export default function ImageUploadForm({ action, buttonLabel }: Props) {
  const [state, formAction, isPending] = useActionState(action, { error: "" });

  return (
    <form action={formAction} className="mt-3 flex flex-wrap items-center gap-3">
      <input name="file" type="file" accept="image/*" required className="text-sm" />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-full border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-100 disabled:opacity-50"
      >
        {isPending ? "アップロード中…" : buttonLabel}
      </button>
      {state.error && <p className="w-full text-sm text-red-600">{state.error}</p>}
      {state.message && <p className="w-full text-sm text-green-700">{state.message}</p>}
    </form>
  );
}
