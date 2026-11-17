# Vườn Ép /pixel — checklist triển khai 2026-11-17

- [x] **T01 — Branding:** thay chữ `Fresh Juice` trên biển hiệu đã nằm trong `scene.webp` bằng sprite biển hiệu **Vườn Ép** có dấu tiếng Việt; cập nhật header/meta riêng của `/pixel`. Không sửa lại website cũ `/` hoặc tấm nền master.
- [x] **T02 — Câu thoại:** tự chuyển sau **6 giây**, không cần nhấn; vòng lặp không lặp ngay câu trước; có hiệu ứng xuất hiện nhẹ, dừng khi menu/chat/bubble đang tương tác; chế độ giảm chuyển động vẫn đổi **nội dung** nhưng bỏ animation.
- [x] **T03 — Nhân viên:** sprite gốc riêng 96×108 có nửa người, mái tóc, mắt, tạp dề và 3 frame vẫy tay; đứng cố định sau quầy, chỉ cánh tay chuyển động. Tìm và so sánh mẫu miễn phí: [Modern Rooms & People](https://happyhustle.itch.io/modern-rooms-people) (6 nhân vật gồm barista), [Modern Town Characters Vol.2 Free Sample](https://chuckyassets.itch.io/modern-town-characters-vol2-free-sample) (barista 4 hướng). Đều cho phép dùng thương mại; **không nhúng asset bên thứ ba** khi chưa tải và kiểm định giấy phép trực tiếp. Mẫu SVG dùng trong PR do dự án tự vẽ.
- [x] **T04 — Fullscreen:** `/pixel` là scene toàn viewport `100dvh × 100vw` không khung, tỉ lệ bản đồ 480×320 giữ nguyên; camera contain để không cắt biển hiệu/bàn, background cover mờ giúp không còn khoảng trắng hai bên.
- [x] **T05 — HUD overlay:** header, room status, camera controls, help, D-pad, mobile shopping dock và chat launcher nổi đè scene với nền translucency + backdrop-blur, hồi sáng khi hover/focus, kiểm tra contrast của nút đang thao tác và tình trạng ngồi.
- [ ] **T06 — QA trên Chrome thực:** Playwright desktop/mobile kiểm tra chữ `Vườn Ép` và không còn `Fresh Juice` trên nhãn foreground, auto đổi thoại, pause hover/menu/chat, full-viewport, opacity overlay, camera-to-seat, chat, test 15 ghế, 5 vị trí che, FPS, no regression `/`.
- [ ] **T07 — Publish:** merge chỉ sau QA PASS; xác minh Vercel. Mọi bài test không được bỏ qua lỗi vì thiếu asset hay API.
 
## Quy tắc không thay đổi
- Route `/` và checkout cũ giữ nguyên; thay đổi chỉ trong `/pixel` và module dùng riêng cho Pixel Art.
- Bảo toàn `SCENE_WIDTH=480`, `SCENE_HEIGHT=320`, 15 `SEATS`, 4 `HOTSPOTS`, realtime protocol, pet routes và fallback nếu thiếu WebGL.
- Hình raster có dòng Fresh Juice đã lưu trong `scene.webp` và `roof-sign.webp`; không xóa ảnh gốc. Sprite Vườn Ép mới đặt đè vùng chữ này ở đúng toạ độ thế giới trong PixiJS. Nếu cần chuyển sang 100% ảnh đã chỉnh, cần tái xuất WebP gốc và vùng sprite trong bước thiết kế sau.
