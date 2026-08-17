import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/app/LogoutButton";

function formatMoney(value: unknown) {
  return `${Number(value || 0).toLocaleString("ar-EG")} ج.م`;
}

function formatDate(value: string) {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function statusLabel(status: string) {
  const statuses: Record<string, string> = {
    NEW: "جديد",
    CONFIRMED: "مؤكد",
    PROCESSING: "قيد التجهيز",
    PACKED: "تم التغليف",
    SHIPPED: "تم الشحن",
    DELIVERED: "تم التسليم",
    CANCELLED: "ملغي",
    RETURNED: "مرتجع",
    REFUNDED: "مسترد",
  };

  return statuses[status] || status || "غير محدد";
}

function statusClass(status: string) {
  const classes: Record<string, string> = {
    NEW: "status-new",
    CONFIRMED: "status-confirmed",
    PROCESSING: "status-processing",
    PACKED: "status-packed",
    SHIPPED: "status-shipped",
    DELIVERED: "status-delivered",
    CANCELLED: "status-cancelled",
    RETURNED: "status-returned",
    REFUNDED: "status-refunded",
  };

  return classes[status] || "status-default";
}

export default async function Account() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/account");
  }

  const [{ data: profile }, { data: orders }] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single(),

    supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const userName = profile?.name || "عميل TIMEA";
  const userEmail = user.email || "";

  const orderList = orders || [];

  const totalSpent = orderList.reduce(
    (sum: number, order: any) => sum + Number(order.total || 0),
    0
  );

  const deliveredOrders = orderList.filter(
    (order: any) => order.status === "DELIVERED"
  ).length;

  return (
    <main className="account-page" dir="rtl">
      {/* Header */}
      <header className="top account-header">
        <Link href="/" className="brand">
          TIMEA
        </Link>

        <nav className="account-nav">
          <Link href="/">الرئيسية</Link>
          <Link href="/shop">المتجر</Link>
          <Link href="/cart">السلة</Link>

          <LogoutButton />
        </nav>
      </header>

      <section className="account-container">
        {/* Hero */}
        <div className="account-hero">
          <div>
            <small>MY ACCOUNT</small>

            <h1>
              مرحبًا،{" "}
              <span>{userName}</span>
            </h1>

            <p>
              أهلاً بك في حسابك على TIMEA. من هنا يمكنك متابعة طلباتك
              ومراجعة مشترياتك.
            </p>
          </div>

          <div className="account-avatar">
            {userName.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Stats */}
        <div className="account-stats">
          <div className="account-stat">
            <span>إجمالي الطلبات</span>
            <strong>{orderList.length}</strong>
          </div>

          <div className="account-stat">
            <span>الطلبات المكتملة</span>
            <strong>{deliveredOrders}</strong>
          </div>

          <div className="account-stat">
            <span>إجمالي المشتريات</span>
            <strong>{formatMoney(totalSpent)}</strong>
          </div>
        </div>

        {/* Profile */}
        <section className="account-card">
          <div className="account-card-header">
            <div>
              <small>PROFILE</small>
              <h2>بيانات الحساب</h2>
            </div>
          </div>

          <div className="profile-grid">
            <div className="profile-field">
              <span>الاسم</span>
              <strong>{userName}</strong>
            </div>

            <div className="profile-field">
              <span>البريد الإلكتروني</span>
              <strong>{userEmail}</strong>
            </div>

            <div className="profile-field">
              <span>رقم الهاتف</span>
              <strong>{profile?.phone || "غير مضاف"}</strong>
            </div>

            <div className="profile-field">
              <span>نوع الحساب</span>
              <strong>عميل TIMEA</strong>
            </div>
          </div>
        </section>

        {/* Orders */}
        <section className="account-card orders-card">
          <div className="account-card-header">
            <div>
              <small>ORDER HISTORY</small>
              <h2>طلباتي</h2>
            </div>

            <Link href="/shop" className="account-action">
              مواصلة التسوق
            </Link>
          </div>

          {orderList.length === 0 ? (
            <div className="empty-orders">
              <div className="empty-icon">🛍</div>

              <h3>لا توجد طلبات حتى الآن</h3>

              <p>
                لم تقم بإجراء أي طلب بعد. اكتشف مجموعتنا واختر ساعتك
                المفضلة.
              </p>

              <Link href="/shop" className="btn">
                تصفح المتجر
              </Link>
            </div>
          ) : (
            <div className="orders-list">
              {orderList.map((order: any) => (
                <div className="order-card" key={order.id}>
                  <div className="order-main">
                    <div className="order-number">
                      <span>رقم الطلب</span>

                      <strong>#{order.order_number}</strong>
                    </div>

                    <div className="order-date">
                      <span>التاريخ</span>

                      <strong>
                        {formatDate(order.created_at)}
                      </strong>
                    </div>

                    <div className="order-status">
                      <span>الحالة</span>

                      <em className={statusClass(order.status)}>
                        {statusLabel(order.status)}
                      </em>
                    </div>

                    <div className="order-total">
                      <span>الإجمالي</span>

                      <strong>
                        {formatMoney(order.total)}
                      </strong>
                    </div>
                  </div>

                  <div className="order-footer">
                    <span>
                      طريقة الدفع:{" "}
                      {order.payment_method || "غير محددة"}
                    </span>

                    <span>
                      الدفع:{" "}
                      {order.payment_status === "PAID"
                        ? "تم الدفع"
                        : order.payment_status === "PENDING"
                        ? "معلق"
                        : order.payment_status || "غير محدد"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </section>

      <style>{`
        .account-page {
          min-height: 100vh;
          background:
            radial-gradient(circle at top right, rgba(201, 167, 98, 0.08), transparent 30%),
            #f7f6f2;
          color: #171717;
        }

        .account-header {
          border-bottom: 1px solid rgba(0,0,0,.08);
        }

        .account-nav {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .account-nav a {
          color: inherit;
          text-decoration: none;
          transition: opacity .2s ease;
        }

        .account-nav a:hover {
          opacity: .55;
        }

        .account-container {
          width: min(1180px, calc(100% - 40px));
          margin: 0 auto;
          padding: 55px 0 90px;
        }

        .account-hero {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 30px;
          padding: 45px;
          margin-bottom: 20px;
          border: 1px solid rgba(0,0,0,.08);
          border-radius: 24px;
          background: #fff;
          box-shadow: 0 12px 40px rgba(0,0,0,.04);
        }

        .account-hero small,
        .account-card-header small {
          letter-spacing: .16em;
          font-size: 11px;
          opacity: .55;
        }

        .account-hero h1 {
          margin: 10px 0;
          font-size: clamp(32px, 5vw, 52px);
          line-height: 1.1;
          font-weight: 600;
        }

        .account-hero h1 span {
          color: #9a7736;
        }

        .account-hero p {
          max-width: 650px;
          margin: 0;
          line-height: 1.9;
          color: #666;
        }

        .account-avatar {
          width: 86px;
          height: 86px;
          flex: 0 0 86px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #171717;
          color: #fff;
          font-size: 32px;
          font-weight: 600;
        }

        .account-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 20px;
        }

        .account-stat {
          padding: 25px;
          border: 1px solid rgba(0,0,0,.08);
          border-radius: 18px;
          background: #fff;
        }

        .account-stat span {
          display: block;
          margin-bottom: 10px;
          color: #777;
          font-size: 13px;
        }

        .account-stat strong {
          font-size: 25px;
        }

        .account-card {
          padding: 30px;
          margin-bottom: 20px;
          border: 1px solid rgba(0,0,0,.08);
          border-radius: 22px;
          background: #fff;
          box-shadow: 0 8px 30px rgba(0,0,0,.025);
        }

        .account-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 25px;
        }

        .account-card-header h2 {
          margin: 7px 0 0;
          font-size: 25px;
        }

        .profile-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }

        .profile-field {
          padding: 18px;
          border-radius: 14px;
          background: #f8f8f6;
        }

        .profile-field span {
          display: block;
          margin-bottom: 7px;
          color: #777;
          font-size: 12px;
        }

        .profile-field strong {
          display: block;
          word-break: break-word;
        }

        .account-action {
          color: #9a7736;
          text-decoration: none;
          font-size: 14px;
        }

        .orders-list {
          display: grid;
          gap: 12px;
        }

        .order-card {
          overflow: hidden;
          border: 1px solid rgba(0,0,0,.07);
          border-radius: 16px;
          background: #fafaf8;
        }

        .order-main {
          display: grid;
          grid-template-columns: 1.2fr 1.5fr 1fr 1fr;
          align-items: center;
          gap: 20px;
          padding: 22px;
        }

        .order-main > div span {
          display: block;
          margin-bottom: 6px;
          color: #888;
          font-size: 11px;
        }

        .order-main strong {
          font-size: 14px;
        }

        .order-total strong {
          font-size: 18px;
        }

        .order-status em {
          display: inline-block;
          padding: 6px 11px;
          border-radius: 999px;
          font-size: 12px;
          font-style: normal;
          background: #eee;
        }

        .status-new {
          background: #fff3d6 !important;
          color: #8a651e;
        }

        .status-confirmed,
        .status-processing,
        .status-packed {
          background: #e9f0ff !important;
          color: #365b9a;
        }

        .status-shipped {
          background: #eee8ff !important;
          color: #6846a3;
        }

        .status-delivered {
          background: #e4f5e9 !important;
          color: #287344;
        }

        .status-cancelled,
        .status-returned,
        .status-refunded {
          background: #fde8e8 !important;
          color: #a13d3d;
        }

        .order-footer {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          padding: 13px 22px;
          border-top: 1px solid rgba(0,0,0,.06);
          color: #777;
          font-size: 12px;
        }

        .empty-orders {
          padding: 60px 20px;
          text-align: center;
          border: 1px dashed rgba(0,0,0,.15);
          border-radius: 18px;
        }

        .empty-icon {
          margin-bottom: 10px;
          font-size: 38px;
        }

        .empty-orders h3 {
          margin: 8px 0;
          font-size: 21px;
        }

        .empty-orders p {
          max-width: 500px;
          margin: 0 auto 22px;
          color: #777;
          line-height: 1.8;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 44px;
          padding: 0 22px;
          border-radius: 10px;
          background: #171717;
          color: #fff;
          text-decoration: none;
          transition: transform .2s ease, opacity .2s ease;
        }

        .btn:hover {
          transform: translateY(-1px);
          opacity: .9;
        }

        @media (max-width: 800px) {
          .account-container {
            width: min(100% - 24px, 1180px);
            padding-top: 25px;
          }

          .account-hero {
            padding: 28px 22px;
          }

          .account-stats {
            grid-template-columns: 1fr;
          }

          .profile-grid {
            grid-template-columns: 1fr;
          }

          .order-main {
            grid-template-columns: 1fr 1fr;
          }

          .order-footer {
            flex-direction: column;
          }
        }

        @media (max-width: 520px) {
          .account-header {
            padding-inline: 16px;
          }

          .account-nav {
            gap: 12px;
            font-size: 12px;
          }

          .account-hero {
            flex-direction: column-reverse;
            align-items: flex-start;
          }

          .account-avatar {
            width: 64px;
            height: 64px;
            flex-basis: 64px;
            font-size: 24px;
          }

          .account-card {
            padding: 20px 15px;
          }

          .order-main {
            grid-template-columns: 1fr;
            gap: 14px;
          }
        }
      `}</style>
    </main>
  );
}
