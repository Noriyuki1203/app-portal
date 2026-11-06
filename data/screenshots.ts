import { cacheLife, cacheTag} from "next/cache";
import { supabase } from "@/lib/supabase/public";

// スクリーンショット1枚の形（仕様書 6-3 の screenshots 表に合わせる）
export type Screenshot = {
  id: number;
  app_id: string;
  image_url: string;
  sort_order: number;
};

export async function getScreenshotsByAppId(appId: string): Promise<Screenshot[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("apps");

  const { data, error } = await supabase
    .from("screenshots")
    .select("*")
    .eq("app_id", appId)
    .order("sort_order");

    if(error){
      throw new Error(`画像を読み込めませんでした：${error.message}`);
    }
    return data;
}
