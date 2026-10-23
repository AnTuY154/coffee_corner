export type SeasonKey = "spring" | "summer" | "autumn" | "winter";
export type Ingredient = { name: string; amount: string };
export type Product = {
  id: string; slug: string; name: string; tagline: string; season: SeasonKey;
  months: number[]; price: number; image: string; colors: [string,string];
  ingredients: Ingredient[]; method: "Ép" | "Xay"; steps: string[];
  flavour: string; description: string; badge?: string;
};
export const seasons: Record<SeasonKey,{label:string;subtitle:string;months:string;index:number;emoji:string;description:string}> = {
  spring:{label:"Mùa xuân",subtitle:"Tinh khôi & dịu ngọt",months:"Tháng 1 – 3",index:0,emoji:"🌱",description:"Cam, quýt, bưởi, dâu tây và dưa hấu: những hương vị sáng trong đầu năm."},
  summer:{label:"Mùa hạ",subtitle:"Rực rỡ & mọng nước",months:"Tháng 4 – 6",index:1,emoji:"☀️",description:"Xoài, dứa, vải, mận và chôm chôm bước vào vụ ngon nhất."},
  autumn:{label:"Mùa thu",subtitle:"Trong lành & ngọt thanh",months:"Tháng 7 – 9",index:2,emoji:"🍂",description:"Nhãn lồng, ổi, bơ, thanh long và na làm nên mùa vị dịu êm."},
  winter:{label:"Cuối năm",subtitle:"Ấm áp & đậm hương",months:"Tháng 10 – 12",index:3,emoji:"🍊",description:"Bưởi, cam, quýt và hồng chín đậm vị khi trời chuyển lạnh."}
};
export const seasonOrder: SeasonKey[] = ["spring","summer","autumn","winter"];
// Typical harvest windows in Vietnam; not an inventory promise.
export const fruitCalendar: Record<number,string[]> = {
  1:["Cam","Quýt","Bưởi","Vú sữa","Dâu tây","Dưa hấu"],
  2:["Cam","Quýt","Bưởi","Dâu tây","Dưa hấu","Ổi"],
  3:["Xoài sớm","Dứa","Dưa hấu","Dâu tây","Vú sữa","Thanh long"],
  4:["Xoài","Dứa","Chôm chôm sớm","Bơ đầu vụ","Mít","Thanh long"],
  5:["Xoài","Vải sớm","Mận","Chôm chôm","Măng cụt","Dứa"],
  6:["Vải","Mận","Măng cụt","Chôm chôm","Dứa","Thanh long"],
  7:["Nhãn sớm","Bơ","Thanh long","Chôm chôm","Na đầu vụ","Ổi"],
  8:["Nhãn lồng","Na","Bơ","Thanh long","Ổi","Bưởi đầu vụ"],
  9:["Na","Bưởi","Hồng đầu vụ","Ổi","Thanh long","Bơ cuối vụ"],
  10:["Bưởi","Hồng giòn","Cam đầu vụ","Ổi","Thanh long","Quýt sớm"],
  11:["Cam","Quýt","Bưởi","Hồng cuối vụ","Ổi","Vú sữa sớm"],
  12:["Cam","Quýt","Bưởi","Dâu tây","Vú sữa","Ổi"]
};
export const fruitNotes: Record<string,string> = {
  "Cam":"Cam có vị chua ngọt cân bằng, mùi thơm vỏ đặc trưng. Mùa vụ thay đổi theo giống và vùng trồng; cam miền Bắc thường ngon vào cuối năm.",
  "Quýt":"Quýt thơm nồng, dễ bóc múi, tạo hậu vị ngọt dịu. Mùa chính của một số giống miền Bắc rơi vào những tháng cuối năm.",
  "Bưởi":"Bưởi mang vị chua thanh, hơi the nhẹ ở màng múi. Bưởi Diễn và nhiều giống bưởi có mùa thu hoạch cuối năm.",
  "Dâu tây":"Dâu tây Đà Lạt thơm nhẹ, có vị chua thanh. Vụ chính thường từ cuối năm đến đầu xuân.",
  "Dưa hấu":"Dưa hấu giàu nước, vị ngọt mát và màu đỏ tự nhiên. Có nhiều vụ trồng trong năm tuỳ vùng.",
  "Ổi":"Ổi giòn, thơm và hơi chát nhẹ; khi ép nên lọc hạt, kết hợp quả mọng nước để cân bằng độ đặc.",
  "Cà rốt":"Cà rốt là rau củ có vị ngọt nhẹ, cho sắc cam tự nhiên, phối hợp hài hoà cùng cam hoặc dứa.",
  "Gừng":"Gừng tạo cảm giác ấm, cay thơm; chỉ dùng một lượng nhỏ để không lấn át vị quả.",
  "Lá bạc hà":"Lá bạc hà là thảo mộc tạo mùi thơm mát, thường dùng làm điểm nhấn cho nước ép trái cây.",
  "Dứa":"Dứa có hương thơm mạnh, vị chua ngọt rõ. Dứa được trồng nhiều vùng và có các vụ thu hoạch khác nhau.",
  "Xoài":"Xoài chín ngọt đậm, thịt mềm, thường thích hợp xay hơn ép. Mùa xoài tại nhiều vùng phía Nam tập trung từ xuân đến đầu hè.",
  "Vải":"Vải thiều thơm hoa, ngọt thanh. Vải miền Bắc thường tập trung thu hoạch cuối tháng 5 đến tháng 6, tuỳ năm.",
  "Chanh":"Chanh có vị chua tươi, thường thêm ít nước cốt sau khi ép để cân bằng vị ngọt.",
  "Chôm chôm":"Chôm chôm ngọt mát, thịt quả mọng. Cần tách hạt trước khi chế biến và xay/lọc kỹ.",
  "Măng cụt":"Măng cụt có thịt trắng, vị chua ngọt nhẹ. Cần lấy phần múi trắng, bỏ vỏ và hạt lớn trước khi xay.",
  "Mận":"Mận hậu chua ngọt, thơm và có màu đỏ hồng. Phổ biến vào khoảng cuối xuân – đầu hè tại miền Bắc.",
  "Nhãn":"Nhãn lồng có vị ngọt đậm, hương thơm riêng. Vụ nhãn Hưng Yên thường rộ trong tháng 7–8.",
  "Bơ":"Bơ có thịt béo, mịn, phù hợp đồ uống xay chứ không phải nước ép nguyên chất. Vụ bơ tập trung từ giữa năm.",
  "Nước dừa":"Nước dừa có vị ngọt dịu, giúp làm loãng hỗn hợp xay; nguồn cung quanh năm ở các tỉnh phía Nam.",
  "Thanh long":"Thanh long ruột đỏ có vị ngọt nhẹ, mọng nước và tạo sắc hồng tím tự nhiên.",
  "Na":"Na chín thơm và ngọt, phải loại bỏ toàn bộ hạt và vỏ trước khi xay.",
  "Chuối":"Chuối có vị ngọt, cấu trúc mịn và được bán quanh năm, phù hợp đồ uống xay.",
  "Hồng giòn":"Hồng giòn có vị ngọt nhẹ và kết cấu chắc; mùa thu hoạch thường vào mùa thu và đầu đông ở vùng cao.",
  "Táo":"Táo có vị giòn ngọt, tạo độ cân bằng; loại bán trên thị trường có thể là hàng nhập khẩu hoặc trồng trong nước.",
  "Tắc":"Tắc/quất có hương vỏ thơm, vị chua rõ; nên dùng lượng vừa phải và lọc hạt.",
  "Chanh dây":"Chanh dây thơm đậm, chua rõ, giúp cân bằng các loại quả ngọt; phần hạt thường lọc bớt.",
  "Dưa leo":"Dưa leo có vị thanh mát, ít ngọt và nhiều nước, phù hợp những công thức nhẹ vị.",
  "Vú sữa":"Vú sữa có thịt mềm, vị ngọt sữa; thích hợp xay và phải loại bỏ vỏ, hạt trước khi dùng."
};
const recipe=(id:string, name:string,tagline:string,season:SeasonKey,months:number[],price:number,colors:[string,string],method:"Ép"|"Xay",ingredients:Ingredient[],flavour:string,description:string,steps:string[],badge?:string):Product=>({id,slug:id,name,tagline,season,months,price,image:`/products/${id}.svg`,colors,method,ingredients,flavour,description,steps,badge});
const ep=["Rửa kỹ nguyên liệu dưới vòi nước sạch; gọt vỏ và bỏ hạt nếu cần.","Ép lần lượt các nguyên liệu, khuấy đều và thưởng thức ngay sau khi làm."];
const xay=["Rửa và sơ chế nguyên liệu; loại bỏ hoàn toàn vỏ, hạt cứng.","Xay cùng 60–100 ml nước lọc hoặc nước dừa (tuỳ độ sánh), rót ra ly và dùng ngay."];
export const products:Product[] = [
  recipe("nang-xuan","Nắng Xuân","Cam mọng · Bưởi thanh","spring",[1,2,3],39000,["#f7b242","#f6de99"],"Ép",[{name:"Cam",amount:"2 quả (~250 g)"},{name:"Bưởi",amount:"100 g múi"}],"Chua ngọt, tươi sáng","Một ly nước ép nhẹ nhàng để bắt đầu buổi sáng, kết hợp cam thơm và bưởi thanh.",ep,"Bán chạy"),
  recipe("hong-da-lat","Hồng Đà Lạt","Dâu tây · Dưa hấu","spring",[1,2,3],45000,["#dc6879","#ffc2a1"],"Xay",[{name:"Dâu tây",amount:"120 g"},{name:"Dưa hấu",amount:"160 g"}],"Ngọt mát, thơm nhẹ","Dâu tây đầu xuân gặp dưa hấu mọng nước, tạo sắc hồng tự nhiên.",xay,"Theo mùa"),
  recipe("buoi-oi-thanh","Bưởi Ổi Thanh","Bưởi · Ổi hồng","spring",[1,2],42000,["#f2a3a0","#f6dbc7"],"Ép",[{name:"Bưởi",amount:"170 g múi"},{name:"Ổi",amount:"100 g"}],"Thanh dịu, thơm ổi","Vị bưởi dịu hòa cùng ổi giòn, dành cho những ai không thích thức uống quá ngọt.",ep),
  recipe("quyt-mat","Quýt Mật","Quýt · Cà rốt","spring",[1,2],39000,["#f38a37","#f9d18d"],"Ép",[{name:"Quýt",amount:"3 quả"},{name:"Cà rốt",amount:"90 g"}],"Ngọt thanh, dịu vị","Quýt tươi đem đến hương thơm dễ chịu, cà rốt góp vị ngọt nhẹ.",ep),
  recipe("dua-hau-bac-ha","Mát Lành","Dưa hấu · Bạc hà","spring",[1,2,3],35000,["#e85869","#f6aca9"],"Ép",[{name:"Dưa hấu",amount:"300 g"},{name:"Lá bạc hà",amount:"3–4 lá"}],"Mát, nhẹ, ít chua","Dưa hấu ngọt mát được điểm xuyết vài lá bạc hà thơm.",ep),
  recipe("cam-gung-som","Sớm Trong","Cam · Cà rốt · Gừng","spring",[1,2],42000,["#ec9044","#f4c995"],"Ép",[{name:"Cam",amount:"2 quả"},{name:"Cà rốt",amount:"80 g"},{name:"Gừng",amount:"2 g"}],"Ngọt, cay thơm nhẹ","Một sự kết hợp ấm áp từ cam, cà rốt và chút gừng.",ep),
  recipe("xoai-nang","Xoài Nắng","Xoài chín · Dứa","summer",[4,5,6],45000,["#ffbd44","#ffe18b"],"Xay",[{name:"Xoài",amount:"180 g"},{name:"Dứa",amount:"100 g"}],"Sánh mịn, thơm nồng","Thịt xoài chín vàng hòa cùng dứa, mang hương vị mùa hè rõ nét.",xay,"Bán chạy"),
  recipe("vai-thang-sau","Vải Tháng Sáu","Vải thiều · Chanh","summer",[5,6],49000,["#eb8b89","#f8c5af"],"Xay",[{name:"Vải",amount:"180 g thịt quả"},{name:"Chanh",amount:"10 ml nước cốt"}],"Ngọt hoa, chua nhẹ","Thưởng thức mùa vải ngắn ngủi trong một ly thơm mát.",xay,"Giới hạn mùa"),
  recipe("chom-chom-nang","Vườn Nhiệt Đới","Chôm chôm · Dứa","summer",[4,5,6],45000,["#efa55b","#f8daab"],"Xay",[{name:"Chôm chôm",amount:"130 g thịt quả"},{name:"Dứa",amount:"120 g"}],"Tươi mát, chua ngọt","Chôm chôm mọng ngọt và dứa thơm nồng tạo nên ly trái cây rực rỡ.",xay),
  recipe("mang-cut-may","Mây Măng Cụt","Măng cụt · Dứa","summer",[5,6],55000,["#d1a3d0","#eee0dd"],"Xay",[{name:"Măng cụt",amount:"140 g múi bỏ hạt lớn"},{name:"Dứa",amount:"90 g"}],"Mềm, thơm, chua nhẹ","Múi măng cụt trắng ngần hòa quyện cùng một chút dứa.",xay,"Giới hạn mùa"),
  recipe("dua-chanh-day","Vàng Rực","Dứa · Chanh dây","summer",[4,5,6],42000,["#f7b51c","#f9e28c"],"Ép",[{name:"Dứa",amount:"250 g"},{name:"Chanh dây",amount:"35 g ruột lọc hạt"}],"Chua tươi, thơm mạnh","Một ly vàng óng với mùi thơm đậm đà của dứa và chanh dây.",ep),
  recipe("man-hau-he","Mận Hậu Hè","Mận hậu · Dưa hấu","summer",[5,6],45000,["#c6657d","#f3a6ab"],"Xay",[{name:"Mận",amount:"130 g bỏ hạt"},{name:"Dưa hấu",amount:"170 g"}],"Chua dịu, ngọt mát","Mận hậu vùng cao hòa với dưa hấu, tạo màu hồng tươi bắt mắt.",xay),
  recipe("nhan-long","Nhãn Lồng","Nhãn Hưng Yên · Tắc","autumn",[7,8],49000,["#e6c273","#f4e6b0"],"Xay",[{name:"Nhãn",amount:"190 g thịt quả"},{name:"Tắc",amount:"1–2 quả, bỏ hạt"}],"Ngọt thơm, chua cân bằng","Lấy cảm hứng từ nhãn lồng mùa thu, thêm chút tắc để vị ngọt trở nên thanh hơn.",xay,"Đặc sản mùa"),
  recipe("bo-dua","Bơ Dừa Dịu","Bơ · Nước dừa","autumn",[7,8,9],49000,["#9bbd71","#e0e8b8"],"Xay",[{name:"Bơ",amount:"160 g"},{name:"Nước dừa",amount:"150 ml"}],"Béo nhẹ, mịn mượt","Một ly trái cây xay sánh mịn từ bơ chín và nước dừa tự nhiên.",xay,"Bán chạy"),
  recipe("thanh-long-oi","Hồng Ban Mai","Thanh long đỏ · Ổi","autumn",[7,8,9],42000,["#db5b87","#edb7c7"],"Xay",[{name:"Thanh long",amount:"180 g"},{name:"Ổi",amount:"90 g"}],"Nhẹ vị, thanh mát","Sắc hồng nổi bật từ thanh long đỏ kết hợp với hương ổi tươi.",xay),
  recipe("na-chuoi","Na Dịu Êm","Na chín · Chuối","autumn",[8,9],45000,["#bbce85","#f3dfad"],"Xay",[{name:"Na",amount:"140 g thịt quả đã bỏ hạt"},{name:"Chuối",amount:"90 g"}],"Mịn, ngọt dịu","Quả na chín kết hợp chuối mang đến thức uống sánh thơm, không cần thêm đường.",xay),
  recipe("oi-dua-le","Ổi Đầu Thu","Ổi · Dứa · Dưa leo","autumn",[7,8,9],39000,["#88bf92","#d3e7a7"],"Ép",[{name:"Ổi",amount:"130 g"},{name:"Dứa",amount:"120 g"},{name:"Dưa leo",amount:"100 g"}],"Mát, chua nhẹ","Sự kết hợp trong trẻo giữa ổi, dứa và dưa leo.",ep),
  recipe("buoi-thu","Bưởi Gió Thu","Bưởi · Thanh long","autumn",[8,9],45000,["#f1a7b2","#f5d9bd"],"Xay",[{name:"Bưởi",amount:"160 g múi"},{name:"Thanh long",amount:"140 g"}],"Thanh ngọt, nhẹ nhàng","Bưởi đầu vụ cùng thanh long tạo nên vị nhẹ, ít gắt.",xay),
  recipe("cam-cao-phong","Cam Đồi","Cam · Gừng","winter",[10,11,12],42000,["#f1a03c","#fad88f"],"Ép",[{name:"Cam",amount:"3 quả"},{name:"Gừng",amount:"2 g"}],"Thơm cam, ấm nhẹ","Lấy cảm hứng từ mùa cam đồi miền Bắc, thêm gừng cho ngày se lạnh.",ep,"Bán chạy"),
  recipe("buoi-dien","Bưởi Vàng","Bưởi · Tắc","winter",[10,11,12],45000,["#f1bf7d","#f7e8b9"],"Ép",[{name:"Bưởi",amount:"250 g múi"},{name:"Tắc",amount:"1 quả, bỏ hạt"}],"Thanh, hơi the","Ly nước ép tôn vị bưởi cuối năm, thơm thanh và dịu ngọt.",ep,"Theo mùa"),
  recipe("quyt-cam","Quýt Vườn","Quýt · Cam","winter",[11,12],39000,["#f6a346","#ffdf99"],"Ép",[{name:"Quýt",amount:"3 quả"},{name:"Cam",amount:"1 quả"}],"Ngọt thơm, dễ uống","Quýt chín thơm quyện cam ngọt, phù hợp mọi buổi trong ngày.",ep),
  recipe("hong-cam","Hồng Mùa Lạnh","Hồng giòn · Cam","winter",[10,11],45000,["#ec8b62","#f5be9b"],"Xay",[{name:"Hồng giòn",amount:"150 g"},{name:"Cam",amount:"120 ml nước ép"}],"Ngọt êm, thơm dịu","Hồng giòn vào mùa cùng cam tươi, một vị êm ngọt đặc trưng cuối thu.",xay),
  recipe("oi-cam","Thanh Sắc","Ổi · Cam","winter",[10,11,12],42000,["#b5c66d","#e6dfaa"],"Ép",[{name:"Ổi",amount:"160 g"},{name:"Cam",amount:"2 quả"}],"Tươi, thơm, chua dịu","Hương ổi gần gũi hòa cùng cam vàng, đủ sáng cho ngày đông.",ep),
  recipe("dau-cam","Dâu Nắng Đông","Dâu tây · Cam","winter",[12],49000,["#dc6e74","#f4b6a0"],"Xay",[{name:"Dâu tây",amount:"150 g"},{name:"Cam",amount:"140 ml nước ép"}],"Chua ngọt, rực rỡ","Khi dâu Đà Lạt bắt đầu vào mùa, một chút cam sẽ làm vị dâu thêm tươi.",xay,"Giới hạn mùa")
];
export const getProduct=(slug:string)=>products.find(p=>p.slug===slug);
export const currency=(n:number)=>new Intl.NumberFormat("vi-VN",{style:"currency",currency:"VND",maximumFractionDigits:0}).format(n);
export const currentSeason=(month:number):SeasonKey=>month<=3?"spring":month<=6?"summer":month<=9?"autumn":"winter";
