import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-zinc-200">
      <div className="mx-auto flex max-w-3xl items-center justify-between p-4">
        <Link href="/" className="text-lg font-bold">
          アプリ配布サイト
        </Link>
        <nav>
          <Link href="/install" className="text-sm text-zinc-900">
            インストール方法
          </Link>
        </nav>
      </div>
    </header>
  );
}
