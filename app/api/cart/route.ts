import {NextResponse} from 'next/server';
import {createServerSupabaseClient} from '@/lib/supabase-server';

async function auth(){const s=await createServerSupabaseClient();const {data:{user}}=await s.auth.getUser();return {s,user}}

export async function GET(){
  const {s,user}=await auth();
  if(!user)return NextResponse.json({items:[]});
  let {data:cart,error:cartError}=await s.from('carts').select('id').eq('user_id',user.id).maybeSingle();
  if(cartError)return NextResponse.json({error:cartError.message},{status:500});
  if(!cart){
    const r=await s.from('carts').insert({user_id:user.id}).select('id').single();
    if(r.error)return NextResponse.json({error:r.error.message},{status:500});
    cart=r.data;
  }
  const {data:items,error}=await s.from('cart_items').select('id,cart_id,product_id,quantity,product:products(id,sku,name,slug,price,stock,image)').eq('cart_id',cart.id);
  if(error)return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({id:cart.id,items:items||[]});
}

export async function POST(r:Request){
  try{
    const {s,user}=await auth();
    if(!user)return NextResponse.json({error:'LOGIN_REQUIRED'},{status:401});
    const b=await r.json();
    const productId=String(b.productId||'');
    const quantity=Number(b.quantity);
    if(!productId || !Number.isInteger(quantity) || quantity<1)
      return NextResponse.json({error:'بيانات المنتج أو الكمية غير صحيحة'},{status:400});

    const {data:p,error:productError}=await s.from('products').select('id,stock').eq('id',productId).maybeSingle();
    if(productError)return NextResponse.json({error:productError.message},{status:500});
    if(!p)return NextResponse.json({error:'المنتج غير موجود'},{status:404});
    if(p.stock<quantity)return NextResponse.json({error:'الكمية غير متاحة'},{status:409});

    let {data:cart,error:cartError}=await s.from('carts').select('id').eq('user_id',user.id).maybeSingle();
    if(cartError)return NextResponse.json({error:cartError.message},{status:500});
    if(!cart){
      const r2=await s.from('carts').insert({user_id:user.id}).select('id').single();
      if(r2.error)return NextResponse.json({error:r2.error.message},{status:500});
      cart=r2.data;
    }

    const {data:item,error}=await s.from('cart_items').upsert(
      {cart_id:cart.id,product_id:productId,quantity},
      {onConflict:'cart_id,product_id'}
    ).select().single();

    if(error)return NextResponse.json({error:error.message},{status:400});
    return NextResponse.json(item,{status:201});
  }catch(e:any){return NextResponse.json({error:e?.message||'INVALID_REQUEST'},{status:400})}
}

export async function DELETE(r:Request){
  const {s,user}=await auth();
  if(!user)return NextResponse.json({error:'LOGIN_REQUIRED'},{status:401});
  const {productId}=await r.json();
  if(!productId)return NextResponse.json({error:'PRODUCT_REQUIRED'},{status:400});
  const {data:cart}=await s.from('carts').select('id').eq('user_id',user.id).maybeSingle();
  if(cart) {
    const {error}=await s.from('cart_items').delete().eq('cart_id',cart.id).eq('product_id',productId);
    if(error)return NextResponse.json({error:error.message},{status:500});
  }
  return NextResponse.json({ok:true});
}
