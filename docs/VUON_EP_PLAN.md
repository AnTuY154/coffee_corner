# Vườn Ép — SPEC website nước ép theo mùa

Next.js App Router + React + TypeScript, thiết kế mới từ đầu theo hướng Fresh Botanical: xanh lá, kem, sắc trái cây; animation nhẹ và tương thích giảm chuyển động.

## Khách hàng và luồng mua

- Trang chủ: hero, bốn mùa, món theo tháng, giới thiệu cửa hàng.
- /menu: 24 món, lọc theo mùa, tháng và nguyên liệu.
- /san-pham/[slug]: ảnh riêng, giá, nguyên liệu có định lượng, cách làm, giải thích quả.
- /lich-mua: lịch tháng 1–12 và nguồn nghiên cứu.
- /gio-hang: giỏ hàng lưu trên thiết bị, chỉnh số lượng.
- /thanh-toan: tên, số điện thoại, địa chỉ, ghi chú, COD hoặc chuyển khoản sau xác nhận.
- /ve-chung-toi: thông tin người bán, giờ mở cửa, địa chỉ và liên hệ.

## 4 bộ sưu tập, 6 món/mùa

Xuân tháng 1–3: cam, quýt, bưởi, dâu tây, dưa hấu.
Hạ tháng 4–6: xoài, vải, mận, dứa, chôm chôm, măng cụt.
Thu tháng 7–9: nhãn lồng, bơ, thanh long, na, ổi.
Cuối năm tháng 10–12: cam, quýt, bưởi, hồng giòn, dâu tây.

Lịch vụ theo tỉnh/vùng/giống và thời tiết, không cam kết còn nguyên liệu. Phân biệt chế biến bằng ép và xay. Nghiên cứu: https://www.aciar.gov.au/sites/default/files/legacy/node/13111/tr26_pdf_40751.pdf và https://baotintuc.vn/kinh-te/mua-vai-2026-chu-trong-chat-luong-thuong-hieu-va-gia-tri-gia-tang-20260528064735360.htm

## Đặt hàng → Google Sheets

Next.js API xác thực dữ liệu, tính lại đơn giá ở server, dùng ID cố định để chống ghi trùng. Next server gửi tới Google Apps Script /exec bằng secret nằm trong server env, Script khóa ghi, khử trùng lặp, ngăn formula injection và append vào Orders. Chỉ hiển thị thành công nếu Sheet trả xác nhận ghi. Phí giao và tình trạng hàng phải được người bán xác nhận, chưa thanh toán online.

## 5 vòng review

1. Seasonality: tránh gọi tháng 10 là chính đông và cảnh báo sai khác vùng.
2. Culinary: phân biệt ép/xay, bổ sung công thức và giới thiệu quả.
3. UX: biểu thị tạm tính và yêu cầu xác nhận, không báo đặt hàng xong như đã giao.
4. Security: server pricing, shared secret, request UUID, Apps Script lock/formula escaping.
5. Responsive & a11y: focus/label/alt/reduced-motion và SEO metadata.

Còn cần: logo/tên thương hiệu chính thức, số điện thoại, địa chỉ, giờ bán, giá thật, hình chụp thức uống, khu vực giao hàng, Google Spreadsheet ID + Apps Script deployment, kiểm tra thiết bị thực.

**Trạng thái:** đây là kế hoạch và tiêu chí triển khai; bản nguồn Next.js đầy đủ được đóng gói riêng để cung cấp cho chủ repository. Chưa public deploy hay xác nhận ghi Sheet thực.
