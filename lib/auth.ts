import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";

export async function requireLogin(){
    const supabase = await createClient();
    const{data} = await supabase.auth.getClaims();

    if(!data?.claims){
        redirect("/admin/login");
    }

    return{
        id:data.claims.sub,
        loginId:String(data.claims.email ?? "").split("@")[0],
    };
}