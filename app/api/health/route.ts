import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function GET() {
  const started = Date.now();
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return NextResponse.json({ ok:false, stage:"env", error:"Missing Supabase environment variables" }, { status:500 });
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.from("products").select("id").limit(1);
    if (error) return NextResponse.json({ ok:false, stage:"supabase", error:{message:error.message,code:error.code,details:error.details,hint:error.hint}, ms:Date.now()-started }, { status:502 });
    return NextResponse.json({ ok:true, stage:"ready", productsReachable:true, sampleCount:data?.length ?? 0, ms:Date.now()-started });
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok:false, stage:"server", error, ms:Date.now()-started }, { status:500 });
  }
}
