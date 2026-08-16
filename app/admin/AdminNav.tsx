'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoutButton from '@/app/LogoutButton';
const items=[['/admin','الرئيسية'],['/admin/products','المنتجات'],['/admin/orders','الطلبات'],['/admin/categories','التصنيفات'],['/admin/brands','العلامات التجارية'],['/admin/coupons','الكوبونات'],['/admin/reviews','التقييمات'],['/admin/inventory','المخزون'],['/admin/reports','التقارير'],['/admin/users','المستخدمون']];
export default function AdminNav(){const p=usePathname();return <header className="admin-nav"><div className="admin-nav-inner"><Link className="brand" href="/admin">TIMEA <small>ADMIN</small></Link><nav>{items.map(([href,label])=><Link key={href} className={p===href?'active':''} href={href}>{label}</Link>)}<Link href="/">المتجر</Link><LogoutButton/></nav></div></header>}
