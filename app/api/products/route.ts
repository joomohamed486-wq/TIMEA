import {NextResponse} from 'next/server';
import {createServerSupabaseClient} from '@/lib/supabase-server';

export async function GET(){
  const s=await createServerSupabaseClient();
  const {data,error}=await s.from('products').select('*').order('created_at',{ascending:false});
  if(error){
    console.error('[TIMEA] /api/products:',error);
    return NextResponse.json({error:error.message,items:[]},{status:500});
  }
  return NextResponse.json(data||[],{status:200});
}
