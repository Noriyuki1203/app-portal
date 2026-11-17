// 作成者の表示名（profiles 表）まわり。ブラウザー側の部品からも使うので、サーバー専用のものは読み込まない

export const DISPLAY_NAME_MAX = 30;
export const UNSET_NAME = "未設定";

// 作成者の表示名。まだ付けていない人や、作成者が分からないアプリは「未設定」
export function ownerName(app: { owner?: { display_name: string } | null }): string {
  return app.owner?.display_name?.trim() || UNSET_NAME;
}
