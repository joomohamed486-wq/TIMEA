import Link from 'next/link';
import {createServerSupabaseClient} from '@/lib/supabase-server';
const money=(n:number)=>new Intl.NumberFormat('ar-EG').format(n)+' ج.م';

export default async function Shop(){
  const s=await createServerSupabaseClient();
  const {data:ps,error}=await s.from('products').select('*,brand:brands(name),category:categories(name)').order('created_at',{ascending:false});
  if(error) console.error('[TIMEA] Shop products query failed:', error);
  return <main><header className="top"><Link href="/" className="brand">TIMEA <span>WATCH BOUTIQUE</span></Link>
    <nav><Link href="/">الرئيسية</Link><Link href="/shop">المتجر</Link><Link href="/cart">السلة</Link><Link href="/account">حسابي</Link></nav></header>
    <section className="section"><small>ALL WATCHES</small><h1>المتجر</h1>
      {error ? <p>تعذر تحميل المنتجات حاليًا. تحقق من اتصال Supabase وRLS.</p> :
      <div className="grid">{(ps||[]).map((p:any)=><Link className="card" href={'/products/'+p.slug} key={p.id}>
        <img src={p.image} alt={p.name}/><small>{p.brand?.name}</small><h3>{p.name}</h3><b>{money(Number(p.price))}</b>
      </Link>)}</div>}
      {!error && (ps||[]).length===0 && <p>لا توجد منتجات حاليًا.</p>}
    </section></main>
}
