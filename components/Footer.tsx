import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200">
      <div className="mx-auto flex max-w-3xl items-center justify-between p-4 text-sm text-zinc-500">
        <Link href="/privacy" className="hover:text-zinc-900">
          プライバシーポリシー
        </Link>
        <p>© 2026 アプリ配布サイト</p>
      </div>
    </footer>
  );
}
