import type { Metadata } from "next";
import { logout } from "../actions";

export const metadata: Metadata = {
  title: "利用できません | アプリ配布サイト",
};

// ログインはできたが、停止中・権限なしのアカウントが来るページ
export default function DeniedPage() {
  return (
    <main className="mx-auto max-w-sm p-8">
      <h1 className="text-2xl font-bold">利用できません</h1>
      <p className="mt-4 text-zinc-600">
        このアカウントは現在使えません（停止中か、権限がありません）。管理者に問い合わせてください。
      </p>
      <form action={logout} className="mt-6">
        <button
          type="submit"
          className="rounded-full border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-100"
        >
          ログアウト
        </button>
      </form>
    </main>
  );
}
