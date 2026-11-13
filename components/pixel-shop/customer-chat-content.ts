import { products, currency } from "../../data/catalog";

export type ChatAction = "all" | "fruit" | "daily";
export type ChatAnswer = { text:string; action?:ChatAction; productId?:string };

const fold = (text:string)=>text.normalize("NFD")
  .replace(/[\u0300-\u036f]/g,"").replace(/[đĐ]/g,"d").toLowerCase();

const seasonal=(month:number)=>products.filter(p=>p.category!=="fresh-fruit" && p.months.includes(month));

/**
 * Offline, deterministic menu assistant. Typed messages stay in browser
 * memory and are not sent to a server or presented as human live support.
 * Inventory, delivery prices and opening times are never invented.
 */
export function answerShopQuestion(raw:string,month:number):ChatAnswer {
  const question=fold(raw.trim()).slice(0,350);
  const items=seasonal(month);
  const featured=items.find(p=>p.badge==="Mới") ?? items.find(p=>p.badge==="Bán chạy") ?? items[0];
  const named=products
    .filter(p=>fold(p.name).length>=3)
    .sort((a,b)=>b.name.length-a.name.length)
    .find(p=>question.includes(fold(p.name)));

  if(!question)return {text:"Bạn muốn hỏi về nước ép, sinh tố, trái cây hay đặt hàng nè? 🍊"};

  if(named){
    return {
      text:named.name+" — "+currency(named.price)+(named.category==="fresh-fruit"?"/gói":"/ly")+". "+named.flavour+". "+named.description.slice(0,150)+". Bạn mở thực đơn để chọn món nhé!",
      action:named.category==="fresh-fruit"?"fruit":"all",
      productId:named.id
    };
  }

  if(/(^|\s)(moi|new|ra mat|vua co|mon moi|san pham moi)(\s|$)/.test(question)){
    const newItem=items.find(p=>p.badge==="Mới");
    if(newItem)return {
      text:"Vườn É đang giới thiệu món mới "+newItem.name+" ("+currency(newItem.price)+"/ly). "+newItem.tagline+". Bạn muốn thử không? ✨",
      action:"all",productId:newItem.id
    };
    return {
      text:featured
        ?"Mình chưa có xác nhận về món vừa ra mắt. Gợi ý theo mùa hiện tại là "+featured.name+", "+currency(featured.price)+"/ly. Bạn xem thử nha!"
        :"Mình chưa có thông tin về món vừa ra mắt. Bạn xem thực đơn hiện tại nhé!",
      action:"all",productId:featured?.id
    };
  }

  if(/gio mo|mo cua|dong cua|dia chi|o dau|sdt|so dien thoai|lien he/.test(question)){
    return {text:"Hiện mình chưa có thông tin giờ mở cửa, địa chỉ hoặc số điện thoại được xác minh để cung cấp. Mình có thể giúp bạn xem món và đặt hàng trên website nhé!"};
  }

  if(/giao hang|ship|phi ship|freeship|giao den|van chuyen/.test(question)){
    return {text:"Bạn có thể chọn đồ uống và đặt hàng ngay trên website. Phí giao hàng và thời gian giao sẽ được cửa hàng xác nhận ở bước xử lý đơn, nên mình chưa thể báo trước chính xác nhé.",action:"all"};
  }

  if(/dat hang|mua|gio hang|thanh toan|order|dat mon/.test(question)){
    return {text:"Bạn bấm “Xem thực đơn”, thêm món vào giỏ rồi chọn “Tiếp tục đặt hàng” nhé. Mình có thể gợi ý món phù hợp trước khi bạn chốt! 🛒",action:"all"};
  }

  if(/trai cay|hoa qua|cam tuoi|buoi|tao|chuoi|nho|xoai/.test(question)){
    const fruit=products.filter(p=>p.category==="fresh-fruit");
    return {text:fruit.length
      ?"Vườn É có trái cây tươi theo gói như "+fruit.slice(0,4).map(p=>p.name).join(", ")+". Bạn xem giá từng gói trong menu nhé! 🍓"
      :"Bạn có thể xem danh mục trái cây tươi trực tiếp trong thực đơn nhé! 🍓",action:"fruit"};
  }

  if(/nguyen lieu|dinh duong|duong|it ngot|khong duong|di ung|allerg/.test(question)){
    return {text:"Mỗi món có phần “Nguyên liệu” trong thực đơn để bạn tự kiểm tra. Nếu cần tránh thành phần gây dị ứng hoặc thêm/bớt đường, hãy xác nhận trực tiếp với cửa hàng trước khi đặt nhé.",action:"all"};
  }

  if(/sinh to|nuoc ep|menu|thuc don|do uong|goi y|ngon|hom nay|ban chay/.test(question)){
    return {
      text:featured
        ?"Mình gợi ý "+featured.name+" — "+currency(featured.price)+"/ly. "+featured.tagline+"; "+featured.flavour+". Bạn bấm “Xem món” để chọn nhé! 🍹"
        :"Vườn É có nhiều loại nước ép và sinh tố trái cây. Bạn mở thực đơn để chọn món yêu thích nha!",
      action:"all",productId:featured?.id
    };
  }

  if(/xin chao|chao|hello|hi|hey|cam on|thanks/.test(question)){
    return {text:"Vườn É chào bạn! 🌼 Mình là trợ lý tự động, có thể giới thiệu món, giá và hướng dẫn đặt hàng. Bạn muốn uống nước ép hay ăn trái cây tươi nè?",action:"all"};
  }

  return {
    text:"Mình là trợ lý tự động của Vườn É, hiện hỗ trợ tư vấn món, giá từ thực đơn và cách đặt hàng. Bạn thử hỏi “Món mới có gì?”, “Gợi ý nước ép” hoặc “Đặt hàng thế nào?” nhé! 🌿",
    action:"all"
  };
}
