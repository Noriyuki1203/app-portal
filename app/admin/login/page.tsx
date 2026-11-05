import type { Metadata } from "next";
import LoginForm from "@/components/LoginForm";

export const metadata: Metadata = {
    title: "ログイン｜アプリ配布サイト",
};

export default function LoginPage() {
    return (
        <main className="mx-auto max-w-sm p-8">
            <h1 className="text-2xl font-bold">
                管理者ログイン
            </h1>
            <LoginForm />
        </main>
    )
}