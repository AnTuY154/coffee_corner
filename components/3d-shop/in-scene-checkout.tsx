"use client";
import { useRef, useState, type FormEvent } from "react";
import { useCart } from "@/components/cart-context";
import { products, currency } from "@/data/catalog";

type FormValues = { customerName:string; phone:string; address:string; note:string; paymentMethod:"cod"|"transfer"; website:string };
const empty:FormValues={customerName:"",phone:"",address:"",note:"",paymentMethod:"cod",website:""};
type Props={onBack:()=>void;onReturnToShop:()=>void;onCompleted:()=>void};

/** Same-origin API. Never navigate to another URL or pretend static Pages saved an order. */
export function InSceneCheckout({onBack,onReturnToShop,onCompleted}:Props){
 const {lines,subtotal,clear}=useCart();
 const [form,setForm]=useState<FormValues>(empty);
 const [sending,setSending]=useState(false);
 const [error,setError]=useState("");
 const [confirmed,setConfirmed]=useState<string|null>(null);
 const requestId=useRef<string|null>(null);
 const isStaticDemo=process.env.NEXT_PUBLIC_GITHUB_PAGES_DEMO==="1";
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();
  if(sending||!lines.length||isStaticDemo)return;
  setSending(true);setError("");
  try{
   if(!requestId.current)requestId.current=crypto.randomUUID();
   const response=await fetch("/api/orders",{method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({...form,items:lines,requestId:requestId.current}),cache:"no-store"});
   const payload=await response.json() as {ok?:boolean;orderId?:string;error?:string};
   if(!response.ok||!payload.ok||!payload.orderId)throw new Error(payload.error||"Cửa hàng chưa nhận được đơn.");
   setConfirmed(payload.orderId);
   clear();onCompleted();
  }catch(e){setError(e instanceof Error?e.message:"Không gửi được đơn, vui lòng thử lại.");}
  finally{setSending(false);}
 }
 if(confirmed)return <section className="ve-order-complete" aria-live="polite">
  <span aria-hidden="true" className="ve-order-success-icon">✓</span>
  <p className="ve-menu-kicker">ĐƠN HÀNG ĐÃ ĐƯỢC GỬI</p>
  <h3>Cảm ơn bạn đã ghé Vườn Ép!</h3>
  <p>Mã yêu cầu: <strong>{confirmed}</strong></p>
  <p>Cửa hàng sẽ liên hệ để xác nhận đồ uống còn hàng, phí giao hàng và phương thức thanh toán. Chưa có giao dịch thanh toán nào được thực hiện.</p>
  <button className="ve-menu-checkout" type="button" onClick={onReturnToShop}>Quay lại khu vườn 3D →</button>
 </section>;
 if(isStaticDemo)return <section className="ve-scene-checkout ve-order-demo">
  <button type="button" className="ve-checkout-back" onClick={onBack}>← Quay lại giỏ hàng</button>
  <p className="ve-menu-kicker">GITHUB PAGES — CHẾ ĐỘ TRẢI NGHIỆM</p>
  <h3>Khám phá quán và chọn món thoải mái nhé!</h3>
  <p>Đây là bản demo tĩnh, không có máy chủ tiếp nhận đơn. Để bảo vệ thông tin khách hàng, chúng tôi không thu thập tên, số điện thoại hoặc địa chỉ và không hiển thị thông báo đặt hàng thành công giả.</p>
  <button type="button" className="ve-menu-checkout" onClick={onBack}>Tiếp tục chọn món →</button>
 </section>;
 return <section className="ve-scene-checkout" aria-label="Thông tin đặt hàng">
  <div className="ve-checkout-intro">
   <button type="button" className="ve-checkout-back" onClick={onBack}>← Quay lại thực đơn</button>
   <p className="ve-menu-kicker">BƯỚC CUỐI · VẪN TRONG CỬA HÀNG</p>
   <h3>Gửi một chút tươi lành</h3>
   <p>Điền thông tin để Vườn Ép liên hệ xác nhận đơn. Không thanh toán trực tuyến tại bước này.</p>
  </div>
  <div className="ve-checkout-columns">
   <form className="ve-checkout-form" onSubmit={submit}>
    <label>Họ tên người nhận *<input name="name" required minLength={2} maxLength={100} autoComplete="name" value={form.customerName} onChange={e=>setForm({...form,customerName:e.target.value})} placeholder="Nguyễn Văn A"/></label>
    <label>Số điện thoại *<input name="phone" type="tel" required inputMode="tel" autoComplete="tel" maxLength={18} pattern="(\\+84|0)[0-9\\s.\\-]{8,14}" title="Số điện thoại Việt Nam bắt đầu bằng 0 hoặc +84" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="09xx xxx xxx"/></label>
    <label>Địa chỉ nhận hàng *<textarea name="address" required minLength={10} maxLength={300} rows={3} autoComplete="street-address" value={form.address} onChange={e=>setForm({...form,address:e.target.value})} placeholder="Số nhà, đường, phường/xã, tỉnh/thành"/></label>
    <label>Ghi chú cho Vườn<textarea name="note" maxLength={500} rows={2} value={form.note} onChange={e=>setForm({...form,note:e.target.value})} placeholder="Ví dụ: không thêm đường"/></label>
    <div className="ve-checkout-honeypot" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={e=>setForm({...form,website:e.target.value})}/></label></div>
    <fieldset><legend>Phương thức thanh toán dự kiến</legend>
      <label><input type="radio" name="payment" checked={form.paymentMethod==="cod"} onChange={()=>setForm({...form,paymentMethod:"cod"})}/> Thanh toán khi nhận hàng (COD)</label>
      <label><input type="radio" name="payment" checked={form.paymentMethod==="transfer"} onChange={()=>setForm({...form,paymentMethod:"transfer"})}/> Chuyển khoản sau khi xác nhận</label>
    </fieldset>
    {error&&<p className="ve-checkout-error" role="alert">{error}</p>}
    <button type="submit" disabled={sending||!lines.length} className="ve-menu-checkout">{sending?"Đang gửi đơn…":"Gửi yêu cầu đặt hàng →"}</button>
    <small>Thông tin chỉ dùng xử lý đơn. Vườn Ép sẽ liên hệ để xác nhận; chưa có khoản thanh toán nào được thực hiện.</small>
   </form>
   <aside className="ve-checkout-summary"><h4>Đơn hàng của bạn</h4>
    {lines.map(line=>{const p=products.find(item=>item.id===line.id);return p?<div key={line.id}><span>{p.name} × {line.quantity}</span><strong>{currency(p.price*line.quantity)}</strong></div>:null})}
    <div><span>Phí giao hàng</span><span>Xác nhận sau</span></div>
    <div className="ve-checkout-total"><strong>Tạm tính</strong><strong>{currency(subtotal)}</strong></div>
   </aside>
  </div>
 </section>;
}
