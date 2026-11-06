"use client";

type Props = {
    action: () => Promise<void>;
    appName: string;
};

export default function DeleteAppButton({ action, appName }: Props) {
    return (
        <form
            action={action}
            onSubmit={(e) => {
                // 「キャンセル」を押したら、送信を止める
                if (!confirm(`「${appName}」を削除します。元に戻せません。よろしいですか？`)) {
                    e.preventDefault();
                }
            }}
        >
            <button
                type="submit"
                className="rounded-full border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
                このアプリを削除する
            </button>
        </form>
    );
}