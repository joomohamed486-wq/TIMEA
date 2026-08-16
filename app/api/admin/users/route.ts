import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';

const ROLES = ['SUPER_ADMIN', 'ADMIN', 'STAFF', 'INVENTORY_MANAGER', 'CUSTOMER'] as const;
const MANAGEABLE = ['SUPER_ADMIN', 'ADMIN', 'STAFF', 'INVENTORY_MANAGER', 'CUSTOMER'] as const;

async function guard() {
  const s = await createServerSupabaseClient();
  const { data: { user } } = await s.auth.getUser();
  if (!user) return { error: 'يجب تسجيل الدخول أولاً', status: 401 as const };
  const { data: profile } = await s.from('profiles').select('id,name,email,role').eq('id', user.id).single();
  if (!profile || !['SUPER_ADMIN', 'ADMIN', 'STAFF', 'INVENTORY_MANAGER'].includes(profile.role)) {
    return { error: 'ليس لديك صلاحية إدارة المستخدمين', status: 403 as const };
  }
  return { s, user, profile };
}

export async function GET() {
  try {
    const g = await guard();
    if ('error' in g) return NextResponse.json({ error: g.error }, { status: g.status });
    const { data, error } = await g.s.from('profiles').select('id,name,email,phone,role,created_at').order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ users: data ?? [] });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'حدث خطأ غير متوقع' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const g = await guard();
    if ('error' in g) return NextResponse.json({ error: g.error }, { status: g.status });
    const body = z.object({ name: z.string().min(2).max(100), email: z.string().email(), password: z.string().min(8).max(100), role: z.enum(MANAGEABLE), phone: z.string().max(30).optional().default('') }).parse(await request.json());
    if (body.role === 'SUPER_ADMIN' && g.profile.role !== 'SUPER_ADMIN') return NextResponse.json({ error: 'إنشاء SUPER_ADMIN متاح لـ SUPER_ADMIN فقط' }, { status: 403 });
    if (body.role === 'ADMIN' && !['SUPER_ADMIN', 'ADMIN'].includes(g.profile.role)) return NextResponse.json({ error: 'إنشاء ADMIN غير متاح لهذا الدور' }, { status: 403 });

    const admin = createSupabaseAdminClient();
    const { data: created, error: createError } = await admin.auth.admin.createUser({ email: body.email, password: body.password, email_confirm: true, user_metadata: { name: body.name, phone: body.phone } });
    if (createError || !created.user) return NextResponse.json({ error: createError?.message || 'تعذر إنشاء المستخدم' }, { status: 400 });

    const { error: profileError } = await admin.from('profiles').upsert({ id: created.user.id, name: body.name, email: body.email, phone: body.phone || null, role: body.role, updated_at: new Date().toISOString() }, { onConflict: 'id' });
    if (profileError) {
      await admin.auth.admin.deleteUser(created.user.id);
      return NextResponse.json({ error: `تم إنشاء الحساب لكن تعذر إعداد الصلاحيات: ${profileError.message}` }, { status: 400 });
    }
    return NextResponse.json({ ok: true, user: { id: created.user.id, email: body.email, name: body.name, role: body.role } }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.issues?.[0]?.message || e?.message || 'حدث خطأ غير متوقع' }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const g = await guard();
    if ('error' in g) return NextResponse.json({ error: g.error }, { status: g.status });
    const body = z.object({ id: z.string().uuid(), role: z.enum(ROLES) }).parse(await request.json());
    if (body.id === g.user.id && body.role === 'CUSTOMER') return NextResponse.json({ error: 'لا يمكنك إزالة صلاحيات حسابك الحالي' }, { status: 400 });
    if (body.role === 'SUPER_ADMIN' && g.profile.role !== 'SUPER_ADMIN') return NextResponse.json({ error: 'تعيين SUPER_ADMIN متاح لـ SUPER_ADMIN فقط' }, { status: 403 });
    if (body.role === 'ADMIN' && !['SUPER_ADMIN', 'ADMIN'].includes(g.profile.role)) return NextResponse.json({ error: 'تعيين ADMIN غير متاح لهذا الدور' }, { status: 403 });
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin.from('profiles').update({ role: body.role, updated_at: new Date().toISOString() }).eq('id', body.id).select('id,name,email,role').single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true, user: data });
  } catch (e: any) {
    return NextResponse.json({ error: e?.issues?.[0]?.message || e?.message || 'حدث خطأ غير متوقع' }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const g = await guard();
    if ('error' in g) return NextResponse.json({ error: g.error }, { status: g.status });
    if (g.profile.role !== 'SUPER_ADMIN') return NextResponse.json({ error: 'حذف المستخدمين متاح لـ SUPER_ADMIN فقط' }, { status: 403 });
    const body = z.object({ id: z.string().uuid() }).parse(await request.json());
    if (body.id === g.user.id) return NextResponse.json({ error: 'لا يمكنك حذف حسابك الحالي' }, { status: 400 });
    const admin = createSupabaseAdminClient();
    const { error } = await admin.auth.admin.deleteUser(body.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.issues?.[0]?.message || e?.message || 'حدث خطأ غير متوقع' }, { status: 400 });
  }
}
