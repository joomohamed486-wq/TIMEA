import Link from 'next/link';
import {createServerSupabaseClient} from '@/lib/supabase-server';

const money=(n:number)=>new Intl.NumberFormat('ar-EG').format(n)+' ج.م';

export default async function Home(){
  const s=await createServerSupabaseClient();
  const {data:products,error}=await s.from('products')
    .select('*')
    .order('created_at',{ascending:false}).limit(8);

  if(error) console.error('[TIMEA] Home products query failed:', error);

  return <main>
    <header className="top"><Link href="/" className="brand">TIMEA <span>WATCH BOUTIQUE</span></Link>
      <nav><Link href="/">الرئيسية</Link><Link href="/shop">المتجر</Link><Link href="/cart">السلة</Link><Link href="/account">حسابي</Link><Link href="/admin">الإدارة</Link></nav>
    </header>
    <section className="hero"><div><small>COLLECTION 2026</small><h1>الوقت<br/><i>بأسلوبك.</i></h1><p>ساعات مختارة بعناية تجمع بين الدقة والتصميم والفخامة.</p><Link className="btn" href="/shop">اكتشف المجموعة</Link></div>
      <img src="https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1200&q=85" alt="TIMEA watch"/>
    </section>
    <section className="section"><small>CURATED COLLECTION</small><h2>اختياراتنا المميزة</h2>
      {error ? <p>تعذر تحميل المنتجات حاليًا. راجع إعدادات Supabase وسجلات الخادم.</p> :
      <div className="grid">{(products||[]).map((p:any)=><Link className="card" href={'/products/'+p.slug} key={p.id}>
        <img src={p.image} alt={p.name}/><small>{p.brand?.name} · {p.category?.name}</small><h3>{p.name}</h3><b>{money(Number(p.price))}</b>
      </Link>)}</div>}
      {!error && (products||[]).length===0 && <p>لا توجد منتجات. شغّل ملف <code>supabase/seed.sql</code> بعد إنشاء الجداول.</p>}
    </section>
  </main>
}
