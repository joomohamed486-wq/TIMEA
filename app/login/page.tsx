"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";

function safeNext(value:string|null){
  if(!value) return '/account';
  if(value.startsWith('/') && !value.startsWith('//')) return value;
  return '/account';
}

export default function Login(){
  const[r,setR]=useState({email:"",password:""});
  const[msg,setM]=useState("");
  const[busy,setBusy]=useState(false);
  const router=useRouter();
  async function go(e:any){
    e.preventDefault(); setBusy(true); setM("");
    try{
      const x=await fetch("/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(r)});
      const d=await x.json();
      if(x.ok) {
        const next = new URLSearchParams(window.location.search).get('next');
        router.replace(safeNext(next));
      }
      else setM(d.error||'تعذر تسجيل الدخول');
    }catch{setM('تعذر الاتصال بالخادم');}
    finally{setBusy(false);}
  }
  return <main className="auth"><form onSubmit={go}><h1>تسجيل الدخول</h1><input required placeholder="البريد الإلكتروني" type="email" onChange={e=>setR({...r,email:e.target.value})}/><input required placeholder="كلمة المرور" type="password" onChange={e=>setR({...r,password:e.target.value})}/>{msg&&<p>{msg}</p>}<button className="btn" disabled={busy}>{busy?'جاري الدخول...':'دخول'}</button><a href="/register">إنشاء حساب جديد</a></form></main>
}
