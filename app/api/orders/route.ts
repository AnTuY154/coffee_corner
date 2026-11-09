import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { products } from "@/data/catalog";
export const runtime="nodejs";
const phoneRegex=/^(?:\+84|0)[0-9]{9}$/;
const fail=(error:string,status:number)=>NextResponse.json({ok:false,error},{status});
const safeString=(value:unknown,max:number)=>typeof value==="string"?value.trim().slice(0,max):"";
export async function POST(req:NextRequest){
  const url=process.env.GOOGLE_APPS_SCRIPT_WEBHOOK_URL;
  const secret=process.env.ORDER_WEBHOOK_SECRET;
  if(!url||!secret)return fail("Cửa hàng chưa kết nối hệ thống nhận đơn. Vui lòng liên hệ người bán.",503);
  try {const parsed=new URL(url);if(parsed.protocol!=="https:"||!(["script.google.com","script.googleusercontent.com"].includes(parsed.hostname)))return fail("Cấu hình hệ thống nhận đơn không hợp lệ.",503);}catch{return fail("Cấu hình hệ thống nhận đơn không hợp lệ.",503);}
  let body:Record<string,unknown>;
  try{const raw=await req.text();if(raw.length>12000)return fail("Dữ liệu đơn hàng quá lớn.",413);body=JSON.parse(raw) as Record<string,unknown>;}catch{return fail("Dữ liệu gửi lên không hợp lệ.",400);}
  if(safeString(body.website,100))return fail("Yêu cầu không hợp lệ.",400);
  if (!req.headers.get("content-type")?.includes("application/json")) return fail("Chỉ chấp nhận dữ liệu JSON.",415);
  if (body===null || typeof body!=="object" || Array.isArray(body)) return fail("Dữ liệu đơn hàng không hợp lệ.",400);
  const requestId=safeString(body.requestId,36);
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId))return fail("Mã yêu cầu không hợp lệ.",400);
  const customerName=safeString(body.customerName,100),phone=safeString(body.phone,18).replace(/[\s.\-]/g,""),address=safeString(body.address,300),note=safeString(body.note,500),paymentMethod=body.paymentMethod;
  if(customerName.length<2||!phoneRegex.test(phone)||address.length<10)return fail("Vui lòng nhập đúng họ tên, điện thoại và địa chỉ giao hàng.",400);
  if(paymentMethod!=="cod"&&paymentMethod!=="transfer")return fail("Phương thức thanh toán không hợp lệ.",400);
  if(!Array.isArray(body.items)||body.items.length===0||body.items.length>24)return fail("Giỏ hàng không hợp lệ.",400);
  const quantities=new Map<string,number>();
  for(const entry of body.items){if(!entry||typeof entry!=="object")return fail("Sản phẩm không hợp lệ.",400);const id=(entry as {id?:unknown;skuId?:unknown}).skuId??(entry as {id?:unknown}).id,quantity=(entry as {quantity?:unknown}).quantity;if(typeof id!=="string"||!products.some(p=>p.id===id)||!Number.isInteger(quantity)||typeof quantity!=="number"||quantity<1||quantity>20)return fail("Sản phẩm hoặc số lượng không hợp lệ.",400);quantities.set(id,(quantities.get(id)||0)+quantity);}
  const totalQuantity=[...quantities.values()].reduce((s,n)=>s+n,0);
  if(totalQuantity>40||[...quantities].some(([id,qty])=>qty>(products.find(p=>p.id===id)?.maxQuantity??20)))return fail("Số lượng vượt giới hạn của sản phẩm.",400);
  const items=[...quantities].map(([id,quantity])=>{const p=products.find(p=>p.id===id)!;return {id,name:p.name,quantity,unitPrice:p.price,lineTotal:p.price*quantity,gramsPerPack:p.gramsPerPack??null,saleUnit:p.saleUnit??"cup"};});
  const subtotal=items.reduce((s,p)=>s+p.lineTotal,0);
  const canonical=JSON.stringify({customerName,phone,address,note,paymentMethod,items:items.map(({id,quantity})=>({id,quantity})).sort((a,b)=>a.id.localeCompare(b.id))});
  const inputHash=createHash("sha256").update(canonical).digest("hex");
  const orderId=`VE-${requestId.toUpperCase()}`;
  const payload={secret,orderId,inputHash,createdAt:new Date().toISOString(),customerName,phone,address,note,paymentMethod,items,subtotal,deliveryFee:null,status:"NEW_UNCONFIRMED"};
  try{const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),12000);let response:Response;try{response=await fetch(url,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(payload),signal:controller.signal,cache:"no-store",redirect:"follow"});}finally{clearTimeout(timeout);}if(!response.ok)return fail("Hệ thống nhận đơn đang bận. Vui lòng thử lại.",502);const data=await response.json() as {ok?:boolean;orderId?:string;duplicate?:boolean;error?:string;subtotal?:number};if(data.error==="Conflict")return fail("Mã yêu cầu đã được dùng cho một giỏ hàng khác.",409);if(data.error==="NeedsReview")return fail("Đơn cũ cần đối soát. Vui lòng liên hệ cửa hàng.",409);if(data.ok!==true||data.orderId!==orderId)return fail("Chưa thể xác nhận đã lưu đơn. Vui lòng liên hệ cửa hàng.",502);return NextResponse.json({ok:true,orderId,subtotal:data.subtotal??subtotal},{status:data.duplicate?200:201});}catch{return fail("Chưa gửi được đơn hàng. Vui lòng thử lại hoặc liên hệ cửa hàng.",502);}
}
