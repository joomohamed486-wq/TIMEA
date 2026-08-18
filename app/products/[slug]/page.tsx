import AddToCart from './AddToCart';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';

const money = (n: number) => new Intl.NumberFormat('ar-EG').format(n) + ' ج.م';

export default async function Product({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = await createServerSupabaseClient();
  const { data: p, error } = await s
    .from('products')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error('[TIMEA] Product query failed:', error);
    throw new Error('تعذر تحميل المنتج');
  }

  if (!p) return notFound();

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans dir-rtl" dir="rtl">
      {/* Header / Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-neutral-950/80 border-b border-neutral-800/60 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex flex-col group">
            <span className="text-2xl font-black tracking-wider text-amber-500 group-hover:text-amber-400 transition-colors">
              TIMEA
            </span>
            <span className="text-[9px] tracking-[0.25em] text-neutral-400 uppercase -mt-1">
              Watch Boutique
            </span>
          </Link>

          <nav className="flex items-center gap-8 text-sm font-medium text-neutral-300">
            <Link href="/shop" className="hover:text-amber-400 transition-colors">المتجر</Link>
            <Link href="/cart" className="hover:text-amber-400 transition-colors">السلة</Link>
            <Link href="/account" className="hover:text-amber-400 transition-colors">حسابي</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12 lg:py-20">
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          
          {/* Product Image Gallery Wrapper */}
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-2xl group">
            {p.image ? (
              <Image
                src={p.image}
                alt={p.name}
                fill
                priority
                className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-600">
                لا توجد صورة متوفرة
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="flex flex-col space-y-8">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-amber-500 uppercase bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 mb-3">
                TIMEA · {p.category?.name || 'ساعة فاخرة'}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
                {p.name}
              </h1>
              <p className="text-3xl font-extrabold text-amber-400 tracking-wide">
                {money(Number(p.price))}
              </p>
            </div>

            {p.description && (
              <p className="text-neutral-400 leading-relaxed text-base border-t border-neutral-800/80 pt-6">
                {p.description}
              </p>
            )}

            {/* Specifications Grid */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800/80">
                <span className="block text-xs text-neutral-500 mb-1">آلية الحركة</span>
                <span className="font-semibold text-neutral-200">{p.movement || '—'}</span>
              </div>
              <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800/80">
                <span className="block text-xs text-neutral-500 mb-1">الفئة / الجنس</span>
                <span className="font-semibold text-neutral-200">{p.gender || '—'}</span>
              </div>
              <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800/80">
                <span className="block text-xs text-neutral-500 mb-1">خامة الهيكل</span>
                <span className="font-semibold text-neutral-200">{p.case_material || '—'}</span>
              </div>
              <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800/80">
                <span className="block text-xs text-neutral-500 mb-1">حالة المخزون</span>
                <span className={`font-semibold ${p.stock > 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                  {p.stock > 0 ? `متوفر (${p.stock})` : 'غير متوفر'}
                </span>
              </div>
            </div>

            {/* Action Area */}
            <div className="pt-4 border-t border-neutral-800/80">
              <AddToCart productId={p.id} />
            </div>
          </div>

        </section>
      </main>
    </div>
  );
}
