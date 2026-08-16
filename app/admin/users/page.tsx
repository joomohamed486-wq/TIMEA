import { createServerSupabaseClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import AdminUserManager from '../AdminUserManager';
const ROLES=['SUPER_ADMIN','ADMIN','STAFF','INVENTORY_MANAGER'];
export default async function Users(){const s=await createServerSupabaseClient();const {data:{user}}=await s.auth.getUser();if(!user)redirect('/login?next=/admin/users');const {data:p}=await s.from('profiles').select('role').eq('id',user.id).single();if(!p||!ROLES.includes(p.role))redirect('/');return <main className="admin"><small>ACCESS CONTROL</small><h1>المستخدمون والصلاحيات</h1><p className="note">إدارة الحسابات والصلاحيات من مكان واحد. إنشاء المستخدمين يتم عبر Supabase Admin API من الخادم فقط.</p><AdminUserManager currentRole={p.role}/></main>}
