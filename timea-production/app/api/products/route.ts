import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
export async function GET(){const products=await prisma.product.findMany({include:{brand:true,category:true},orderBy:{createdAt:"desc"}});return NextResponse.json(products)}
export async function POST(req:Request){const body=await req.json();const product=await prisma.product.create({data:body});return NextResponse.json(product,{status:201})}