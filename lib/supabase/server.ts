import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
    const cookiesStroe = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    return cookiesStroe.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookiesStroe.set(name, value, options)
                        );
                    } catch {
                        // ページの表示中は Cookie を書き換えられない。
                        // proxy.ts がログイン状態を更新するので、ここでは何もしなくてよい
                    }
                },
            },
        }
    );
}