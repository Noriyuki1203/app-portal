import "server-only";
import { randomBytes, timingSafeEqual } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

// 招待URLの合言葉（invite_codes 表の1行だけ）。表は管理者の鍵でしか読み書きできない

function newCode(): string {
  return randomBytes(18).toString("base64url");
}

// 今の合言葉。まだなければ作る（呼ぶ前に必ず requireAdmin() する）
export async function getOrCreateInviteCode(): Promise<string> {
  const admin = createAdminClient();
  const { data } = await admin.from("invite_codes").select("code").eq("id", 1).maybeSingle();
  if (data?.code) return data.code as string;
  return regenerateInviteCode();
}

// 合言葉を作り直す（前の招待URLは使えなくなる）
export async function regenerateInviteCode(): Promise<string> {
  const admin = createAdminClient();
  const code = newCode();
  const { error } = await admin
    .from("invite_codes")
    .upsert({ id: 1, code, updated_at: new Date().toISOString() });
  if (error) throw new Error(`招待URLを作れませんでした：${error.message}`);
  return code;
}

// 登録ページに来た合言葉が正しいか
export async function isValidInviteCode(code: string): Promise<boolean> {
  if (!code) return false;
  const admin = createAdminClient();
  const { data } = await admin.from("invite_codes").select("code").eq("id", 1).maybeSingle();
  const saved = data?.code as string | undefined;
  if (!saved) return false;
  const a = Buffer.from(code);
  const b = Buffer.from(saved);
  return a.length === b.length && timingSafeEqual(a, b);
}
