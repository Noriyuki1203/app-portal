// アカウントの入力ルール（登録ページと管理者ページで共通）

export const LOGIN_ID_PATTERN = /^[a-z0-9][a-z0-9_-]{2,29}$/;
export const LOGIN_ID_RULE =
  "ID は3〜30文字の半角の小文字・数字・ハイフン（-）・アンダーバー（_）にしてください（先頭は英数字）";

export const REAL_NAME_MAX = 50;
export const PASSWORD_MIN = 8;

// 本名を読む（前後の空白と、改行などの制御文字を除く）
export function readRealName(formData: FormData): { value: string } | { error: string } {
  const value = String(formData.get("real_name") ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim();
  if (!value) return { error: "本名を入れてください" };
  if (value.length > REAL_NAME_MAX) return { error: `本名は${REAL_NAME_MAX}文字以内にしてください` };
  return { value };
}

// 承認されるまでログインできないようにする期間（実質ずっと）。停止にも使う
export const BAN_FOREVER = "876000h";
