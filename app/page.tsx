import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import HeroSlider from "@/components/HeroSlider";

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
    console.error("[TIMEA] Home products query failed:", error);
  }

  const validProducts = (products || []).filter(
    (p: any) => p.image
  );

  return (
    <main className="home-page" dir="rtl">

      <style>{`
      

        .home-page {
          --text: #171717;
          --muted: #777;
          --light-muted: #999;
          --border: #e5e3df;
          --surface: #ffffff;
          --background: #f7f6f2;

          min-height: 100vh;
          background: var(--background);
          color: var(--text);
          font-family: "Cairo", Arial, sans-serif;
          font-size: 16px;
        }

        .home-page *,
        .home-page *::before,
        .home-page *::after {
          box-sizing: border-box;
        }

        /* HEADER */

        .home-header {
          min-height: 86px;
          padding: 0 5%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 30px;
          border-bottom: 1px solid rgba(0,0,0,.07);
          background: rgba(247,246,242,.95);
          position: relative;
          z-index: 20;
        }

        .home-header .brand {
          color: #171717;
          text-decoration: none;
          font-size: 27px;
          letter-spacing: .12em;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 11px;
          line-height: 1;
        }

        .home-header .brand span {
          font-size: 9px;
          letter-spacing: .13em;
          color: #999;
          font-weight: 500;
        }

        .home-header nav {
          display: flex;
          align-items: center;
          gap: 30px;
        }

        .home-header nav a {
          color: #555;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: color .2s ease;
          white-space: nowrap;
        }

        .home-header nav a:hover {
          color: #000;
        }

        /* HERO */

        .hero-modern {
          min-height: 700px;
          display: grid;
          grid-template-columns: .88fr 1.12fr;
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
          gap: 11px;
          color: #888;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: .12em;
          margin-bottom: 27px;
        }

        .hero-eyebrow span {
          width: 38px;
          height: 1px;
          background: #999;
        }

        .hero-copy h1 {
          margin: 0;
          font-size: clamp(64px, 7vw, 104px);
          line-height: 1.02;
          font-weight: 500;
          letter-spacing: -.055em;
        }

        .hero-copy h1 em {
          font-family: Georgia, serif;
          font-weight: 400;
          color: #777;
          font-style: italic;
        }

        .hero-copy p {
          max-width: 440px;
          margin: 32px 0;
          color: #666;
          line-height: 2;
          font-size: 17px;
          font-weight: 400;
        }

        .hero-actions {
          display: flex;
          align-items: center;
          gap: 25px;
          flex-wrap: wrap;
        }

        .hero-button {
          min-height: 55px;
          padding: 0 23px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 28px;
          background: #171717;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          font-size: 14px;
          font-weight: 600;
          transition:
            transform .25s ease,
            background .25s ease;
        }

        .hero-button:hover {
          transform: translateY(-2px);
          background: #333;
        }

        .hero-button span {
          font-size: 20px;
        }

        .hero-secondary {
          color: #555;
          text-decoration: none;
          font-size: 13px;
          font-weight: 500;
          border-bottom: 1px solid #aaa;
          padding-bottom: 5px;
        }

        /* HERO IMAGE */

        .hero-visual {
          position: relative;
          min-height: 700px;
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
          width: 105px;
          height: 105px;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,.92);
          backdrop-filter: blur(10px);
          text-align: center;
          z-index: 10;
        }

        .hero-badge span {
          font-size: 12px;
          letter-spacing: .12em;
          font-weight: 600;
        }

        .hero-badge small {
          margin-top: 5px;
          color: #888;
          font-size: 8px;
          font-weight: 500;
          letter-spacing: .08em;
          line-height: 1.7;
        }

        /* TRUST */

        .trust-bar {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          background: #fff;
        }

        .trust-bar div {
          min-height: 82px;
          padding: 20px 30px;
          display: flex;
          align-items: center;
          gap: 16px;
          border-left: 1px solid #eee;
        }

        .trust-bar strong {
          font-size: 12px;
          color: #aaa;
          font-weight: 600;
        }

        .trust-bar span {
          font-size: 13px;
          color: #555;
          font-weight: 500;
        }

        /* COLLECTION */

        .section {
          max-width: 1250px;
          margin: auto;
          padding: 105px 30px;
        }

        .section-heading {
          display: flex;
          align-items: end;
          justify-content: space-between;
          margin-bottom: 48px;
        }

        .section-heading small {
          color: #999;
          letter-spacing: .12em;
          font-size: 11px;
          font-weight: 600;
        }

        .section-heading h2 {
          margin: 11px 0 0;
          font-size: clamp(38px, 5vw, 62px);
          line-height: 1.15;
          font-weight: 500;
          letter-spacing: -.045em;
        }

        .section-heading h2 i {
          font-family: Georgia, serif;
          color: #777;
          font-weight: 400;
        }

        .section-heading > a {
          color: #555;
          text-decoration: none;
          font-size: 13px;
          font-weight: 500;
          white-space: nowrap;
        }

        /* PRODUCTS */

        .premium-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
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

        .product-card:hover .product-image img {
          transform: scale(1.045);
        }

        .product-tag {
          position: absolute;
          top: 14px;
          right: 14px;
          padding: 7px 11px;
          background: rgba(255,255,255,.92);
          font-size: 10px;
          font-weight: 600;
          border-radius: 3px;
        }

        .product-arrow {
          position: absolute;
          bottom: 14px;
          left: 14px;
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border-radius: 50%;
          opacity: 0;
          transform: translateY(8px);
          transition: all .3s ease;
          font-size: 16px;
        }

        .product-card:hover .product-arrow {
          opacity: 1;
          transform: translateY(0);
        }

        .product-meta {
          padding: 18px 2px;
        }

        .product-meta small {
          color: #999;
          font-size: 10px;
          font-weight: 500;
          line-height: 1.7;
        }

        .product-meta h3 {
          margin: 8px 0;
          font-size: 17px;
          line-height: 1.6;
          font-weight: 600;
        }

        .product-meta strong {
          font-size: 14px;
          font-weight: 600;
        }

        .products-error {
          padding: 25px;
          background: #fff;
          border: 1px solid #eee;
          font-size: 14px;
          line-height: 1.9;
        }

        .empty-products {
          color: #888;
          font-size: 15px;
        }

        /* CTA */

        .home-cta {
          min-height: 520px;
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
          font-size: 11px;
          font-weight: 600;
          letter-spacing: .13em;
          opacity: .75;
        }

        .home-cta h2 {
          margin: 20px 0 35px;
          font-size: clamp(48px, 6vw, 82px);
          line-height: 1.05;
          font-weight: 500;
        }

        .home-cta h2 i {
          font-family: Georgia, serif;
          color: #ccc;
          font-weight: 400;
        }

        /* TABLET */

        @media (max-width: 950px) {

          .home-header nav {
            gap: 18px;
          }

          .hero-modern {
            grid-template-columns: 1fr;
          }

          .hero-copy {
            min-height: 540px;
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
            padding: 18px;
            flex-direction: column;
            align-items: flex-start;
          }

          .home-header nav {
            width: 100%;
            overflow-x: auto;
            gap: 20px;
            padding-bottom: 3px;
          }

          .home-header nav a {
            white-space: nowrap;
            font-size: 13px;
          }

          .home-header .brand span {
            display: none;
          }

          .hero-copy {
            min-height: 480px;
            padding: 65px 24px;
          }

          .hero-copy h1 {
            font-size: 66px;
          }

          .hero-copy p {
            font-size: 15px;
            line-height: 2;
          }

          .hero-visual {
            min-height: 500px;
          }

          .hero-badge {
            width: 82px;
            height: 82px;
            bottom: 20px;
            left: 20px;
          }

          .hero-badge span {
            font-size: 10px;
          }

          .hero-badge small {
            font-size: 7px;
          }

          .trust-bar {
            grid-template-columns: 1fr 1fr;
          }

          .trust-bar div {
            min-height: 75px;
            padding: 17px 13px;
          }

          .trust-bar span {
            font-size: 11px;
            line-height: 1.6;
          }

          .section {
            padding: 75px 18px;
          }

          .section-heading {
            align-items: flex-start;
            gap: 20px;
          }

          .section-heading h2 {
            font-size: 39px;
          }

          .section-heading > a {
            margin-top: 12px;
            font-size: 12px;
          }

          .premium-grid {
            grid-template-columns: 1fr 1fr;
            gap: 15px;
          }

          .product-meta {
            padding: 14px 2px;
          }

          .product-meta small {
            font-size: 9px;
          }

          .product-meta h3 {
            font-size: 14px;
            line-height: 1.55;
          }

          .product-meta strong {
            font-size: 13px;
          }

          .home-cta {
            min-height: 440px;
            padding: 60px 20px;
          }

          .home-cta h2 {
            font-size: 49px;
          }
        }
      `}</style>

      {/* HEADER */}

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

      {/* HERO */}

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

      {/* TRUST */}

      <section className="trust-bar">

        <div>
          <strong>01</strong>
          <span>جودة مختارة بعناية</span>
        </div>

        <div>
          <strong>02</strong>
          <span>تصميمات مميزة</span>
        </div>

        <div>
          <strong>03</strong>
          <span>دفع آمن عند الاستلام</span>
        </div>

        <div>
          <strong>04</strong>
          <span>شحن لجميع أنحاء مصر</span>
        </div>

      </section>

      {/* COLLECTION */}

      <section className="section collection-section">

        <div className="section-heading">

          <div>
            <small>CURATED COLLECTION</small>

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
            تعذر تحميل المنتجات حاليًا.
            راجع إعدادات Supabase وسجلات الخادم.
          </div>

        ) : (

          <div className="premium-grid">

            {(products || [])
              .slice(0, 8)
              .map((p: any) => (

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

                    <span className="product-arrow">
                      ↗
                    </span>

                  </div>

                  <div className="product-meta">

                    <small>
                      {p.brand?.name || "TIMEA"}
                      {" · "}
                      {p.category?.name || "WATCH"}
                    </small>

                    <h3>{p.name}</h3>

                    <strong>
                      {money(Number(p.price))}
                    </strong>

                  </div>

                </Link>

              ))}

          </div>

        )}

      </section>

      {/* CTA */}

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

    </main>
  );
}
