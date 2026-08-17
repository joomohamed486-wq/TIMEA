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
      setActive((current) => {
        return (current + 1) % products.length;
      });
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
            index === active
              ? "active"
              : ""
          }`}
        >
          <img
            src={item.image}
            alt={item.name}
          />
        </div>
      ))}

      <div className="hero-product-info">

        <small>
          FEATURED WATCH
        </small>

        <h2>
          {product.name}
        </h2>

        <Link
          href={`/products/${product.slug}`}
        >
          اكتشف الساعة →
        </Link>

      </div>

      <div className="hero-dots">

        {products.map((item, index) => (
          <button
            key={item.id}
            type="button"
            aria-label={`عرض ${item.name}`}
            className={
              index === active
                ? "active"
                : ""
            }
            onClick={() =>
              setActive(index)
            }
          />
        ))}

      </div>

      <style>{`

        .hero-slider {
          position: absolute;
          inset: 0;
          overflow: hidden;
          background: #ddd;
        }

        .hero-slide {
          position: absolute;
          inset: 0;
          opacity: 0;
          transform: scale(1.06);
          transition:
            opacity 1.3s ease,
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
              rgba(0,0,0,.03) 30%,
              rgba(0,0,0,.52) 100%
            );
        }

        .hero-slide img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
        }

        .hero-product-info {
          position: absolute;
          z-index: 5;
          right: 45px;
          bottom: 45px;
          color: white;
        }

        .hero-product-info small {
          display: block;
          margin-bottom: 8px;
          font-size: 9px;
          letter-spacing: .18em;
          opacity: .75;
        }

        .hero-product-info h2 {
          margin: 0 0 10px;
          font-size: 28px;
          font-weight: 400;
        }

        .hero-product-info a {
          color: white;
          text-decoration: none;
          font-size: 12px;
          border-bottom: 1px solid rgba(255,255,255,.6);
          padding-bottom: 4px;
        }

        .hero-dots {
          position: absolute;
          z-index: 10;
          left: 35px;
          bottom: 40px;
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .hero-dots button {
          width: 6px;
          height: 6px;
          padding: 0;
          border: 0;
          border-radius: 50%;
          background: rgba(255,255,255,.5);
          cursor: pointer;
          transition:
            width .3s ease,
            background .3s ease;
        }

        .hero-dots button.active {
          width: 25px;
          border-radius: 10px;
          background: white;
        }

        @media (max-width: 600px) {

          .hero-product-info {
            right: 22px;
            bottom: 28px;
          }

          .hero-product-info h2 {
            font-size: 22px;
          }

          .hero-dots {
            left: 20px;
            bottom: 25px;
          }

        }

      `}</style>

    </div>
  );
}
