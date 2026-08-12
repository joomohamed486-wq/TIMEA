import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {z} from "zod";
const schema=z.object({customerId:z.string(),userId:z.string(),items:z.array(z.object({productId:z.string(),quantity:z.number().int().positive()})),shippingAddress:z.record(z.any()),paymentMethod:z.string().default("COD")});
export async function POST(req:Request){
 const b=schema.parse(await req.json());
 const result=await prisma.$transaction(async tx=>{
   let subtotal=0; const rows:any[]=[];
   for(const i of b.items){const p=await tx.product.findUnique({where:{id:i.productId}});if(!p)throw new Error("Product not found");if(p.stock<i.quantity)throw new Error("Insufficient stock");subtotal+=p.price*i.quantity;rows.push({productId:p.id,name:p.name,sku:p.sku,price:p.price,quantity:i.quantity})}
   const order=await tx.order.create({data:{orderNumber:"TM-"+Date.now(),customerId:b.customerId,userId:b.userId,status:"NEW",paymentStatus:"PENDING",paymentMethod:b.paymentMethod,subtotal,discount:0,shipping:0,tax:0,total:subtotal,shippingAddress:b.shippingAddress,items:{create:rows},payment:{create:{provider:b.paymentMethod,status:"PENDING",amount:subtotal}}}});
   for(const i of b.items){const p=await tx.product.findUniqueOrThrow({where:{id:i.productId}});await tx.product.update({where:{id:p.id},data:{stock:{decrement:i.quantity}}});await tx.inventoryTransaction.create({data:{productId:p.id,previousQty:p.stock,change:-i.quantity,newQty:p.stock-i.quantity,reason:"ORDER",userId:b.userId}})}
   return order;
 });
 return NextResponse.json(result,{status:201});
}