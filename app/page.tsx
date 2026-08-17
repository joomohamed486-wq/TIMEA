import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import HeroSlider from "@/app/components/HeroSlider";

const money = (n: number) =>
  new Intl.NumberFormat("ar-EG").format(n) + " ج.م";

export default async function Home() {
  const s = await createServerSupabaseClient();

  const { data: products, error } = await s
    .from("products")
    .select(`
      id,
      name,
      slug,
      price,
      image,
      brand:brands(name),
      category:categories(name)
    `)
    .order("created_at", { ascending: false })
    .limit(12);

  if (error) {
    console.error(
      "[TIMEA] Home products query failed:",
      error
    );
  }

  const validProducts = (products || []).filter(
    (p: any) => p.image
  );

  return (
    <main className="home-page" dir="rtl">

      {/* ================= HEADER ================= */}

      <header className="top home-header">
        <Link href="/" className="brand">
          TIMEA
          <span>WATCH BOUTIQUE</span>
        </Link>

        <nav>
          <Link href="/">الرئيسية</Link>
          <Link href="/shop">المتجر</Link>
          <Link href="/cart">السلة</Link>
          <Link href="/account">حسابي</Link>
          <Link href="/admin">الإدارة</Link>
        </nav>
      </header>

      {/* ================= HERO ================= */}

      <section className="hero-modern">

        <div className="hero-copy">

          <div className="hero-eyebrow">
            <span />
            COLLECTION 2026
          </div>

          <h1>
            الوقت
            <br />
            <em>بأسلوبك.</em>
          </h1>

          <p>
            ساعات مختارة بعناية تجمع بين
            الدقة، التصميم والفخامة.
          </p>

          <div className="hero-actions">
            <Link
              href="/shop"
              className="hero-button"
            >
              اكتشف المجموعة
              <span>←</span>
            </Link>

            <Link
              href="/shop"
              className="hero-secondary"
            >
              مشاهدة جميع الساعات
            </Link>
          </div>

        </div>

        <div className="hero-visual">

          {validProducts.length > 0 ? (
            <HeroSlider products={validProducts} />
          ) : (
            <img
              src="https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1400&q=90"
              alt="TIMEA Watch"
            />
          )}

          <div className="hero-badge">
            <span>TIMEA</span>
            <small>
              PRECISION
              <br />
              & DESIGN
            </small>
          </div>

        </div>

      </section>

      {/* ================= TRUST BAR ================= */}

      <section className="trust-bar">

        <div>
          <strong>01</strong>
          <span>
            جودة مختارة بعناية
          </span>
        </div>

        <div>
          <strong>02</strong>
          <span>
            تصميمات مميزة
          </span>
        </div>

        <div>
          <strong>03</strong>
          <span>
            دفع آمن عند الاستلام
          </span>
        </div>

        <div>
          <strong>04</strong>
          <span>
            شحن لجميع أنحاء مصر
          </span>
        </div>

      </section>

      {/* ================= COLLECTION ================= */}

      <section className="section collection-section">

        <div className="section-heading">

          <div>
            <small>
              CURATED COLLECTION
            </small>

            <h2>
              اختياراتنا
              <i> المميزة</i>
            </h2>
          </div>

          <Link href="/shop">
            مشاهدة الكل →
          </Link>

        </div>

        {error ? (

          <div className="products-error">
            <span>!</span>

            <p>
              تعذر تحميل المنتجات حاليًا.
              راجع إعدادات Supabase وسجلات
              الخادم.
            </p>
          </div>

        ) : (

          <div className="premium-grid">

            {(products || []).slice(0, 8).map(
              (p: any, index: number) => (

                <Link
                  className="product-card"
                  href={`/products/${p.slug}`}
                  key={p.id}
                >

                  <div className="product-image">

                    <img
                      src={p.image}
                      alt={p.name}
                    />

                    {index < 3 && (
                      <span className="product-tag">
                        مميز
                      </span>
                    )}

                    <span className="product-arrow">
                      ↗
                    </span>

                  </div>

                  <div className="product-meta">

                    <small>
                      {p.brand?.name ||
                        "TIMEA"}
                      {" · "}
                      {p.category?.name ||
                        "WATCH"}
                    </small>

                    <h3>
                      {p.name}
                    </h3>

                    <strong>
                      {money(
                        Number(p.price)
                      )}
                    </strong>

                  </div>

                </Link>

              )
            )}

          </div>

        )}

        {!error &&
          (products || []).length === 0 && (
            <p className="empty-products">
              لا توجد منتجات حاليًا.
            </p>
          )}

      </section>

      {/* ================= CTA ================= */}

      <section className="home-cta">

        <div>
          <small>
            TIMEA WATCH BOUTIQUE
          </small>

          <h2>
            لأن الوقت
            <br />
            <i>يستحق الأفضل.</i>
          </h2>

          <Link
            href="/shop"
            className="hero-button"
          >
            اكتشف ساعات TIMEA
            <span>←</span>
          </Link>
        </div>

      </section>

      {/* ================= PAGE STYLE ================= */}

      <style>{`

        .home-page {
          background: #f7f6f2;
          color: #171717;
          min-height: 100vh;
        }

        /* HEADER */

        .home-header {
          min-height: 82px;
          padding: 0 5%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 30px;
          border-bottom: 1px solid rgba(0,0,0,.06);
          background: rgba(247,246,242,.92);
          position: relative;
          z-index: 20;
        }

        .brand {
          color: #171717;
          text-decoration: none;
          font-size: 25px;
          letter-spacing: .18em;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .brand span {
          font-size: 8px;
          letter-spacing: .16em;
          color: #999;
          font-weight: 400;
        }

        .home-header nav {
          display: flex;
          align-items: center;
          gap: 28px;
        }

        .home-header nav a {
          color: #555;
          text-decoration: none;
          font-size: 13px;
          transition: color .2s ease;
        }

        .home-header nav a:hover {
          color: #000;
        }

        /* HERO */

        .hero-modern {
          min-height: 690px;
          display: grid;
          grid-template-columns: .85fr 1.15fr;
          direction: ltr;
          overflow: hidden;
        }

        .hero-copy {
          direction: rtl;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 80px 8%;
          position: relative;
          z-index: 5;
        }

        .hero-eyebrow {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #888;
          font-size: 10px;
          letter-spacing: .18em;
          margin-bottom: 25px;
        }

        .hero-eyebrow span {
          width: 35px;
          height: 1px;
          background: #999;
        }

        .hero-copy h1 {
          margin: 0;
          font-size: clamp(60px, 7vw, 100px);
          line-height: .92;
          font-weight: 400;
          letter-spacing: -.05em;
        }

        .hero-copy h1 em {
          font-family: Georgia, serif;
          font-weight: 400;
          color: #777;
        }

        .hero-copy p {
          max-width: 420px;
          margin: 30px 0;
          color: #777;
          line-height: 1.9;
          font-size: 15px;
        }

        .hero-actions {
          display: flex;
          align-items: center;
          gap: 22px;
          flex-wrap: wrap;
        }

        .hero-button {
          min-height: 50px;
          padding: 0 20px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 25px;
          background: #171717;
          color: white;
          text-decoration: none;
          border-radius: 4px;
          font-size: 13px;
          transition:
            transform .25s ease,
            background .25s ease;
        }

        .hero-button:hover {
          transform: translateY(-2px);
          background: #333;
        }

        .hero-button span {
          font-size: 17px;
        }

        .hero-secondary {
          color: #555;
          text-decoration: none;
          font-size: 12px;
          border-bottom: 1px solid #aaa;
          padding-bottom: 4px;
        }

        /* HERO IMAGE */

        .hero-visual {
          position: relative;
          min-height: 690px;
          overflow: hidden;
          background: #ddd;
        }

        .hero-visual > img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .hero-badge {
          position: absolute;
          bottom: 35px;
          left: 35px;
          width: 100px;
          height: 100px;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,.9);
          backdrop-filter: blur(10px);
          text-align: center;
          z-index: 10;
        }

        .hero-badge span {
          font-size: 11px;
          letter-spacing: .15em;
        }

        .hero-badge small {
          margin-top: 5px;
          color: #888;
          font-size: 7px;
          letter-spacing: .15em;
          line-height: 1.6;
        }

        /* TRUST */

        .trust-bar {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          border-top: 1px solid #ddd;
          border-bottom: 1px solid #ddd;
          background: #fff;
        }

        .trust-bar div {
          padding: 25px 30px;
          display: flex;
          align-items: center;
          gap: 15px;
          border-left: 1px solid #eee;
        }

        .trust-bar strong {
          font-size: 11px;
          color: #aaa;
        }

        .trust-bar span {
          font-size: 12px;
          color: #555;
        }

        /* COLLECTION */

        .section {
          max-width: 1250px;
          margin: auto;
          padding: 100px 30px;
        }

        .section-heading {
          display: flex;
          align-items: end;
          justify-content: space-between;
          margin-bottom: 45px;
        }

        .section-heading small {
          color: #999;
          letter-spacing: .18em;
          font-size: 10px;
        }

        .section-heading h2 {
          margin: 10px 0 0;
          font-size: clamp(35px, 5vw, 60px);
          font-weight: 400;
          letter-spacing: -.04em;
        }

        .section-heading h2 i {
          font-family: Georgia, serif;
          color: #777;
        }

        .section-heading > a {
          color: #555;
          text-decoration: none;
          font-size: 12px;
        }

        /* PRODUCTS */

        .premium-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 22px;
        }

        .product-card {
          color: #171717;
          text-decoration: none;
        }

        .product-image {
          aspect-ratio: .82;
          position: relative;
          overflow: hidden;
          background: #ecebe7;
        }

        .product-image img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          transition:
            transform .7s cubic-bezier(.2,.7,.2,1);
        }

        .product-card:hover
        .product-image img {
          transform: scale(1.045);
        }

        .product-tag {
          position: absolute;
          top: 14px;
          right: 14px;
          padding: 6px 10px;
          background: rgba(255,255,255,.9);
          font-size: 9px;
          border-radius: 2px;
        }

        .product-arrow {
          position: absolute;
          bottom: 14px;
          left: 14px;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border-radius: 50%;
          opacity: 0;
          transform: translateY(8px);
          transition: all .3s ease;
        }

        .product-card:hover
        .product-arrow {
          opacity: 1;
          transform: translateY(0);
        }

        .product-meta {
          padding: 17px 2px;
        }

        .product-meta small {
          color: #999;
          font-size: 9px;
          letter-spacing: .05em;
        }

        .product-meta h3 {
          margin: 7px 0;
          font-size: 15px;
          font-weight: 500;
        }

        .product-meta strong {
          font-size: 13px;
        }

        .products-error {
          padding: 25px;
          background: #fff;
          border: 1px solid #eee;
        }

        .empty-products {
          color: #888;
        }

        /* CTA */

        .home-cta {
          min-height: 500px;
          margin-top: 30px;
          padding: 80px 8%;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          background:
            linear-gradient(
              rgba(20,20,20,.55),
              rgba(20,20,20,.55)
            ),
            url("https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1800&q=90")
            center / cover;
          color: white;
        }

        .home-cta small {
          font-size: 10px;
          letter-spacing: .2em;
          opacity: .7;
        }

        .home-cta h2 {
          margin: 20px 0 30px;
          font-size: clamp(45px, 6vw, 80px);
          line-height: .95;
          font-weight: 400;
        }

        .home-cta h2 i {
          font-family: Georgia, serif;
          color: #ccc;
        }

        /* TABLET */

        @media (max-width: 950px) {

          .home-header nav {
            gap: 14px;
          }

          .hero-modern {
            grid-template-columns: 1fr;
          }

          .hero-copy {
            min-height: 500px;
          }

          .hero-visual {
            min-height: 600px;
          }

          .premium-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .trust-bar {
            grid-template-columns: repeat(2, 1fr);
          }

        }

        /* MOBILE */

        @media (max-width: 600px) {

          .home-header {
            padding: 0 18px;
            flex-direction: column;
            align-items: flex-start;
            padding-top: 18px;
            padding-bottom: 18px;
          }

          .home-header nav {
            width: 100%;
            overflow-x: auto;
            gap: 20px;
            padding-bottom: 3px;
          }

          .home-header nav a {
            white-space: nowrap;
            font-size: 12px;
          }

          .brand span {
            display: none;
          }

          .hero-copy {
            min-height: 470px;
            padding: 60px 25px;
          }

          .hero-copy h1 {
            font-size: 64px;
          }

          .hero-copy p {
            font-size: 13px;
          }

          .hero-visual {
            min-height: 480px;
          }

          .hero-badge {
            width: 75px;
            height: 75px;
            bottom: 20px;
            left: 20px;
          }

          .trust-bar {
            grid-template-columns: 1fr 1fr;
          }

          .trust-bar div {
            padding: 18px 15px;
            border-bottom: 1px solid #eee;
          }

          .trust-bar span {
            font-size: 10px;
          }

          .section {
            padding: 70px 18px;
          }

          .section-heading {
            align-items: flex-start;
            gap: 20px;
          }

          .section-heading > a {
            margin-top: 10px;
            white-space: nowrap;
          }

          .premium-grid {
            grid-template-columns: 1fr 1fr;
            gap: 14px;
          }

          .product-meta h3 {
            font-size: 13px;
          }

          .home-cta {
            min-height: 420px;
          }

        }

      `}</style>
    </main>
  );
}
