'use client';

import { useEffect, useState } from 'react';

const statuses = ['NEW','CONFIRMED','PROCESSING','PACKED','SHIPPED','DELIVERED','CANCELLED','RETURNED','REFUNDED'];
const paymentStatuses = ['PENDING','PAID','FAILED','REFUNDED'];

function money(value: any) {
  return `${Number(value || 0).toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ج.م`;
}

function date(value: any) {
  if (!value) return '—';
  return new Date(value).toLocaleString('ar-EG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function statusLabel(value: string) {
  const map: Record<string, string> = {
    NEW: 'جديد',
    CONFIRMED: 'مؤكد',
    PROCESSING: 'قيد التجهيز',
    PACKED: 'تم التغليف',
    SHIPPED: 'تم الشحن',
    DELIVERED: 'تم التسليم',
    CANCELLED: 'ملغي',
    RETURNED: 'مرتجع',
    REFUNDED: 'مسترد',
    PENDING: 'معلق',
    PAID: 'مدفوع',
    FAILED: 'فشل',
  };
  return map[value] || value;
}

function shippingAddress(value: any) {
  if (!value) return [];
  if (typeof value === 'string') {
    try { value = JSON.parse(value); } catch { return [{ label: 'العنوان', value }]; }
  }
  const labels: Record<string, string> = {
    country: 'الدولة',
    city: 'المدينة',
    area: 'المنطقة',
    address: 'العنوان',
    building: 'المبنى',
    apartment: 'الشقة',
    postal_code: 'الرمز البريدي',
    notes: 'ملاحظات',
  };
  return Object.entries(value)
    .filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== '')
    .map(([k, v]) => ({ label: labels[k] || k, value: String(v) }));
}

export default function Orders() {
  const [rows, setRows] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/orders', { cache: 'no-store' });
      const d = await r.json();
      setRows(d.orders || []);
      if (d.error) setMsg(d.error);
    } catch {
      setMsg('تعذر تحميل الطلبات حاليًا');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function update(id: string, status: string, payment_status: string) {
    const r = await fetch('/api/admin/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, payment_status }),
    });
    const d = await r.json();
    setMsg(r.ok ? 'تم تحديث الطلب بنجاح' : d.error || 'فشل التحديث');
    await load();
    if (r.ok) {
      setSelected((old: any) => old?.id === id ? { ...old, status, payment_status } : old);
    }
  }

  const customer = selected?.profiles || {};
  const items = selected?.order_items || [];
  const address = shippingAddress(selected?.shipping_address);

  return (
    <main className="admin" dir="rtl">
      <small>SALES</small>
      <h1>إدارة الطلبات</h1>

      {msg && <p className="note">{msg}</p>}

      <section className="panel">
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>رقم الطلب</th>
                <th>العميل</th>
                <th>الإجمالي</th>
                <th>الدفع</th>
                <th>الحالة</th>
                <th>التاريخ</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7}>جاري تحميل الطلبات...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={7}>لا توجد طلبات حاليًا</td></tr>
              ) : rows.map((o) => (
                <tr key={o.id}>
                  <td><strong>#{o.order_number}</strong></td>
                  <td>{o.profiles?.name || o.profiles?.email || o.user_id}</td>
                  <td>{money(o.total)}</td>
                  <td>
                    <select value={o.payment_status} onChange={(e) => update(o.id, o.status, e.target.value)}>
                      {paymentStatuses.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td>
                    <select value={o.status} onChange={(e) => update(o.id, e.target.value, o.payment_status)}>
                      {statuses.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td>{date(o.created_at)}</td>
                  <td>
                    <button onClick={() => setSelected(o)}>عرض التفاصيل</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {selected && (
        <section className="panel order-details" style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div>
              <small>ORDER DETAILS</small>
              <h2 style={{ margin: '6px 0 0' }}>الطلب #{selected.order_number}</h2>
              <div style={{ opacity: .7, marginTop: 5 }}>{date(selected.created_at)}</div>
            </div>
            <button className="close" onClick={() => setSelected(null)} aria-label="إغلاق">×</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12, marginBottom: 20 }}>
            <div className="panel" style={{ margin: 0 }}>
              <small>العميل</small>
              <h3>{customer.name || 'عميل'}</h3>
              <div>{customer.email || '—'}</div>
              <div>{customer.phone || '—'}</div>
            </div>

            <div className="panel" style={{ margin: 0 }}>
              <small>حالة الطلب</small>
              <h3>{statusLabel(selected.status)}</h3>
              <div>الدفع: {statusLabel(selected.payment_status)}</div>
              <div>الطريقة: {selected.payment_method || '—'}</div>
            </div>
          </div>

          <div className="panel" style={{ margin: '0 0 20px' }}>
            <h3>المنتجات</h3>
            <div className="table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>المنتج</th>
                    <th>SKU</th>
                    <th>السعر</th>
                    <th>الكمية</th>
                    <th>الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length ? items.map((item: any) => (
                    <tr key={item.id}>
                      <td><strong>{item.name}</strong></td>
                      <td>{item.sku}</td>
                      <td>{money(item.price)}</td>
                      <td>{item.quantity}</td>
                      <td>{money(Number(item.price) * Number(item.quantity))}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={5}>لا توجد منتجات مسجلة لهذا الطلب</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 20 }}>
            <div className="panel" style={{ margin: 0 }}>
              <h3>عنوان الشحن</h3>
              {address.length ? (
                <dl style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '8px 12px', margin: 0 }}>
                  {address.map((x, i) => (
                    <div key={i} style={{ display: 'contents' }}>
                      <dt style={{ opacity: .65 }}>{x.label}</dt>
                      <dd style={{ margin: 0 }}>{x.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : <div>لا يوجد عنوان شحن</div>}
            </div>

            <div className="panel" style={{ margin: 0 }}>
              <h3>ملخص الحساب</h3>
              <div style={{ display: 'grid', gap: 9 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>المجموع الفرعي</span><strong>{money(selected.subtotal)}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>الخصم</span><strong>{money(selected.discount)}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>الشحن</span><strong>{money(selected.shipping)}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>الضريبة</span><strong>{money(selected.tax)}</strong></div>
                <hr />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18 }}><strong>الإجمالي</strong><strong>{money(selected.total)}</strong></div>
              </div>
            </div>
          </div>

          <details style={{ marginTop: 20 }}>
            <summary style={{ cursor: 'pointer' }}>عرض البيانات التقنية (JSON)</summary>
            <pre className="json-box" style={{ marginTop: 10 }}>{JSON.stringify(selected, null, 2)}</pre>
          </details>
        </section>
      )}
    </main>
  );
}
