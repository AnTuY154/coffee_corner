import { products } from "@/data/catalog";

const normalise=(value:string)=>value.toLocaleLowerCase("vi-VN")
  .normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/đ/g,"d");

export type ShopReply={text:string;category?:"all"|"fruit"|"daily"};

/**
 * Local, deterministic guide: no API calls, fake live agent, generated offers
 * or personal customer information. The catalogue contains demonstration
 * prices; every amount is explicitly labelled as a reference.
 */
export function replyToCustomer(raw:string,month:number):ShopReply{
  const text=normalise(raw.trim());
  if(!text)return {text:"Bạn có thể hỏi về nước ép, sinh tố, trái cây hoặc cách đặt món nha!"};
  const product=products.find(p=>normalise(p.name).includes(text)&&text.length>3)
    ?? products.find(p=>text.includes(normalise(p.name)));
  if(product){
    return {
      text:`${product.name}: ${product.tagline}. Giá tham khảo ${product.price.toLocaleString("vi-VN")}đ/${product.saleUnit==="pack"?"gói":"ly"}. Giá và tình trạng bán cần cửa hàng xác nhận.`,
      category:product.category==="fresh-fruit"?"fruit":"all"
    };
  }
  if(/(giao hang|ship|van chuyen|phí ship|phi ship|dia chi|so dien thoai|lien he|gio mo|mo cua|hoat dong)/.test(text)){
    return {text:"Thông tin giao hàng, địa chỉ và giờ mở cửa chưa được xác nhận. Bạn vui lòng liên hệ cửa hàng qua số điện thoại chính thức nếu được hiển thị trên website nhé."};
  }
  if(/(dat hang|dat mon|mua|thanh toan|gio hang|order|checkout)/.test(text)){
    return {text:"Bạn chọn “Xem thực đơn”, thêm món vào giỏ và thực hiện các bước đặt hàng. Giá trên trang là dữ liệu tham khảo, cần xác nhận trước khi bán chính thức.",category:"all"};
  }
  if(/(trai cay|hoa qua|qua tuoi|fruit)/.test(text)){
    return {text:"Vườn É có danh mục trái cây tươi theo gói. Bạn mở “Trái cây tươi” để xem các lựa chọn đang được giới thiệu nhé!",category:"fruit"};
  }
  if(/(gia|bao nhieu|bang gia|menu|thuc don)/.test(text)){
    return {text:"Mình có thể giúp tra giá tham khảo theo từng sản phẩm. Bấm “Xem thực đơn” để xem đầy đủ giá và thành phần nhé!",category:"all"};
  }
  if(/(tu van|goi y|mon nao|ngon|san pham moi|mon moi|nuoc ep|sinh to)/.test(text)){
    const seasonal=products.find(p=>p.category!=="fresh-fruit"&&p.months.includes(month));
    if(seasonal)return {text:`Tháng này mình gợi ý ${seasonal.name} – ${seasonal.tagline}. Đây là gợi ý theo mùa, không phải thông báo món vừa ra mắt. Bạn có thể mở thực đơn để chọn nhé!`,category:"all"};
    return {text:"Bạn thử xem danh mục nước ép và sinh tố nhé! Mỗi sản phẩm đều có thành phần và hương vị tham khảo.",category:"all"};
  }
  if(/(chao|hello|hi|xin chao|cam on)/.test(text)){
    return {text:"Vườn É xin chào! 🌿 Mình là trợ lý trả lời tự động. Bạn cần tư vấn về món uống hay cách đặt hàng nhỉ?"};
  }
  return {text:"Mình là trợ lý tự động của Vườn É, hiện có thể trả lời về món uống, trái cây, giá tham khảo và cách đặt hàng. Bạn thử hỏi “Món nào ngon?” hoặc mở thực đơn nhé!"};
}
