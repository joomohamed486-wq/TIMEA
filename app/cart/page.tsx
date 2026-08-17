"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type CartItem = {
  id: string;
  productId: string;
  quantity: number;
  product: {
    name: string;
    price: number;
  };
};

type CartData = {
  items?: CartItem[];
};

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
      setCart({ items: [] });
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

  const items = cart?.items ?? [];

  const total = items.reduce((sum, item) => {
    return sum + Number(item.product?.price || 0) * item.quantity;
  }, 0);

  return (
    <main dir="rtl">
      <header className="top">
        <Link href="/" className="brand">
          TIMEA
        </Link>

        <nav>
          <Link href="/shop">المتجر</Link>
        </nav>
      </header>

      <section className="admin">
        <small>SHOPPING BAG</small>

        <h1>السلة</h1>

        <div className="panel">
          {loading ? (
            <p>جاري تحميل السلة...</p>
          ) : items.length === 0 ? (
            <div className="empty-cart">
              <h2>السلة فارغة</h2>

              <p>
                لم تقم بإضافة أي منتجات إلى السلة بعد.
              </p>

              <Link href="/shop" className="btn">
                تصفح المنتجات
              </Link>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {items.map((item) => {
                  const itemTotal =
                    Number(item.product?.price || 0) *
                    item.quantity;

                  return (
                    <div className="row" key={item.id}>
                      <span>
                        {item.product?.name || "منتج"} ×{" "}
                        {item.quantity}
                      </span>

                      <b>
                        {itemTotal.toLocaleString("ar-EG")} ج.م
                      </b>

                      <button
                        type="button"
                        disabled={deleting === item.productId}
                        onClick={() =>
                          removeItem(item.productId)
                        }
                      >
                        {deleting === item.productId
                          ? "جاري الحذف..."
                          : "حذف"}
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="cart-summary">
                <div className="row">
                  <span>الإجمالي</span>

                  <b>
                    {total.toLocaleString("ar-EG")} ج.م
                  </b>
                </div>

                <Link className="btn" href="/checkout">
                  إتمام الطلب
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
