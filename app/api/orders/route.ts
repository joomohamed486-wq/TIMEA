import {NextResponse} from 'next/server';
import {createServerSupabaseClient} from '@/lib/supabase-server';
import {z} from 'zod';

const S=z.object({
  items:z.array(z.object({productId:z.string().uuid(),quantity:z.number().int().positive()})).min(1),
  shippingAddress:z.record(z.any()).refine(v=>String(v.city||'').trim().length>0 && String(v.address||'').trim().length>0,{message:'عنوان الشحن غير مكتمل'}),
  paymentMethod:z.enum(['COD']).default('COD'),
  discount:z.number().finite().min(0).default(0),
  shipping:z.number().finite().min(0).default(0)
});

export async function POST(r:Request){
  try{
    const b=S.parse(await r.json());
    const s=await createServerSupabaseClient();
    const {data:{user}}=await s.auth.getUser();
    if(!user)return NextResponse.json({error:'LOGIN_REQUIRED'},{status:401});

    const {data:id,error}=await s.rpc('create_order',{
      p_items:b.items,
      p_address:b.shippingAddress,
      p_payment_method:b.paymentMethod,
      p_discount:b.discount,
      p_shipping:b.shipping
    });
    if(error){
      console.error('[TIMEA] create_order:',error);
      return NextResponse.json({error:error.message},{status:400});
    }

    const {data:carts}=await s.from('carts').select('id').eq('user_id',user.id);
    const cartIds=(carts||[]).map((x:any)=>x.id);
    if(cartIds.length) await s.from('cart_items').delete().in('cart_id',cartIds);

    return NextResponse.json({id},{status:201});
  }catch(e:any){
    return NextResponse.json({error:e?.issues?.[0]?.message||e?.message||'INVALID_REQUEST'},{status:400});
  }
}
