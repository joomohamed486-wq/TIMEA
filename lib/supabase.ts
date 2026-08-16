import {createBrowserClient} from '@supabase/ssr';

function env(name:string){
  const value=process.env[name];
  if(!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

export function createClient(){
  return createBrowserClient(env('NEXT_PUBLIC_SUPABASE_URL'),env('NEXT_PUBLIC_SUPABASE_ANON_KEY'));
}
