import {cookies} from "next/headers";
import {prisma} from "./prisma";
import bcrypt from "bcryptjs";
import {randomBytes} from "crypto";
export async function hashPassword(p:string){return bcrypt.hash(p,12)}
export async function verifyPassword(p:string,h:string){return bcrypt.compare(p,h)}
export async function createSession(userId:string){
 const token=randomBytes(32).toString("hex");
 await prisma.session.create({data:{userId,token,expiresAt:new Date(Date.now()+1000*60*60*24*30)}});
 (await cookies()).set("timea_session",token,{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",maxAge:60*60*24*30,path:"/"});
 return token;
}
export async function currentUser(){
 const token=(await cookies()).get("timea_session")?.value;
 if(!token)return null;
 const s=await prisma.session.findUnique({where:{token},include:{user:true}});
 if(!s||s.expiresAt<new Date())return null;
 return s.user;
}