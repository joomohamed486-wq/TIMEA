"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type CartProduct = {
  id: string;
  name: string;
  price: number;
  image?: string | null;
  slug?: string;
};

type CartItem = {
  id: string;
  product_id: string;
  quantity: number;
  product: CartProduct | null;
};

type CartData = {
  items?: CartItem[];
};

type Address = {
  country: string;
  city: string;
  address: string;
  phone: string;
};

function money(value: number) {
  return `${Number(value || 0).toLocaleString("ar-EG")} ج.م`;
}

export default function Checkout() {
  const router = useRouter();

  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [address, setAddress] = useState<Address>({
    country: "مصر",
    city: "",
    address: "",
    phone: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCart() {
      try {
        const response = await fetch("/api/cart", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("تعذر تحميل السلة");
        }

        const data = await response.json();

        setCart(data);
      } catch (err) {
        console.error(err);
        setError("تعذر تحميل السلة حاليًا.");
      } finally {
        setLoading(false);
      }
    }

    loadCart();
  }, []);

  const items = (cart?.items || []).filter(
    (item) => item.product
  );

  const subtotal = items.reduce((sum, item) => {
    const price = Number(item.product?.price || 0);

    return (
      sum +
      price * Number(item.quantity || 0)
    );
  }, 0);

  const shipping = 0;
  const total = subtotal + shipping;

  function updateField(
    field: keyof Address,
    value: string
  ) {
    setAddress((prev) => ({
      ...prev,
      [field]: value,
    }));

    setError("");
  }

  function validate() {
    if (!address.city.trim()) {
      setError("من فضلك اكتب المدينة.");
      return false;
    }

    if (!address.address.trim()) {
      setError("من فضلك اكتب العنوان بالتفصيل.");
      return false;
    }

    if (!address.phone.trim()) {
      setError("من فضلك اكتب رقم الهاتف.");
      return false;
    }

    const phone = address.phone.replace(/\s/g, "");

    if (!/^01[0-9]{9}$/.test(phone)) {
      setError(
        "من فضلك أدخل رقم هاتف مصري صحيح مكون من 11 رقم."
      );
      return false;
    }

    if (items.length === 0) {
      setError("السلة فارغة. أضف منتجًا أولًا.");
      return false;
    }

    return true;
  }

  async function submitOrder() {
    if (submitting) return;

    setError("");
    setMessage("");

    if (!validate()) return;

    try {
      setSubmitting(true);

      const response = await fetch("/api/orders", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.product_id,
            quantity: item.quantity,
          })),

          shippingAddress: {
            country: address.country,
            city: address.city.trim(),
            address: address.address.trim(),
            phone: address.phone.trim(),
          },

          paymentMethod: "COD",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("تم إنشاء طلبك بنجاح.");

        setTimeout(() => {
          router.push("/account");
        }, 700);

        return;
      }

      if (data.error === "LOGIN_REQUIRED") {
        router.push(
          `/login?next=/checkout`
        );
        return;
      }

      setError(
        data.error ||
          "تعذر إنشاء الطلب، حاول مرة أخرى."
      );
    } catch (err) {
      console.error("Checkout error:", err);

      setError(
        "حدث خطأ أثناء إنشاء الطلب. تأكد من اتصال الإنترنت وحاول مرة أخرى."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main
        className="checkout-page"
        dir="rtl"
      >
        <div className="checkout-loading">
          <div className="loader" />
          <p>جاري تجهيز الطلب...</p>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main
        className="checkout-page"
        dir="rtl"
      >
        <header className="checkout-header">
          <Link
            href="/"
            className="brand"
          >
            TIMEA
          </Link>

          <Link
            href="/cart"
            className="back-link"
          >
            العودة إلى السلة
          </Link>
        </header>

        <section className="empty-checkout">
          <div className="empty-icon">
            🛍
          </div>

          <h1>السلة فارغة</h1>

          <p>
            لا يمكنك إتمام الطلب بدون وجود
            منتجات في السلة.
          </p>

          <Link
            href="/shop"
            className="primary-button"
          >
            العودة إلى المتجر
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main
      className="checkout-page"
      dir="rtl"
    >
      {/* HEADER */}

      <header className="checkout-header">
        <Link
          href="/"
          className="brand"
        >
          TIMEA
        </Link>

        <div className="checkout-steps">
          <span className="step done">
            السلة
          </span>

          <span className="line" />

          <span className="step active">
            بيانات الشحن
          </span>

          <span className="line" />

          <span className="step">
            تأكيد الطلب
          </span>
        </div>

        <Link
          href="/cart"
          className="back-link"
        >
          ← العودة للسلة
        </Link>
      </header>

      {/* MAIN */}

      <section className="checkout-container">
        <div className="checkout-title">
          <small>CHECKOUT</small>

          <h1>إتمام الطلب</h1>

          <p>
            أدخل بيانات التوصيل لإتمام طلبك.
          </p>
        </div>

        <div className="checkout-layout">
          {/* CUSTOMER DATA */}

          <section className="checkout-form">
            <div className="card">
              <div className="card-title">
                <span className="number">
                  01
                </span>

                <div>
                  <h2>
                    بيانات التوصيل
                  </h2>

                  <p>
                    أين نرسل طلبك؟
                  </p>
                </div>
              </div>

              <div className="form-grid">
                <label>
                  <span>
                    الدولة
                  </span>

                  <input
                    value={address.country}
                    disabled
                  />
                </label>

                <label>
                  <span>
                    المدينة
                    <b>*</b>
                  </span>

                  <input
                    value={address.city}
                    onChange={(e) =>
                      updateField(
                        "city",
                        e.target.value
                      )
                    }
                    placeholder="مثال: القاهرة"
                    autoComplete="address-level2"
                  />
                </label>

                <label className="full">
                  <span>
                    العنوان بالتفصيل
                    <b>*</b>
                  </span>

                  <textarea
                    value={address.address}
                    onChange={(e) =>
                      updateField(
                        "address",
                        e.target.value
                      )
                    }
                    placeholder="اسم الشارع، رقم العقار، الدور، الشقة..."
                    rows={4}
                    autoComplete="street-address"
                  />
                </label>

                <label className="full">
                  <span>
                    رقم الهاتف
                    <b>*</b>
                  </span>

                  <input
                    type="tel"
                    value={address.phone}
                    onChange={(e) =>
                      updateField(
                        "phone",
                        e.target.value
                      )
                    }
                    placeholder="01XXXXXXXXX"
                    inputMode="numeric"
                    dir="ltr"
                    autoComplete="tel"
                  />

                  <small>
                    سنستخدم الرقم للتواصل معك
                    بخصوص التوصيل.
                  </small>
                </label>
              </div>
            </div>

            {/* PAYMENT */}

            <div className="card">
              <div className="card-title">
                <span className="number">
                  02
                </span>

                <div>
                  <h2>
                    طريقة الدفع
                  </h2>

                  <p>
                    اختر طريقة الدفع المناسبة
                    لك.
                  </p>
                </div>
              </div>

              <div className="payment-option selected">
                <div className="payment-radio">
                  <span />
                </div>

                <div className="payment-info">
                  <strong>
                    الدفع عند الاستلام
                  </strong>

                  <span>
                    ادفع قيمة الطلب عند
                    استلامه.
                  </span>
                </div>

                <div className="payment-icon">
                  💵
                </div>
              </div>
            </div>

            {/* ERROR */}

            {error && (
              <div className="error-box">
                <span>!</span>

                <p>{error}</p>
              </div>
            )}

            {/* SUCCESS */}

            {message && (
              <div className="success-box">
                <span>✓</span>

                <p>{message}</p>
              </div>
            )}

            {/* MOBILE ORDER BUTTON */}

            <button
              type="button"
              className="mobile-submit"
              disabled={submitting}
              onClick={submitOrder}
            >
              {submitting
                ? "جاري إنشاء الطلب..."
                : `تأكيد الطلب — ${money(total)}`}
            </button>
          </section>

          {/* ORDER SUMMARY */}

          <aside className="order-summary">
            <div className="summary-card">
              <div className="summary-header">
                <div>
                  <small>
                    YOUR ORDER
                  </small>

                  <h2>
                    ملخص الطلب
                  </h2>
                </div>

                <Link href="/cart">
                  تعديل
                </Link>
              </div>

              <div className="summary-products">
                {items.map((item) => {
                  const product =
                    item.product!;

                  const image =
                    product.image ||
                    "/placeholder-watch.jpg";

                  const price =
                    Number(
                      product.price || 0
                    );

                  const quantity =
                    Number(
                      item.quantity || 0
                    );

                  return (
                    <div
                      className="summary-product"
                      key={item.id}
                    >
                      <div className="summary-image">
                        <img
                          src={image}
                          alt={product.name}
                        />

                        <span>
                          {quantity}
                        </span>
                      </div>

                      <div className="summary-product-info">
                        <strong>
                          {product.name}
                        </strong>

                        <span>
                          {money(price)}
                        </span>
                      </div>

                      <b>
                        {money(
                          price *
                            quantity
                        )}
                      </b>
                    </div>
                  );
                })}
              </div>

              <div className="summary-divider" />

              <div className="price-row">
                <span>
                  المجموع الفرعي
                </span>

                <strong>
                  {money(subtotal)}
                </strong>
              </div>

              <div className="price-row">
                <span>
                  الشحن
                </span>

                <strong className="free">
                  مجانًا
                </strong>
              </div>

              <div className="summary-divider" />

              <div className="final-total">
                <span>
                  إجمالي الطلب
                </span>

                <strong>
                  {money(total)}
                </strong>
              </div>

              <button
                type="button"
                className="submit-button"
                disabled={submitting}
                onClick={submitOrder}
              >
                {submitting ? (
                  <>
                    <span className="button-loader" />
                    جاري إنشاء الطلب...
                  </>
                ) : (
                  <>
                    تأكيد الطلب
                    <span>
                      {money(total)}
                    </span>
                  </>
                )}
              </button>

              <div className="secure-note">
                <span>🔒</span>

                <p>
                  بياناتك محمية ويتم استخدام
                  المعلومات فقط لتنفيذ طلبك.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <style>{`
        .checkout-page {
          min-height: 100vh;
          background: #f7f6f2;
          color: #171717;
        }

        /* HEADER */

        .checkout-header {
          min-height: 74px;
          padding: 0 5%;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 25px;
          border-bottom: 1px solid rgba(0,0,0,.07);
          background: rgba(255,255,255,.7);
        }

        .brand {
          color: #171717;
          text-decoration: none;
          font-size: 24px;
          letter-spacing: .18em;
          font-weight: 600;
        }

        .back-link {
          justify-self: end;
          color: #666;
          text-decoration: none;
          font-size: 13px;
        }

        .back-link:hover {
          color: #171717;
        }

        .checkout-steps {
          display: flex;
          align-items: center;
          gap: 12px;
          direction: rtl;
          font-size: 12px;
        }

        .step {
          color: #aaa;
          white-space: nowrap;
        }

        .step.done {
          color: #555;
        }

        .step.active {
          color: #171717;
          font-weight: 600;
        }

        .line {
          width: 35px;
          height: 1px;
          background: #ddd;
        }

        /* CONTAINER */

        .checkout-container {
          width: min(1160px, calc(100% - 40px));
          margin: auto;
          padding: 50px 0 90px;
        }

        .checkout-title {
          margin-bottom: 32px;
        }

        .checkout-title small {
          letter-spacing: .16em;
          font-size: 11px;
          opacity: .5;
        }

        .checkout-title h1 {
          margin: 8px 0;
          font-size: clamp(38px, 5vw, 56px);
          font-weight: 500;
          line-height: 1.1;
        }

        .checkout-title p {
          margin: 0;
          color: #777;
        }

        /* LAYOUT */

        .checkout-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 380px;
          gap: 24px;
          align-items: start;
        }

        .checkout-form {
          display: grid;
          gap: 18px;
        }

        /* CARD */

        .card {
          padding: 28px;
          border: 1px solid rgba(0,0,0,.08);
          border-radius: 20px;
          background: #fff;
        }

        .card-title {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 25px;
        }

        .number {
          width: 38px;
          height: 38px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #171717;
          color: #fff;
          font-size: 12px;
        }

        .card-title h2 {
          margin: 0 0 4px;
          font-size: 20px;
          font-weight: 500;
        }

        .card-title p {
          margin: 0;
          color: #888;
          font-size: 12px;
        }

        /* FORM */

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }

        label {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        label.full {
          grid-column: 1 / -1;
        }

        label > span {
          font-size: 13px;
          font-weight: 500;
        }

        label > span b {
          margin-right: 4px;
          color: #a52a2a;
        }

        label > small {
          color: #999;
          font-size: 11px;
        }

        input,
        textarea {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #ddd;
          border-radius: 10px;
          padding: 13px 14px;
          outline: none;
          background: #fff;
          color: #171717;
          font-family: inherit;
          font-size: 14px;
          transition:
            border-color .2s ease,
            box-shadow .2s ease;
        }

        input {
          height: 48px;
        }

        textarea {
          resize: vertical;
          min-height: 105px;
        }

        input:focus,
        textarea:focus {
          border-color: #171717;
          box-shadow: 0 0 0 3px rgba(0,0,0,.05);
        }

        input:disabled {
          background: #f5f4f1;
          color: #777;
          cursor: not-allowed;
        }

        /* PAYMENT */

        .payment-option {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 17px;
          border: 1px solid #ddd;
          border-radius: 13px;
          background: #fafaf8;
        }

        .payment-option.selected {
          border-color: #171717;
          background: #fff;
        }

        .payment-radio {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #171717;
          border-radius: 50%;
        }

        .payment-radio span {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #171717;
        }

        .payment-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
        }

        .payment-info strong {
          font-size: 14px;
        }

        .payment-info span {
          color: #888;
          font-size: 12px;
        }

        .payment-icon {
          font-size: 22px;
        }

        /* SUMMARY */

        .order-summary {
          position: sticky;
          top: 20px;
        }

        .summary-card {
          padding: 26px;
          border: 1px solid rgba(0,0,0,.08);
          border-radius: 20px;
          background: #fff;
          box-shadow: 0 12px 40px rgba(0,0,0,.05);
        }

        .summary-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 24px;
        }

        .summary-header small {
          color: #999;
          letter-spacing: .15em;
          font-size: 10px;
        }

        .summary-header h2 {
          margin: 6px 0 0;
          font-size: 22px;
          font-weight: 500;
        }

        .summary-header a {
          color: #777;
          font-size: 12px;
          text-decoration: underline;
        }

        /* PRODUCTS */

        .summary-products {
          display: grid;
          gap: 17px;
        }

        .summary-product {
          display: grid;
          grid-template-columns: 62px minmax(0,1fr) auto;
          align-items: center;
          gap: 12px;
        }

        .summary-image {
          position: relative;
          width: 62px;
          height: 68px;
          overflow: visible;
          border-radius: 9px;
          background: #f2f1ed;
        }

        .summary-image img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          border-radius: 9px;
        }

        .summary-image > span {
          position: absolute;
          top: -7px;
          left: -7px;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #171717;
          color: #fff;
          font-size: 10px;
        }

        .summary-product-info {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .summary-product-info strong {
          overflow: hidden;
          color: #222;
          font-size: 13px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .summary-product-info span {
          color: #888;
          font-size: 12px;
        }

        .summary-product > b {
          font-size: 13px;
          white-space: nowrap;
        }

        .summary-divider {
          height: 1px;
          margin: 22px 0;
          background: rgba(0,0,0,.08);
        }

        /* PRICES */

        .price-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 14px;
          color: #666;
          font-size: 13px;
        }

        .price-row strong {
          color: #171717;
        }

        .price-row .free {
          color: #36734b;
        }

        .final-total {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 22px;
        }

        .final-total span {
          font-size: 15px;
          font-weight: 500;
        }

        .final-total strong {
          font-size: 23px;
        }

        /* SUBMIT */

        .submit-button,
        .mobile-submit {
          width: 100%;
          min-height: 54px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 0 18px;
          border: 0;
          border-radius: 11px;
          background: #171717;
          color: #fff;
          cursor: pointer;
          font-family: inherit;
          font-size: 14px;
          transition:
            opacity .2s ease,
            transform .2s ease;
        }

        .submit-button span:not(.button-loader) {
          opacity: .8;
          font-size: 13px;
        }

        .submit-button:hover:not(:disabled),
        .mobile-submit:hover:not(:disabled) {
          opacity: .9;
          transform: translateY(-1px);
        }

        .submit-button:disabled,
        .mobile-submit:disabled {
          opacity: .6;
          cursor: wait;
        }

        .button-loader {
          width: 17px;
          height: 17px;
          flex-shrink: 0;
          border: 2px solid rgba(255,255,255,.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin .7s linear infinite;
        }

        .secure-note {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          margin-top: 17px;
          color: #999;
          font-size: 10px;
          line-height: 1.6;
        }

        .secure-note p {
          margin: 0;
        }

        /* ERRORS */

        .error-box,
        .success-box {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 16px;
          border-radius: 11px;
          font-size: 13px;
        }

        .error-box {
          border: 1px solid #efd2d2;
          background: #fff6f6;
          color: #a52a2a;
        }

        .success-box {
          border: 1px solid #d3e9d9;
          background: #f4fbf5;
          color: #327044;
        }

        .error-box span,
        .success-box span {
          width: 23px;
          height: 23px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          font-weight: bold;
        }

        .error-box span {
          background: #a52a2a;
          color: #fff;
        }

        .success-box span {
          background: #327044;
          color: #fff;
        }

        .error-box p,
        .success-box p {
          margin: 0;
        }

        .mobile-submit {
          display: none;
        }

        /* LOADING */

        .checkout-loading {
          min-height: 70vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #777;
        }

        .loader {
          width: 28px;
          height: 28px;
          margin-bottom: 15px;
          border: 2px solid #ddd;
          border-top-color: #171717;
          border-radius: 50%;
          animation: spin .7s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* EMPTY */

        .empty-checkout {
          min-height: 65vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .empty-checkout .empty-icon {
          font-size: 45px;
          margin-bottom: 15px;
        }

        .empty-checkout h1 {
          margin: 0 0 8px;
          font-size: 34px;
          font-weight: 500;
        }

        .empty-checkout p {
          margin: 0 0 25px;
          color: #777;
        }

        .primary-button {
          min-height: 48px;
          padding: 0 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
          background: #171717;
          color: #fff;
          text-decoration: none;
          font-size: 13px;
        }

        /* TABLET */

        @media (max-width: 950px) {
          .checkout-header {
            grid-template-columns: 1fr 1fr;
          }

          .checkout-steps {
            display: none;
          }

          .checkout-layout {
            grid-template-columns: 1fr;
          }

          .order-summary {
            position: static;
            grid-row: 1;
          }

          .checkout-form {
            grid-row: 2;
          }
        }

        /* MOBILE */

        @media (max-width: 600px) {
          .checkout-header {
            min-height: 65px;
            padding: 0 18px;
          }

          .checkout-container {
            width: calc(100% - 24px);
            padding: 30px 0 60px;
          }

          .checkout-title {
            margin-bottom: 22px;
          }

          .checkout-title h1 {
            font-size: 38px;
          }

          .card {
            padding: 20px;
            border-radius: 16px;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          label.full {
            grid-column: auto;
          }

          .summary-card {
            padding: 20px;
            border-radius: 16px;
          }

          .submit-button {
            display: none;
          }

          .mobile-submit {
            display: flex;
          }

          .back-link {
            font-size: 11px;
          }

          .brand {
            font-size: 20px;
          }
        }
      `}</style>
    </main>
  );
}
