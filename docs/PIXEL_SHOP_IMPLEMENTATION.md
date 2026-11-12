# Vườn É Pixel Art 2D — triển khai và nghiệm thu

Baseline: main@f9e36b394df4e1bd0e01c89e2f46d58c21c0d56f (09/11/2026).

Tài liệu nguồn: vuon-e-pixel-art-2d-20-khach.md. Đây là bản triển khai theo mốc, không đồng nghĩa nghiệm thu G0–G6.

## Phạm vi

- Route /pixel-shop cho desktop và mobile. / giữ nguyên đến khi đủ bằng chứng QA.
- Không dùng ảnh nền có nhân vật được vẽ sẵn. Actor được vẽ riêng để không có bóng nhân vật thừa.
- /pixel-shop cho mua nước ép và trái cây theo gói, giữ riêng giỏ với khách khác. API chỉ xác nhận đơn khi nơi nhận trả thành công.
- Tọa độ sân 480x270, đơn vị pixel; nav bước 4 px, 15 chỗ ngồi.
- Một Worker + Durable Object cho sân garden-main. Socket chỉ chuyển intent, không broadcast tọa độ mỗi frame.

## Chạy tại máy

```bash
npm ci
npm run test:garden:unit
npm run typecheck
npm run build
npm run dev
```

Mở /pixel-shop để thử. Nếu chưa cấu hình NEXT_PUBLIC_GARDEN_HTTP_URL, UI hiển thị rõ là chế độ tham quan một người, **không** giả lập 19 người thật.

## Triển khai realtime

```bash
cd realtime
npm install
npx wrangler secret put GUEST_SECRET
npx wrangler deploy
```

Thiết lập ALLOWED_ORIGINS bằng origin thật của Next.js, NEXT_PUBLIC_GARDEN_HTTP_URL bằng URL Worker HTTPS. Giữ website và Worker trên cùng site, cấu hình cookie/CORS; tránh dùng GH Pages làm host đặt hàng thật. Chạy các phép thử 2 profile rồi 20 profile trước khi bật cờ tại /.

## QA chưa thể xem là PASS khi chưa kiểm

QA01 build Next và Worker; QA02 ảnh desktop/mobile; QA03 hotspot/camera/keyboard; QA04 path; QA05 roster 20 người, takeover; QA06 tranh ghế; QA07 DO hibernate; QA08 20 kết nối 30 phút; QA09 giỏ và trái cây; QA10 retry đồng nhất trên Sheet staging; QA11 thiết bị thật; QA12 lỗi WebGL, WS, API, rollback.

Để rollback: giữ route cũ, tắt cờ NEXT_PUBLIC_PIXEL_SHOP_ENABLED nếu đã bật trên /; không xóa cart localStorage.
