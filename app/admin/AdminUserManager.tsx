'use client';

import { useEffect, useState } from 'react';

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: 'مدير أعلى',
  ADMIN: 'مدير',
  STAFF: 'موظف',
  INVENTORY_MANAGER: 'مدير مخزون',
  CUSTOMER: 'عميل',
};

const roles = Object.keys(roleLabels);

type User = { id: string; name: string; email: string; phone?: string | null; role: string; created_at: string };

export default function AdminUserManager({ currentRole }: { currentRole: string }) {
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'ADMIN', phone: '' });
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  async function load() {
    const res = await fetch('/api/admin/users', { cache: 'no-store' });
    const data = await res.json();
    if (res.ok) setUsers(data.users || []); else setMsg(data.error || 'تعذر تحميل المستخدمين');
  }

  useEffect(() => { load(); }, []);

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg('');
    const res = await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const data = await res.json();
    if (res.ok) {
      setMsg('تم إنشاء الحساب وتعيين الصلاحية بنجاح.');
      setForm({ name: '', email: '', password: '', role: 'ADMIN', phone: '' });
      await load();
    } else setMsg(data.error || 'تعذر إنشاء الحساب');
    setBusy(false);
  }

  async function changeRole(id: string, role: string) {
    setMsg('');
    const res = await fetch('/api/admin/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, role }) });
    const data = await res.json();
    if (res.ok) { setMsg('تم تحديث الصلاحية.'); await load(); }
    else setMsg(data.error || 'تعذر تحديث الصلاحية');
  }

  async function removeUser(id: string) {
    if (!confirm('هل أنت متأكد من حذف هذا الحساب نهائيًا؟')) return;
    const res = await fetch('/api/admin/users', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    const data = await res.json();
    if (res.ok) { setMsg('تم حذف الحساب.'); await load(); }
    else setMsg(data.error || 'تعذر حذف الحساب');
  }

  const canCreateSuper = currentRole === 'SUPER_ADMIN';
  const canCreateAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(currentRole);

  return <section className="panel" style={{ marginTop: 25 }}>
    <h2>إدارة المستخدمين والأدمن</h2>
    <p className="note">من هنا تقدر تنشئ حسابًا جديدًا، تعيّن له الصلاحية، أو تغيّر صلاحية مستخدم موجود. إنشاء وحذف المستخدمين يتم من الخادم بمفتاح Supabase السري ولا يظهر في المتصفح.</p>
    {msg && <p className="note">{msg}</p>}

    <form onSubmit={createUser} className="admin-user-form">
      <input required placeholder="الاسم" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
      <input required type="email" placeholder="البريد الإلكتروني" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
      <input required minLength={8} type="password" placeholder="كلمة المرور (8 أحرف+)" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
      <input placeholder="الهاتف (اختياري)" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
      <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
        {roles.filter(r => r !== 'SUPER_ADMIN' || canCreateSuper).filter(r => r !== 'ADMIN' || canCreateAdmin).map(r => <option key={r} value={r}>{roleLabels[r]}</option>)}
      </select>
      <button className="btn" disabled={busy}>{busy ? 'جاري الإنشاء...' : 'إنشاء الحساب'}</button>
    </form>

    <div style={{ overflowX: 'auto', marginTop: 25 }}>
      <table className="admin-users-table">
        <thead><tr><th>الاسم</th><th>البريد</th><th>الصلاحية</th><th>تغيير</th><th></th></tr></thead>
        <tbody>{users.map(u => <tr key={u.id}>
          <td>{u.name}</td><td>{u.email}</td>
          <td><strong>{roleLabels[u.role] || u.role}</strong></td>
          <td><select value={u.role} disabled={u.id === ''} onChange={e => changeRole(u.id, e.target.value)}>
            {roles.filter(r => r !== 'SUPER_ADMIN' || canCreateSuper).filter(r => r !== 'ADMIN' || canCreateAdmin).map(r => <option key={r} value={r}>{roleLabels[r]}</option>)}
          </select></td>
          <td>{currentRole === 'SUPER_ADMIN' && <button type="button" className="danger-btn" onClick={() => removeUser(u.id)}>حذف</button>}</td>
        </tr>)}</tbody>
      </table>
    </div>
  </section>;
}
