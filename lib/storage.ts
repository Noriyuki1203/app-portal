// 画像を置く Storage のバケット（入れ物）の名前
export const BUCKET = "app-images";

// 公開URL から、バケットの中の場所（例：sample-todo/icon-123.png）を取り出す
// Storage の画像でなければ null（public/screenshots/ の画像など）
export function pathFromPublicUrl(url: string): string | null {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const index = url.indexOf(marker);
  return index === -1 ? null : url.slice(index + marker.length);
}

// ファイル名の最後の「png」などを取り出す。取り出せなければ png にする
export function extensionOf(file: File): string {
  const ext = file.name.split(".").pop()?.toLowerCase();
  return ext && /^[a-z0-9]+$/.test(ext) ? ext : "png";
}
