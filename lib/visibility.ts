// アプリの公開の範囲（apps.visibility 列）。ブラウザー側の部品からも使う
//   public  = 一般：だれでも見られる
//   limited = 限定：投稿者として登録している人（と管理者）が見られる
//   private = 非公開：作成者本人だけ（管理者は管理画面で見られる）
export const VISIBILITIES = ["public", "limited", "private"] as const;

export type Visibility = (typeof VISIBILITIES)[number];

export const VISIBILITY_LABELS: Record<Visibility, string> = {
  public: "一般",
  limited: "限定",
  private: "非公開",
};

export const VISIBILITY_DESCRIPTIONS: Record<Visibility, string> = {
  public: "だれでも見られる",
  limited: "投稿者として登録している人だけ（ログイン中に見られます）",
  private: "作成者のあなただけ（ログイン中に見られます）",
};

export function isVisibility(value: string): value is Visibility {
  return (VISIBILITIES as readonly string[]).includes(value);
}
