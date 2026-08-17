"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Product = {
  id: string;
  sku?: string;
  name: string;
  slug?: string;
  price: number;
  stock?: number;
  image?: string | null;
};

type CartItem = {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  product: Product | null;
};

type CartData = {
  id?: string;
  items?: CartItem[];
};

function formatMoney(value: number) {
  return `${Number(value || 0).toLocaleString("ar-EG")} ج.م`;
}

export default function Cart() {
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function loadCart() {
    try {
      setLoading(true);

      const response = await fetch("/api/cart", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load cart");
      }

      const data = await response.json();

      setCart(data);
    } catch (error) {
      console.error("Cart loading error:", error);

      setCart({
        items: [],
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCart();
  }, []);

  async function removeItem(productId: string) {
    try {
      setDeleting(productId);

      const response = await fetch("/api/cart", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove item");
      }

      await loadCart();
    } catch (error) {
      console.error("Remove cart item error:", error);
    } finally {
      setDeleting(null);
    }
  }

  const items = (cart?.items ?? []).filter(
    (item) => item.product
  );

  const total = items.reduce((sum, item) => {
    const price = Number(item.product?.price || 0);
    const quantity = Number(item.quantity || 0);

    return sum + price * quantity;
  }, 0);

  return (
    <main className="cart-page" dir="rtl">
      {/* HEADER */}
      <header className="top">
        <Link href="/" className="brand">
          TIMEA
        </Link>

        <nav>
          <Link href="/shop">المتجر</Link>
        </nav>
      </header>

      {/* CONTENT */}
      <section className="cart-container">
        <div className="cart-heading">
          <small>SHOPPING BAG</small>

          <h1>السلة</h1>

          {!loading && items.length > 0 && (
            <p>
              {items.length}{" "}
              {items.length === 1
                ? "منتج"
                : "منتجات"}{" "}
              في السلة
            </p>
          )}
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="cart-message">
            <div className="loader" />
            <p>جاري تحميل السلة...</p>
          </div>
        ) : items.length === 0 ? (
          /* EMPTY */
          <div className="cart-message empty-cart">
            <div className="empty-icon">🛍</div>

            <h2>السلة فارغة</h2>

            <p>
              لم تقم بإضافة أي منتجات إلى السلة بعد.
            </p>

            <Link href="/shop" className="checkout-btn">
              تصفح المنتجات
            </Link>
          </div>
        ) : (
          /* CART */
          <div className="cart-layout">
            {/* PRODUCTS */}
            <section className="cart-products">
              {items.map((item) => {
                const product = item.product!;

                const price = Number(product.price || 0);

                const quantity = Number(
                  item.quantity || 0
                );

                const itemTotal = price * quantity;

                /*
                 * الصورة جاية مباشرة من:
                 * products.image
                 */
                const image =
                  product.image ||
                  "/placeholder-watch.jpg";

                /*
                 * نستخدم slug لو موجود،
                 * وإلا نستخدم id
                 */
                const productUrl = product.slug
                  ? `/products/${product.slug}`
                  : `/products/${product.id}`;

                return (
                  <article
                    className="cart-product"
                    key={item.id}
                  >
                    {/* PRODUCT IMAGE */}
                    <Link
                      href={productUrl}
                      className="product-image"
                    >
                      <img
                        src={image}
                        alt={product.name}
                      />
                    </Link>

                    {/* PRODUCT INFO */}
                    <div className="product-info">
                      <Link
                        href={productUrl}
                        className="product-name"
                      >
                        {product.name}
                      </Link>

                      {product.sku && (
                        <div className="product-sku">
                          SKU: {product.sku}
                        </div>
                      )}

                      <div className="product-price">
                        {formatMoney(price)}
                      </div>

                      <div className="product-quantity">
                        الكمية:
                        <strong>{quantity}</strong>
                      </div>
                    </div>

                    {/* ITEM TOTAL */}
                    <div className="product-total">
                      <span>الإجمالي</span>

                      <strong>
                        {formatMoney(itemTotal)}
                      </strong>
                    </div>

                    {/* DELETE */}
                    <button
                      type="button"
                      className="remove-btn"
                      disabled={
                        deleting === item.product_id
                      }
                      onClick={() =>
                        removeItem(item.product_id)
                      }
                    >
                      {deleting === item.product_id
                        ? "جاري الحذف..."
                        : "حذف"}
                    </button>
                  </article>
                );
              })}
            </section>

            {/* SUMMARY */}
            <aside className="summary">
              <small>ORDER SUMMARY</small>

              <h2>ملخص الطلب</h2>

              <div className="summary-row">
                <span>عدد المنتجات</span>

                <strong>{items.length}</strong>
              </div>

              <div className="summary-row">
                <span>المجموع الفرعي</span>

                <strong>
                  {formatMoney(total)}
                </strong>
              </div>

              <div className="summary-row">
                <span>الشحن</span>

                <span>يُحسب عند الدفع</span>
              </div>

              <div className="divider" />

              <div className="summary-total">
                <span>الإجمالي</span>

                <strong>
                  {formatMoney(total)}
                </strong>
              </div>

              <Link
                href="/checkout"
                className="checkout-btn"
              >
                إتمام الطلب
              </Link>

              <Link
                href="/shop"
                className="continue-shopping"
              >
                ← متابعة التسوق
              </Link>
            </aside>
          </div>
        )}
      </section>

      <style>{`
        .cart-page {
          min-height: 100vh;
          background: #f7f6f2;
          color: #171717;
        }

        .cart-container {
          width: min(1180px, calc(100% - 40px));
          margin: 0 auto;
          padding: 55px 0 90px;
        }

        .cart-heading {
          margin-bottom: 30px;
        }

        .cart-heading small,
        .summary > small {
          letter-spacing: .16em;
          font-size: 11px;
          opacity: .5;
        }

        .cart-heading h1 {
          margin: 8px 0;
          font-size: clamp(38px, 5vw, 58px);
          line-height: 1.1;
          font-weight: 500;
        }

        .cart-heading p {
          margin: 0;
          color: #777;
        }

        /* LAYOUT */

        .cart-layout {
          display: grid;
          grid-template-columns:
            minmax(0, 1fr)
            350px;

          gap: 24px;

          align-items: start;
        }

        .cart-products {
          display: grid;
          gap: 12px;
        }

        /* PRODUCT */

        .cart-product {
          display: grid;

          grid-template-columns:
            120px
            minmax(0, 1fr)
            120px
            auto;

          gap: 20px;

          align-items: center;

          padding: 16px;

          border:
            1px solid
            rgba(0, 0, 0, .08);

          border-radius: 18px;

          background: #fff;

          transition:
            transform .2s ease,
            box-shadow .2s ease;
        }

        .cart-product:hover {
          transform: translateY(-2px);

          box-shadow:
            0 12px 35px
            rgba(0, 0, 0, .06);
        }

        /* IMAGE */

        .product-image {
          width: 120px;
          height: 130px;

          overflow: hidden;

          display: block;

          border-radius: 13px;

          background: #f1f0ec;
        }

        .product-image img {
          width: 100%;
          height: 100%;

          display: block;

          object-fit: cover;

          transition:
            transform .35s ease;
        }

        .product-image:hover img {
          transform: scale(1.06);
        }

        /* INFO */

        .product-name {
          display: block;

          margin-bottom: 7px;

          color: #171717;

          text-decoration: none;

          font-size: 17px;

          font-weight: 600;
        }

        .product-name:hover {
          color: #9a7736;
        }

        .product-sku {
          margin-bottom: 10px;

          color: #999;

          font-size: 11px;

          direction: ltr;

          text-align: right;
        }

        .product-price {
          color: #9a7736;

          font-size: 15px;

          font-weight: 600;
        }

        .product-quantity {
          margin-top: 12px;

          color: #777;

          font-size: 13px;
        }

        .product-quantity strong {
          margin-right: 6px;

          color: #171717;
        }

        /* TOTAL */

        .product-total {
          text-align: center;
        }

        .product-total span {
          display: block;

          margin-bottom: 6px;

          color: #999;

          font-size: 11px;
        }

        .product-total strong {
          font-size: 16px;
        }

        /* DELETE */

        .remove-btn {
          border: 0;

          padding: 8px;

          background: transparent;

          color: #999;

          cursor: pointer;

          font-family: inherit;

          font-size: 12px;

          transition:
            color .2s ease;
        }

        .remove-btn:hover {
          color: #b32626;
        }

        .remove-btn:disabled {
          opacity: .5;

          cursor: wait;
        }

        /* SUMMARY */

        .summary {
          position: sticky;

          top: 25px;

          padding: 28px;

          border:
            1px solid
            rgba(0, 0, 0, .08);

          border-radius: 20px;

          background: #fff;

          box-shadow:
            0 10px 35px
            rgba(0, 0, 0, .04);
        }

        .summary h2 {
          margin: 8px 0 26px;

          font-size: 25px;

          font-weight: 500;
        }

        .summary-row {
          display: flex;

          justify-content: space-between;

          align-items: center;

          gap: 15px;

          margin-bottom: 15px;

          color: #666;

          font-size: 14px;
        }

        .summary-row strong {
          color: #171717;
        }

        .divider {
          height: 1px;

          margin: 22px 0;

          background:
            rgba(0, 0, 0, .08);
        }

        .summary-total {
          display: flex;

          justify-content: space-between;

          align-items: center;

          margin-bottom: 22px;
        }

        .summary-total strong {
          font-size: 22px;
        }

        /* BUTTON */

        .checkout-btn {
          width: 100%;

          min-height: 50px;

          display: flex;

          align-items: center;

          justify-content: center;

          border-radius: 10px;

          background: #171717;

          color: #fff;

          text-decoration: none;

          transition:
            opacity .2s ease,
            transform .2s ease;
        }

        .checkout-btn:hover {
          opacity: .9;

          transform:
            translateY(-1px);
        }

        .continue-shopping {
          display: block;

          margin-top: 17px;

          text-align: center;

          color: #777;

          text-decoration: none;

          font-size: 13px;
        }

        .continue-shopping:hover {
          color: #171717;
        }

        /* EMPTY / LOADING */

        .cart-message {
          min-height: 300px;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;

          padding: 40px 20px;

          text-align: center;

          border:
            1px solid
            rgba(0, 0, 0, .08);

          border-radius: 20px;

          background: #fff;
        }

        .empty-icon {
          margin-bottom: 12px;

          font-size: 42px;
        }

        .empty-cart h2 {
          margin: 8px 0;

          font-size: 24px;
        }

        .empty-cart p {
          margin: 0 0 24px;

          color: #777;
        }

        .loader {
          width: 25px;
          height: 25px;

          margin-bottom: 15px;

          border:
            2px solid
            #ddd;

          border-top-color:
            #171717;

          border-radius: 50%;

          animation:
            spin .7s linear infinite;
        }

        @keyframes spin {
          to {
            transform:
              rotate(360deg);
          }
        }

        /* TABLET */

        @media (max-width: 950px) {
          .cart-layout {
            grid-template-columns: 1fr;
          }

          .summary {
            position: static;
          }
        }

        /* MOBILE */

        @media (max-width: 650px) {
          .cart-container {
            width:
              calc(100% - 24px);

            padding-top: 30px;
          }

          .cart-product {
            grid-template-columns:
              90px
              minmax(0, 1fr);

            gap: 14px;

            padding: 12px;
          }

          .product-image {
            width: 90px;
            height: 105px;
          }

          .product-total {
            grid-column: 2;

            text-align: right;

            display: flex;

            align-items: center;

            justify-content: space-between;
          }

          .product-total span {
            margin: 0;
          }

          .remove-btn {
            grid-column: 2;

            justify-self: start;
          }

          .summary {
            padding: 22px;
          }
        }
      `}</style>
    </main>
  );
}
