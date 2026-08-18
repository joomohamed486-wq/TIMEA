"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
};

export default function HeroSlider({
  products,
}: {
  products: Product[];
}) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (products.length <= 1) return;

    const timer = setInterval(() => {
      setActive(
        (current) => (current + 1) % products.length
      );
    }, 5000);

    return () => clearInterval(timer);
  }, [products.length]);

  const product = products[active];

  if (!product) return null;

  return (
    <div className="hero-slider">

      {products.map((item, index) => (
        <div
          key={item.id}
          className={`hero-slide ${
            index === active ? "active" : ""
          }`}
        >
          <img
            src={item.image}
            alt={item.name}
          />
        </div>
      ))}

      <div className="hero-product-info">

        <small>ساعة مميزة من TIMEA</small>

        <h2>{product.name}</h2>

        <div className="hero-price">
          {Number(product.price).toLocaleString("ar-EG")}
          {" "}ج.م
        </div>

        <Link
          href={`/products/${product.slug}`}
        >
          اكتشف الساعة
          <span>←</span>
        </Link>

      </div>

      <div className="hero-dots">

        {products.map((item, index) => (
          <button
            key={item.id}
            type="button"
            aria-label={`عرض ${item.name}`}
            className={
              index === active ? "active" : ""
            }
            onClick={() => setActive(index)}
          />
        ))}

      </div>

      <style jsx>{`

        .hero-slider {
          position: absolute;
          inset: 0;
          overflow: hidden;
          background: #ddd;
          font-family: "Cairo", Arial, sans-serif;
        }

        .hero-slide {
          position: absolute;
          inset: 0;
          opacity: 0;
          transform: scale(1.06);

          transition:
            opacity 1.4s ease,
            transform 6s cubic-bezier(.2,.7,.2,1);

          pointer-events: none;
        }

        .hero-slide.active {
          opacity: 1;
          transform: scale(1);
          z-index: 2;
        }

        .hero-slide::after {
          content: "";
          position: absolute;
          inset: 0;

          background:
            linear-gradient(
              180deg,
              rgba(0,0,0,.02) 25%,
              rgba(0,0,0,.68) 100%
            );
        }

        .hero-slide img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
        }

        /* PRODUCT INFORMATION */

        .hero-product-info {
          position: absolute;
          z-index: 5;

          right: 48px;
          bottom: 48px;

          color: white;

          max-width: 380px;

          text-align: right;
        }

        .hero-product-info small {
          display: block;

          margin-bottom: 9px;

          font-size: 13px;
          line-height: 1.7;

          font-weight: 500;

          color: rgba(255,255,255,.78);
        }

        .hero-product-info h2 {
          margin: 0 0 7px;

          font-size: clamp(25px, 3vw, 38px);

          line-height: 1.4;

          font-weight: 600;

          letter-spacing: -.02em;
        }

        .hero-price {
          margin-bottom: 17px;

          font-size: 17px;

          font-weight: 600;

          color: rgba(255,255,255,.92);
        }

        .hero-product-info a {
          display: inline-flex;

          align-items: center;

          gap: 18px;

          color: white;

          text-decoration: none;

          font-size: 14px;

          font-weight: 600;

          border-bottom:
            1px solid
            rgba(255,255,255,.65);

          padding-bottom: 6px;

          transition:
            gap .25s ease,
            border-color .25s ease;
        }

        .hero-product-info a:hover {
          gap: 24px;
          border-color: white;
        }

        .hero-product-info a span {
          font-size: 18px;
        }

        /* DOTS */

        .hero-dots {
          position: absolute;

          z-index: 10;

          left: 38px;
          bottom: 42px;

          display: flex;

          align-items: center;

          gap: 8px;
        }

        .hero-dots button {
          width: 7px;
          height: 7px;

          padding: 0;

          border: 0;

          border-radius: 50%;

          background:
            rgba(255,255,255,.55);

          cursor: pointer;

          transition:
            width .3s ease,
            background .3s ease;
        }

        .hero-dots button.active {
          width: 28px;

          border-radius: 10px;

          background: white;
        }

        /* MOBILE */

        @media (max-width: 600px) {

          .hero-product-info {
            right: 22px;
            bottom: 30px;

            max-width: 280px;
          }

          .hero-product-info small {
            font-size: 11px;
          }

          .hero-product-info h2 {
            font-size: 24px;
            line-height: 1.45;
          }

          .hero-price {
            font-size: 15px;
            margin-bottom: 12px;
          }

          .hero-product-info a {
            font-size: 12px;
          }

          .hero-dots {
            left: 20px;
            bottom: 28px;
          }

        }

      `}</style>

    </div>
  );
}
