import AddToCart from './AddToCart';
import {createServerSupabaseClient} from '@/lib/supabase-server';
import Link from 'next/link';
import {notFound} from 'next/navigation';

const money=(n:number)=>new Intl.NumberFormat('ar-EG').format(n)+' ج.م';

export default async function Product({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const s=await createServerSupabaseClient();
  const {data:p,error}=await s.from('products').select('*').eq('slug',slug).maybeSingle();
  if(error){ console.error('[TIMEA] Product query failed:', error); throw new Error('تعذر تحميل المنتج'); }
  if(!p) return notFound();

  return <main><header className="top"><Link href="/" className="brand">TIMEA <span>WATCH BOUTIQUE</span></Link>
    <nav><Link href="/shop">المتجر</Link><Link href="/cart">السلة</Link><Link href="/account">حسابي</Link></nav></header>
    <section className="detail"><img src={p.image} alt={p.name}/><div><small>{'TIMEA'} · {p.category?.name}</small>
      <h1>{p.name}</h1><h2>{money(Number(p.price))}</h2><p>{p.description}</p>
      <div className="specs"><span>الحركة<b>{p.movement || '—'}</b></span><span>الجنس<b>{p.gender || '—'}</b></span><span>الخامة<b>{p.case_material || '—'}</b></span><span>المخزون<b>{p.stock}</b></span></div>
      <AddToCart productId={p.id}/></div></section></main>
}
