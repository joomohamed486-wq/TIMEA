import AdminNav from './AdminNav';
import { requireAdmin } from '@/lib/admin-auth';
import { redirect } from 'next/navigation';
export default async function AdminLayout({children}:{children:React.ReactNode}){
  const g=await requireAdmin();
  if(!g.ok) redirect('/login?next=/admin');
  return <><AdminNav/>{children}</>;
}
