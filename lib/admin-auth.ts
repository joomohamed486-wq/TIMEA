import { createServerSupabaseClient } from '@/lib/supabase-server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';

export const ADMIN_ROLES = ['SUPER_ADMIN','ADMIN','STAFF','INVENTORY_MANAGER'] as const;
export type AdminRole = typeof ADMIN_ROLES[number];

export async function requireAdmin() {
  const s = await createServerSupabaseClient();
  const { data: { user } } = await s.auth.getUser();
  if (!user) return { ok:false as const, status:401, error:'يجب تسجيل الدخول أولاً' };
  const { data: profile, error } = await s.from('profiles').select('id,name,email,phone,role').eq('id', user.id).single();
  if (error || !profile || !ADMIN_ROLES.includes(profile.role as AdminRole)) {
    return { ok:false as const, status:403, error:'ليس لديك صلاحية الوصول إلى لوحة الإدارة' };
  }
  return { ok:true as const, user, profile, admin:createSupabaseAdminClient() };
}

export function canManage(actor:string, required:AdminRole) {
  if (required === 'SUPER_ADMIN') return actor === 'SUPER_ADMIN';
  if (required === 'ADMIN') return ['SUPER_ADMIN','ADMIN'].includes(actor);
  if (required === 'STAFF') return ['SUPER_ADMIN','ADMIN','STAFF'].includes(actor);
  return true;
}
