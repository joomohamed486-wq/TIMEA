import {createServerClient} from '@supabase/ssr';
import {cookies} from 'next/headers';

function env(name:string){
  const value=process.env[name];
  if(!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

export async function createServerSupabaseClient(){
  const cookieStore=await cookies();
  return createServerClient(
    env('NEXT_PUBLIC_SUPABASE_URL'),
    env('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    {
      cookies:{
        getAll(){return cookieStore.getAll()},
        setAll(cookiesToSet){
          try{cookiesToSet.forEach(({name,value,options})=>cookieStore.set(name,value,options))}
          catch{/* Server Components may not be able to mutate cookies */}
        }
      }
    }
  );
}

export async function getUser(){
  const supabase=await createServerSupabaseClient();
  const {data:{user}}=await supabase.auth.getUser();
  return user;
}
