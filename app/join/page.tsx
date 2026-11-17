import { Suspense } from "react";
import type { Metadata } from "next";
import { isValidInviteCode } from "@/data/invite";
import JoinForm from "@/components/JoinForm";
import { registerPoster } from "./actions";

export const metadata: Metadata = {
  title: "投稿者の登録 | アプリ配布サイト",
  robots: { index: false, follow: false },
};

export default function JoinPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <main className="mx-auto max-w-sm p-8">
      <h1 className="text-2xl font-bold">投稿者の登録</h1>
      <Suspense fallback={<p className="mt-4 text-zinc-500">読み込み中…</p>}>
        <JoinContent searchParams={props.searchParams} />
      </Suspense>
    </main>
  );
}

async function JoinContent({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = (await searchParams).code;
  const code = typeof raw === "string" ? raw : "";

  if (!(await isValidInviteCode(code))) {
    return (
      <p className="mt-4 text-zinc-600">
        この招待URLは使えません。URLが正しいか確かめるか、管理者に新しいURLをもらってください。
      </p>
    );
  }

  return (
    <>
      <p className="mt-4 text-sm text-zinc-600">
        登録すると、管理者が承認したあとでログインしてアプリを投稿できるようになります。
      </p>
      <JoinForm action={registerPoster.bind(null, code)} />
    </>
  );
}
