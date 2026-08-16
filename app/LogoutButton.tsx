'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function logout() {
    setBusy(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/login');
    router.refresh();
  }
  return <button type="button" className="logout-btn" disabled={busy} onClick={logout}>{busy ? 'جاري الخروج...' : 'تسجيل الخروج'}</button>;
}
