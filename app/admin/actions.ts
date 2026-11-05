"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type LoginState = { error: string; }

export async function login(prevState: LoginState, formData: FormData): Promise<LoginState> {
    const id = String(formData.get("id") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
        email: `${id}@app-portal.local`,
        password,
    });

    if(error){
        return {error: "IDがパスワードが違います。"}
    }

    redirect("/admin")
}

export async function logout(){
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/admin/login");
}