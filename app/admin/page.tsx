import {createServerSupabaseClient} from '@/lib/supabase-server';
import Link from 'next/link';
import {redirect} from 'next/navigation';
import LogoutButton from '@/app/LogoutButton';

const money=(n:number)=>new Intl.NumberFormat('ar-EG').format(n)+' ج.م';
const ADMIN_ROLES=['SUPER_ADMIN','ADMIN','STAFF','INVENTORY_MANAGER'];

export default async function Admin(){
  const s=await createServerSupabaseClient();
  const {data:{user}}=await s.auth.getUser();
  if(!user)redirect('/login?next=/admin');
  const {data:p}=await s.from('profiles').select('role,name').eq('id',user.id).single();
  if(!p||!ADMIN_ROLES.includes(p.role))redirect('/');

  const [{count:products},{count:users},{data:orders}]=await Promise.all([
    s.from('products').select('*',{count:'exact',head:true}),
    s.from('profiles').select('*',{count:'exact',head:true}).eq('role','CUSTOMER'),
    s.from('orders').select('order_number,total,status,user_id,created_at').order('created_at',{ascending:false}).limit(6)
  ]);
  const sales=(orders||[]).reduce((a:any,o:any)=>a+Number(o.total),0);

  return <main>
    <header className="top">
      <Link href="/" className="brand">TIMEA ADMIN</Link>
      <nav>
        <Link href="/">المتجر</Link>
        <Link href="/account">حسابي</Link>
        <Link href="/register">إنشاء حساب</Link>
        <LogoutButton />
      </nav>
    </header>
    <section className="admin">
      <small>PRODUCTION ADMIN</small>
      <h1>لوحة التحكم</h1>
      <p className="note">مرحبًا {p.name || user.email}. أنت مسجل بصلاحية {p.role}.</p>
      <div className="admin-quick">{[["/admin/products","المنتجات","إدارة وإضافة وتعديل المنتجات"],["/admin/orders","الطلبات","تحديث الحالات ومراجعة الطلبات"],["/admin/inventory","المخزون","مراقبة المخزون والتعديلات"],["/admin/users","المستخدمون","الحسابات والصلاحيات"]].map(([href,title,desc])=><a className="quick-card" key={href} href={href}><b>{title}</b><span>{desc}</span></a>)}</div><div className="stats">
        <div><small>المنتجات</small><b>{products||0}</b></div>
        <div><small>العملاء</small><b>{users||0}</b></div>
        <div><small>آخر الطلبات</small><b>{orders?.length||0}</b></div>
        <div><small>قيمة الطلبات المعروضة</small><b>{money(sales)}</b></div>
      </div>
      <div className="panel">
        <h2>آخر الطلبات</h2>
        {(orders||[]).map((o:any)=><div className="row" key={o.order_number}><span>#{o.order_number} — {o.user_id?.slice(0,8)}</span><b>{money(Number(o.total))}</b><em>{o.status}</em></div>)}
        {!orders?.length&&<p>لا توجد طلبات حتى الآن.</p>}
      </div>
      
    </section>
  </main>
}
