# Nhân viên Vườn É — lời chào và giới thiệu món trong /pixel

## Hành vi

- Nhân viên đứng **yên sau quầy**: không wave, chạy ra sân hoặc đổi vị trí.
- Bong bóng hội thoại neo vào vị trí nhân viên trong thế giới 480×320, di chuyển theo camera desktop/mobile; khi bị khuất trên mobile, hội thoại neo vào góc phía trên để không che nút camera.
- Gồm lời chào, mời mở menu, gợi ý món theo tháng, đề xuất thêm món thứ hai và giới thiệu trái cây tươi. Lời thoại tự đổi khoảng 11 giây một lần, hoặc bấm **Câu khác**; khi khách vừa tới gần quầy, ưu tiên lời chào.
- Mọi sản phẩm được giới thiệu đều lấy từ `data/catalog.ts` theo `months`, không tạo SKU, giá hay khuyến mãi giả. Chỉ gọi là **món mới ra mắt** khi sản phẩm thực sự mang badge `Mới`; còn lại sử dụng **gợi ý mới**.
- **Xem món** mở menu 2D ngay tại `/pixel`; **Xem trái cây** mở đúng danh mục trái cây. Không thay URL.
- **🔈/🔊**: giọng đọc tiếng Việt bằng Web Speech API của trình duyệt, **tắt theo mặc định** và chỉ bật sau khi khách chủ động nhấn; sẽ không phát tiếng nếu thiết bị không hỗ trợ. Văn bản luôn hiển thị để bảo đảm accessibility.
- Không tạo actor mạng, WebGL sprite, game collisions hoặc request server mới. Giữ nguyên `/`.

## QA

`tests/visual/pixel-capture.spec.ts` có ba bài test mới cho cả Chromium desktop/mobile:
1. Chào khách, đổi câu và giới thiệu SKU có thật, mở đúng sản phẩm từ catalog.
2. Bong bóng mở đúng danh mục trái cây tươi.
3. Giọng nói không tự phát, bật/tắt bằng thao tác người dùng, và nói câu tiếp theo khi đã bật.

Kiểm tra thêm bộ Pixel Motion Reviewer trên PR để bảo đảm không suy giảm FPS hoặc lỗi ngồi ghế.
