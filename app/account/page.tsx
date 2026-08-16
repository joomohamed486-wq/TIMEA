import {createServerSupabaseClient} from '@/lib/supabase-server';
import {redirect} from 'next/navigation';
import Link from 'next/link';
import LogoutButton from '@/app/LogoutButton';

export default async function Account(){
  const s=await createServerSupabaseClient();
  const {data:{user}}=await s.auth.getUser();
  if(!user)redirect('/login?next=/account');
  const {data:p}=await s.from('profiles').select('*').eq('id',user.id).single();
  const {data:orders}=await s.from('orders').select('*').eq('user_id',user.id).order('created_at',{ascending:false}).limit(20);
  return <main><header className="top"><Link href="/" className="brand">TIMEA</Link><nav><Link href="/shop">المتجر</Link><Link href="/cart">السلة</Link><LogoutButton/></nav></header><section className="admin"><small>MY ACCOUNT</small><h1>مرحبًا {p?.name||user.email}</h1><div className="panel"><h2>طلباتي</h2>{orders?.length?orders.map((o:any)=><div className="row" key={o.id}><span>#{o.order_number}</span><b>{Number(o.total).toLocaleString('ar-EG')} ج.م</b><em>{o.status}</em></div>):<p>لا توجد طلبات حتى الآن.</p>}</div></section></main>
}
