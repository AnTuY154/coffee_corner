# Vườn Ép — cửa hàng 3D nhập vai (MVP)

## Người dùng cần làm được
1. Mở `/3d-shop`, thấy quầy bán nước ép từ bên ngoài (biển hiệu, mái che, quầy, máy ép, máy xay, trái cây, cây, ánh sáng).
2. Desktop: nhấn WASD / phím mũi tên để đi, kéo chuột để nhìn; di chuyển đến cạnh quầy, có prompt E. Nhấn E để xem thực đơn.
3. Mobile: kéo để nhìn, chạm điều hướng hoặc chọn "Đi đến quầy & xem menu" để được dẫn tới quầy; menu chỉ hiện sau khi camera đến đúng vùng tương tác.
4. Menu hiển thị 4 mùa × 6 sản phẩm = 24 món từ chung `data/catalog.ts`, có ảnh, giá và liên kết công thức. Thêm món dùng chung `CartContext`.
5. Đóng menu để trở về cửa hàng, hoặc đi tới `/gio-hang` và `/thanh-toan` của website hiện tại.
6. Khi WebGL không khả dụng có trang fallback mở `/menu` bình thường; không chặn đặt hàng.

## Scene world
Camera bắt đầu tại (0,1.74,9.4), nhìn về hướng -Z; quầy ở z=-1.85, không cho người dùng xuyên quầy (z>=1.9); trigger mở menu ở |x|<=3.5, z<=3.25. Mô hình giai đoạn đầu dựng bằng hình học procedural R3F để tránh phụ thuộc asset không có giấy phép. Các asset Blender glTF optimised sẽ nâng cấp dần.

## Kiến trúc
- Next.js 15, React 19, R3F v9, Drei v10, Three.js.
- `components/3d-shop/world.tsx`: cảnh, ánh sáng, quầy, props, camera.
- `components/3d-shop/types.ts`: luật chuyển động và collision, không phụ thuộc WebGL; có test Node.
- `components/3d-shop/immersive-shop.tsx`: game HUD, control, menu, cart, responsive, fallback.
- `/3d-shop`: immersive route; `/menu`: alternative traditional ordering.
- Mọi thanh toán vẫn qua API server hiện có, không đưa dữ liệu cá nhân vào three scene. Google Sheets cần Web App được deploy và secrets từ server.

## Trải nghiệm và kiểm thử
- Nội dung tiếng Việt và bảng giá vẫn HTML, không rasterize trong WebGL; menu đủ đọc bằng keyboard/screen reader.
- Có thể chọn "Đi tới menu ngay" thay cho việc phải đi lại liên tục.
- `npm run test:3d` kiểm tra đi bộ, collision, auto-walk, E, fallback, liên kết giỏ hàng.
- `npm run typecheck` + `npm run build` CI gate; kiểm thử trực quan trên máy thật chưa được xác nhận chỉ bằng code.
- Chỉ áp dụng chuyển động chậm nếu prefers-reduced-motion không được bật; thiết bị yếu giảm DPR/shadows.

## Tiêu chí lần sau
- Nâng cấp asset GLB chất lượng sản phẩm, mô phỏng rót nước nhưng chỉ sau khi đo FPS.
- Hiệu năng mục tiêu: 60fps desktop, >=30fps điện thoại phổ thông, kiểm tra thực tế trên 3G/4G.
- Chỉ hiển thị thông tin người bán/địa chỉ thật sau khi chủ shop cung cấp; không tạo thông tin giả.
