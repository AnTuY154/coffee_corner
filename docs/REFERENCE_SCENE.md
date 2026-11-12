# Vườn É — bóc tách ảnh Fresh Juice 1536×1024 thành UI Pixel Art tương tác

## Nguyên tắc
Ảnh người dùng cung cấp là **master reference**, không phải asset Kenney hoặc hình có giấy phép CC0.
Không công bố lại như ảnh có bản quyền tự do. Không phóng to sprite Kenney 16px lên làm toàn bộ ngôi nhà: mức chi tiết sẽ kém mẫu.

- Gốc: 1536×1024, 3:2; game mới: 480×320, 3:2 (X/3.2, Y/3.2).
- Nền WebP nguồn `public/pixel-shop/reference/scene.webp`, giữ bố cục.
- Các **sprite tách riêng** là PNG source -> WebP alpha: các phần tiền cảnh có thể che nhân vật bằng PixiJS y-sort. Toàn bộ bundle WebP ~1 MB.
- Nếu bundle thiếu, ứng dụng vẫn dùng art Kenney hiện tại như fallback, không giả lập ảnh tham chiếu đã được triển khai.
- Giao diện thương mại HTML accessible, camera và WebSocket Worker không phụ thuộc asset.

## Inventory — item, tọa độ source image, game layer

| Item | Vùng trong ảnh gốc (x,y,w,h) | Implementation | Thư viện/nguồn |
|---|---|---|---|
| Trời, mây, núi, thành phố | Full-frame | scene.webp (background) | Artwork người dùng cung cấp |
| Tán cây bên trái | 0,0,605,480 | tree-canopy-left.webp, depth layer | PixiJS Sprite |
| Tán cây bên phải | 1120,65,415,553 | tree-canopy-right.webp, depth layer | PixiJS Sprite |
| Mái ngói, dây leo, mái hiên | 181,0,1196,300 | canopy.webp | PixiJS Sprite |
| Biển Fresh Juice | 562,113,483,113 | roof-sign.webp | PixiJS Sprite |
| Bảng Menu | 965,292,257,175 | menu-board.webp + interactive hotspot | PixiJS + React |
| Quầy gọi món, mặt gỗ | 633,526,603,164 | counter-front.webp (che nửa thân staff) | PixiJS y-sort |
| Tủ trái cây | 1017,456,208,106 | fruit-display.webp + fruit hotspot | PixiJS + React |
| Máy ép, máy xay, ly, poster, bench, hoa | Phần kiến trúc/đạo cụ tĩnh | Nằm trong scene.webp, không tải ảnh riêng | Asset gốc |
| Đèn dây | ~17..350, y32..96 game | điểm glow/nhịp màu rất nhẹ | PixiJS Graphics |
| Bàn có dù bên trái | 8,544,361,286 | table-left.webp, depth | PixiJS Sprite |
| Bàn có dù giữa | 584,581,328,285 | table-center.webp, depth | PixiJS Sprite |
| Bàn có dù bên phải | 1180,542,355,288 | table-right.webp, depth | PixiJS Sprite |
| Bàn trước bên trái | 270,714,325,248 | table-back-left.webp, depth | PixiJS Sprite |
| Bàn trước bên phải | 902,713,347,253 | table-back-right.webp, depth | PixiJS Sprite |
| Nhân viên, khách, chó/mèo | Dynamic | render rời bằng Graphics, có thể thay spritesheet | PixiJS 8 |
| Order Here/Counter | Source x~875..1050,y557..612 | daily / counter hotspot | React menu/modal |

### Mapping tương tác
Từ ảnh gốc nhân 0.3125: menu `303,93,78,49`; fruit `320,144,61,34`; daily `273,174,58,17`; counter `203,165,179,47`.
Điểm điều hướng sân ở nửa dưới ảnh, `y=216..308`. 5 cụm bàn, 15 ghế logic giữ nguyên ID `table-N-(left/right/bottom)`.
Ảnh tham chiếu hiện chỉ vẽ khoảng **hai ghế thực tế mỗi bàn**, trong khi yêu cầu phòng là 15 seat slots. Cần bổ sung 5 sprite ghế đồng bộ hoặc thiết kế lại vị trí seat slots trước nghiệm thu production.

## Asset và giấy phép dùng được
- **PixiJS 8**: renderer hiện có, sử dụng `Assets.load`, `Texture`, `Sprite`, `Graphics` và `sortableChildren`. https://pixijs.com/8.x/guides/components/textures
- **Kenney Tiny Farm/Tiny Town**: CC0, dùng cho fallback/các props 16×16. https://kenney.nl/assets/tiny-farm và https://kenney.nl/assets/tiny-town
- **Corner Cafe & Bookshop 16×16**: có bản free (cần đối chiếu điều kiện giấy phép trong gói tải); phù hợp máy pha/cửa, ghế, ly nhưng style thấp-resolution hơn ảnh. https://hopefulsham.itch.io/corner-cafe-free-tileset
- **Cozy Shops**: props CC0, góc isometric không khớp trực tiếp phối cảnh front-facing 3/4 của mẫu nên chỉ làm nguồn tham khảo. https://ptdesigns.itch.io/cozy-shops-pixel-art-props-tiles
- **Tiled Map Editor** (optional): dùng để tái dựng tilemap nếu chuyển sang đồ họa hoàn toàn vector/sprite về sau. https://www.mapeditor.org/
- **Aseprite/LibreSprite** (optional): chỉnh sửa transparent sprites và frame; LibreSprite miễn phí mã nguồn mở. https://libresprite.github.io/

Không thể tái tạo độ chi tiết của ảnh 1536×1024 chỉ bằng bộ Tiny Farm 16×16 và vài Pixi Graphics. Để giữ độ đẹp, dùng nguồn ảnh người dùng sở hữu làm nền master, các vùng tương tác và occlusion là sprite rời.

## Cài asset pack
Giải nén `vuon-e-reference-asset-pack.zip` vào root của repo (zip chứa `public/pixel-shop/reference/*`). Kiểm tra có `public/pixel-shop/reference/scene.webp`; sau đó `npm run test:reference-art:required` và `npm run build`.
**Binary master assets phải được commit lên nhánh cùng với mã nguồn** trước khi coi visual QA là hoàn tất. Thiếu file thì ứng dụng fallback sang Kenney cũ.

## Release checklist
1. Build/Typecheck, 15 seats, 4 hotspots, src image atlas, clicks precise.
2. Desktop canvas, laptop toàn cảnh không cắt; mobile 390×844 camera theo khách / Toàn sân, giỏ và menu.
3. Staff behind-counter occlusion, visitor y-sort across 5 table PNG layers.
4. Worker staging `pixel-garden-2` và `pixel-nav-2` cùng deploy; 2/20 users, seat race, reconnect, 30 minutes.
5. Images/trace verified; PR Draft until all gates pass.
