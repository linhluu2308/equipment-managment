# plan.md — Kế hoạch triển khai 10 hành động ghi dữ liệu (theo sequence.md)

Nguồn: `docs/2-spec/sequence.md` (10 sơ đồ), `docs/2-spec/design.md` (mục 4 — dữ liệu cần lưu).
Nguyên tắc: mỗi bước làm xong đúng 1 hành động — cả kiểm tra phía máy chủ lẫn giao diện — chạy thử được ngay trước khi sang bước sau. Bước 1 là hành động đơn giản nhất, làm khuôn cho các bước sau.

---

## Bước 1 — Thêm thiết bị mới

**Hành động:** Người dùng điền form, thêm một thiết bị mới vào danh mục.

**Điều kiện kiểm tra trước khi ghi:**
- Trường "Tên thiết bị" không được rỗng.
- Trường "Giá thuê/ngày" không được rỗng và phải là số lớn hơn 0.
- Nếu thiếu 1 trong 2 → không ghi gì cả, báo lỗi ngay.

**Tạo hoặc sửa file:**
- `app/supabase/migrations/0001_thiet_bi.sql` *(mới)* — tạo bảng `thiet_bi` (id, ma, ten, danh_muc, nguon_goc enum `so_huu`/`thue_ngoai`, nha_cung_cap, gia_von, mo_ta, trang_thai enum `san_sang`/`dang_thue`/`bao_tri` mặc định `san_sang`) và bảng `lich_su_gia` (id, thiet_bi_id FK, gia_thue, ngay_ap_dung mặc định ngày hiện tại).
- `app/src/lib/supabase/admin.ts` *(mới)* — client Supabase phía máy chủ dùng secret key, dùng chung cho mọi hành động ghi dữ liệu từ Bước 1 trở đi.
- `app/src/lib/types.ts` *(mới)* — kiểu `ThietBi`, `LichSuGia`, `NguonGoc`, `TrangThaiThietBi`.
- `app/src/lib/actions/thietBi.ts` *(mới)* — hàm `createThietBi(input)` (kiểm tra điều kiện, ghi 2 bảng), hàm `listThietBi()` (đọc danh sách kèm giá hiện hành).
- `app/src/components/equipment/NewEquipmentModal.tsx` *(mới)* — form nhập, gọi `createThietBi`.
- `app/src/components/equipment/EquipmentToolbar.tsx` *(mới)* — nút "+ Thêm thiết bị mới" mở modal.
- `app/src/app/equipment/page.tsx` *(mới)* — trang danh sách, gọi `listThietBi()`, hiển thị bảng.

**Dùng gì từ bước trước / tạo ra gì cho bước sau:**
Không có bước trước. Tạo ra: bảng `thiet_bi` có dữ liệu thật để Bước 2 (import) và Bước 3 (tạo đơn — cần chọn thiết bị) dùng; đồng thời tạo khuôn mẫu (Server Action ghi DB + Client Modal + tải lại danh sách sau khi ghi) mà mọi bước sau lặp lại.

**Cách thử:**
Vào `/equipment`, bấm "+ Thêm thiết bị mới", để trống ô "Tên thiết bị", bấm "Lưu thiết bị" → thấy thông báo lỗi, bảng danh sách không có dòng mới. Điền "Sony FX6" + giá thuê `1500000`, bấm "Lưu thiết bị" → modal đóng, bảng danh sách hiện ngay dòng "Sony FX6 — 1.500.000đ/ngày".

---

## Bước 2 — Import Excel danh sách thiết bị

**Hành động:** Người dùng chọn một file Excel/CSV chứa nhiều dòng thiết bị, xem trước rồi xác nhận import hàng loạt.

**Điều kiện kiểm tra trước khi ghi:**
- Với **từng dòng** trong file: cột "tên" không rỗng VÀ cột "giá thuê" là số lớn hơn 0.
- Dòng nào thiếu 1 trong 2 điều trên → tô đỏ, ghi rõ lỗi trên bảng xem trước, KHÔNG gửi dòng đó lên máy chủ khi bấm Xác nhận Import.
- Máy chủ chỉ nhận và ghi những dòng đã qua được bước lọc ở trình duyệt (không kiểm tra lại lần hai).

**Tạo hoặc sửa file:**
- `app/src/lib/actions/thietBi.ts` *(sửa)* — thêm hàm `importThietBiHangLoat(rows[])`, ghi lặp từng dòng vào `thiet_bi` + `lich_su_gia`, trả về số dòng thành công/thất bại.
- `app/src/components/equipment/ImportExcelModal.tsx` *(mới)* — nút tải file mẫu, ô chọn file, đọc bằng thư viện `xlsx`, bảng xem trước tô đỏ dòng lỗi, nút "Xác nhận Import".
- `app/src/components/equipment/EquipmentToolbar.tsx` *(sửa)* — thêm nút "📥 Import Excel" mở modal này.
- `app/package.json` *(sửa)* — thêm dependency `xlsx`.

**Dùng gì từ bước trước / tạo ra gì cho bước sau:**
Dùng lại bảng `thiet_bi`/`lich_su_gia` và kiểu `ThietBiInput` đã tạo ở Bước 1. Tạo ra: nhiều thiết bị thật trong DB để Bước 3 có đủ lựa chọn khi kiểm thử kiểm tra trùng lịch (cần ít nhất 2 thiết bị khác loại để phân biệt).

**Cách thử:**
Chuẩn bị file Excel 3 dòng, dòng thứ 2 để trống ô giá thuê. Chọn file → bảng xem trước hiện 3 dòng, dòng 2 tô đỏ kèm chữ "Thiếu/sai giá thuê". Bấm "Xác nhận Import" → thấy thông báo "Đã import 2/3 thiết bị thành công", 2 thiết bị hợp lệ xuất hiện ngay trong `/equipment`, dòng lỗi không xuất hiện.

---

## Bước 3 — Tạo đơn thuê mới

**Hành động:** Người dùng nhập thông tin khách hàng, chọn ngày thuê và tick chọn thiết bị để tạo một đơn thuê mới (chặng mặc định "Yêu cầu").

**Điều kiện kiểm tra trước khi ghi:**
- *Ở trình duyệt:* tên khách không rỗng, số điện thoại không rỗng, đã chọn cả ngày bắt đầu và ngày trả dự kiến, đã tick ít nhất 1 thiết bị.
- *Ở máy chủ (kiểm tra lại lần cuối):* với **từng** thiết bị đã chọn — không tồn tại đơn nào khác đang ở chặng "Báo giá", "Đã giao" hoặc "Chờ trả" mà có khoảng ngày `[ngày bắt đầu → ngày trả]` giao nhau với khoảng ngày đang tạo. Chỉ cần 1 thiết bị vi phạm là toàn bộ thao tác tạo đơn bị huỷ, không ghi bất kỳ bảng nào.

**Tạo hoặc sửa file:**
- `app/supabase/migrations/0002_don_thue.sql` *(mới)* — bảng `khach_hang` (id, ten, so_dien_thoai, nguoi_gioi_thieu), bảng `don_thue` (id, khach_hang_id FK, chang enum `yeu_cau`/`bao_gia`/`da_giao`/`cho_tra`/`xong`/`huy` mặc định `yeu_cau`, ngay_bat_dau, ngay_tra_du_kien, ghi_chu, created_at), bảng `don_thue_chi_tiet` (id, don_thue_id FK, thiet_bi_id FK, gia_thue_chot, phan_tram_chiet_khau mặc định 0).
- `app/src/lib/calculations.ts` *(mới)* — hàm `soNgayThue(ngayBatDau, ngayTraDuKien)`, hàm `khoangNgayGiao(...)` dùng để so trùng khoảng ngày.
- `app/src/lib/actions/donThue.ts` *(mới)* — hàm `kiemTraTrungLich(thietBiId, ngayBatDau, ngayTraDuKien)`, hàm `taoDonThue(input)` (gọi kiemTraTrungLich cho từng thiết bị trước khi ghi), hàm `listDonThue()`, hàm `getDonThue(id)`.
- `app/src/lib/types.ts` *(sửa)* — thêm `KhachHang`, `DonThue`, `DonThueChiTiet`, `ChangDon`.
- `app/src/components/orders/NewOrderModal.tsx` *(mới)* — form khách hàng + ngày + danh sách thiết bị dạng checkbox (gọi `listThietBi()` từ Bước 1), tick thiết bị nào gọi ngay `kiemTraTrungLich` để cảnh báo tại chỗ.
- `app/src/components/orders/NewOrderButton.tsx` *(mới)* — nút "+ Tạo đơn mới" mở modal.
- `app/src/app/orders/page.tsx` *(mới)* — trang danh sách đơn, gọi `listDonThue()`.
- `app/src/app/orders/[id]/page.tsx` *(mới)* — trang chi tiết đơn, gọi `getDonThue(id)`, hiển thị khách hàng + ngày + danh sách thiết bị đã chọn.

**Dùng gì từ bước trước / tạo ra gì cho bước sau:**
Dùng bảng `thiet_bi` và hàm `listThietBi()` từ Bước 1 để lấy danh sách + giá hiện hành cho phần tick chọn. Tạo ra: một đơn thuê thật (chặng "Yêu cầu") kèm các dòng chi tiết, để Bước 4 (xoá dòng) và Bước 5 (chuyển chặng) thao tác trực tiếp lên.

**Cách thử:**
Vào `/orders`, bấm "+ Tạo đơn mới", để trống số điện thoại, bấm "Tạo đơn" → thấy lỗi ngay trên form, không chuyển trang. Điền đủ thông tin, tick 1 thiết bị đang "Sẵn sàng", chọn ngày 01/09 → 05/09, bấm "Tạo đơn" → chuyển sang trang chi tiết đơn vừa tạo, thấy đúng khách hàng/ngày/thiết bị vừa chọn. Mở lại "+ Tạo đơn mới" lần hai, tick đúng thiết bị đó với khoảng ngày trùng (ví dụ 03/09 → 04/09) → thấy cảnh báo/lỗi trùng lịch ngay khi tick hoặc khi bấm "Tạo đơn", đơn thứ hai không được tạo.

---

## Bước 4 — Xoá dòng thiết bị khỏi đơn

**Hành động:** Người dùng xoá một dòng thiết bị ra khỏi đơn đang ở chặng "Yêu cầu".

**Điều kiện kiểm tra trước khi ghi:**
- Nút "Xoá" chỉ hiển thị trên giao diện khi `don_thue.chang = 'yeu_cau'` — đây là điều kiện chặn duy nhất, và nó được kiểm tra ở tầng hiển thị (ẩn nút), không kiểm tra lại ở máy chủ.
- Máy chủ chỉ cần dòng chi tiết (`chiTietId`) tồn tại thì xoá được.

**Tạo hoặc sửa file:**
- `app/src/lib/actions/donThue.ts` *(sửa)* — thêm hàm `xoaThietBiKhoiDon(chiTietId, donId)`.
- `app/src/components/orders/RemoveLineButton.tsx` *(mới)* — nút "Xoá", gọi hàm trên.
- `app/src/app/orders/[id]/page.tsx` *(sửa)* — thêm nút Xoá vào cuối mỗi dòng thiết bị, chỉ render khi `chang === 'yeu_cau'`.

**Dùng gì từ bước trước / tạo ra gì cho bước sau:**
Dùng đơn thuê + dòng chi tiết đã tạo ở Bước 3. Không tạo dữ liệu mới cho bước sau, nhưng xác nhận cơ chế "ghi xong tự tải lại giao diện" hoạt động đúng — Bước 5 trở đi tái dùng đúng cơ chế này.

**Cách thử:**
Mở lại đơn vừa tạo ở Bước 3 (đang ở chặng "Yêu cầu"), bấm "Xoá" trên 1 trong các dòng thiết bị → dòng đó biến mất khỏi bảng ngay lập tức, không cần tải lại trang.

---

## Bước 5 — Chuyển chặng đơn thuê

**Hành động:** Người dùng bấm nút chuyển chặng (Lập báo giá / Xác nhận giao thiết bị / Nhận thiết bị về kho / Chốt công nợ & Hoàn tất / Huỷ đơn) trên trang chi tiết đơn.

**Điều kiện kiểm tra trước khi ghi:**
- Chặng đích phải nằm trong danh sách kế tiếp hợp lệ của chặng hiện tại: `yeu_cau → {bao_gia, huy}`, `bao_gia → {da_giao, huy}`, `da_giao → {cho_tra}`, `cho_tra → {xong}`. Sai thứ tự → chặn, không ghi.
- Riêng khi chặng đích là `xong`: với **mọi** dòng trong `don_thue_chi_tiet` của đơn, phải tồn tại ít nhất 1 dòng cùng `thiet_bi_id` trong bảng `kiem_tra_tinh_trang` của đơn đó. Thiếu dù chỉ 1 thiết bị → chặn, không ghi.

**Tạo hoặc sửa file:**
- `app/supabase/migrations/0003_kiem_tra_tinh_trang.sql` *(mới)* — tạo bảng `kiem_tra_tinh_trang` (id, don_thue_id FK, thiet_bi_id FK, ngay_tra, tinh_trang enum `tot`/`tray_xuoc`/`hong`, nguoi_kiem, ghi_chu, created_at, ràng buộc duy nhất theo cặp `(don_thue_id, thiet_bi_id)`). **Bảng này chỉ được tạo ở bước này để câu lệnh kiểm tra điều kiện "chuyển sang Xong" chạy được — chưa có giao diện ghi dữ liệu vào bảng, việc đó nằm ở Bước 10.** Vì bảng luôn rỗng ở bước này, chuyển sang "Xong" sẽ luôn bị chặn — đây là kết quả đúng cần thấy khi thử bước này, không phải lỗi.
- `app/src/lib/actions/donThue.ts` *(sửa)* — thêm hằng `CHUYEN_TIEP` (bảng chuyển chặng hợp lệ), hàm `chuyenChangDon(donId, changMoi)` (kiểm tra transition, kiểm tra kiểm-tra-tình-trạng nếu đích là `xong`, ghi `don_thue.chang`, cập nhật `thiet_bi.trang_thai` của các thiết bị trong đơn: `dang_thue` khi sang `da_giao`, `san_sang` khi sang `xong` hoặc `huy`).
- `app/src/components/orders/OrderActions.tsx` *(mới)* — hiển thị đúng nút chuyển chặng theo `chang` hiện tại, gọi `chuyenChangDon`.
- `app/src/app/orders/[id]/page.tsx` *(sửa)* — thêm `<OrderActions>`, hiển thị badge chặng hiện tại + thanh tiến trình 5 bước.

**Dùng gì từ bước trước / tạo ra gì cho bước sau:**
Dùng đơn + dòng chi tiết từ Bước 3, bảng `thiet_bi` từ Bước 1 (để cập nhật `trang_thai`). Tạo ra: đơn có thể đổi chặng khác "Yêu cầu" → mở khoá điều kiện hiển thị của Bước 6/7/8 (các form đó chỉ hiện khi `chang != 'yeu_cau'`) và Bước 10 (chỉ hiện khi `chang` là `da_giao`/`cho_tra`); bảng `kiem_tra_tinh_trang` đã sẵn sàng để Bước 10 ghi vào.

**Cách thử:**
Mở đơn từ Bước 3 (đang "Yêu cầu"), bấm "Lập báo giá" → badge đổi thành "Báo giá". Bấm "Xác nhận giao thiết bị" → badge đổi "Đã giao"; vào `/equipment` thấy đúng thiết bị đó chuyển trạng thái "Đang thuê". Bấm "Nhận thiết bị về kho" → badge đổi "Chờ trả". Bấm "Chốt công nợ & Hoàn tất" → thấy lỗi "Chưa kiểm tra tình trạng đầy đủ cho tất cả thiết bị trong đơn", chặng KHÔNG đổi.

---

## Bước 6 — Ghi nhận thanh toán

**Hành động:** Người dùng nhập số tiền, chọn loại/hình thức thanh toán và ghi nhận vào đơn.

**Điều kiện kiểm tra trước khi ghi:**
- Trường "Số tiền" phải có giá trị (không rỗng). Rỗng → không gửi đi, form giữ nguyên, không có lỗi hiển thị vì nút không kích hoạt hành động gửi.

**Tạo hoặc sửa file:**
- `app/supabase/migrations/0004_thanh_toan.sql` *(mới)* — bảng `thanh_toan` (id, don_thue_id FK, so_tien, ngay_thu mặc định hôm nay, hinh_thuc, loai enum `coc`/`dot`/`tat_toan`/`hoan_coc`, created_at).
- `app/src/lib/actions/giaoDich.ts` *(mới)* — hàm `ghiThanhToan(donId, input)`.
- `app/src/lib/calculations.ts` *(sửa)* — thêm hàm `tongTienDon(...)`, `tongDaThu(thanhToanList)` (cộng cọc/đợt/tất toán, trừ hoàn cọc).
- `app/src/components/orders/OrderActions.tsx` *(sửa)* — thêm `ThanhToanForm`, chỉ hiện khi `chang !== 'yeu_cau'`.
- `app/src/app/orders/[id]/page.tsx` *(sửa)* — thêm khối "Tài chính": 3 số liệu Tổng tiền đơn/Đã thu/Công nợ còn lại + danh sách "Lịch sử thanh toán".

**Dùng gì từ bước trước / tạo ra gì cho bước sau:**
Dùng đơn đã chuyển chặng khác "Yêu cầu" từ Bước 5 (để thấy được form); dùng giá các dòng chi tiết từ Bước 3 để tính "Tổng tiền đơn". Tạo ra: khối "Tài chính" trên trang chi tiết đơn mà Bước 7 và Bước 8 sẽ bổ sung thêm phần vào đúng khối này.

**Cách thử:**
Mở đơn đang ở chặng "Báo giá" (từ Bước 5), để trống ô số tiền, bấm "Ghi nhận" → không có gì xảy ra, không có dòng mới. Nhập số tiền `6000000`, chọn loại "Cọc tiền", bấm "Ghi nhận" → thấy dòng mới trong "Lịch sử thanh toán" và "Công nợ còn lại" giảm đúng 6.000.000đ.

---

## Bước 7 — Ghi chi phí phát sinh

**Hành động:** Người dùng chọn loại chi phí, nhập mô tả và số tiền, thêm vào đơn.

**Điều kiện kiểm tra trước khi ghi:**
- Trường "Số tiền" phải có giá trị (không rỗng). Rỗng → không gửi đi, form giữ nguyên.

**Tạo hoặc sửa file:**
- `app/supabase/migrations/0005_chi_phi.sql` *(mới)* — bảng `chi_phi` (id, don_thue_id FK, loai, mo_ta, so_tien, created_at).
- `app/src/lib/actions/giaoDich.ts` *(sửa)* — thêm hàm `ghiChiPhi(donId, input)`.
- `app/src/lib/calculations.ts` *(sửa)* — sửa hàm `tongTienDon` để cộng thêm tổng các dòng `chi_phi` vào tổng tiền đơn.
- `app/src/components/orders/OrderActions.tsx` *(sửa)* — thêm `ChiPhiForm`.
- `app/src/app/orders/[id]/page.tsx` *(sửa)* — thêm danh sách "Chi phí phát sinh" vào khối Tài chính.

**Dùng gì từ bước trước / tạo ra gì cho bước sau:**
Dùng khối "Tài chính" và cơ chế form đã có từ Bước 6. Tạo ra: công thức `tongTienDon` đầy đủ (đã gồm cả chi phí phát sinh) — là công thức cuối cùng, không còn thành phần nào bị thiếu cho các bảng số liệu sau này.

**Cách thử:**
Để trống số tiền chi phí, bấm "Thêm chi phí" → không có gì xảy ra. Chọn loại "Vận chuyển", nhập số tiền `200000`, bấm "Thêm chi phí" → thấy dòng mới trong "Chi phí phát sinh", "Tổng tiền đơn" tăng thêm đúng 200.000đ, "Công nợ còn lại" tăng theo tương ứng.

---

## Bước 8 — Thêm cọc giấy tờ

**Hành động:** Người dùng chọn loại giấy tờ, nhập số hiệu, thêm một giấy tờ cọc vào đơn.

**Điều kiện kiểm tra trước khi ghi:**
- Không có trường nào bắt buộc phải điền (loại giấy tờ có giá trị mặc định sẵn là "CCCD"). Điều kiện chặn duy nhất nằm ở máy chủ: `don_thue_id` phải trỏ tới một đơn có thật (ràng buộc khoá ngoại) — nếu đơn không tồn tại thì việc ghi thất bại.

**Tạo hoặc sửa file:**
- `app/supabase/migrations/0006_coc_giay_to.sql` *(mới)* — bảng `coc_giay_to` (id, don_thue_id FK, loai_giay_to, so_hieu, trang_thai enum `dang_giu`/`da_hoan_tra` mặc định `dang_giu`, created_at).
- `app/src/lib/actions/giaoDich.ts` *(sửa)* — thêm hàm `themCocGiayTo(donId, input)`.
- `app/src/components/orders/OrderActions.tsx` *(sửa)* — thêm `CocGiayToForm`.
- `app/src/app/orders/[id]/page.tsx` *(sửa)* — thêm khối "Cọc giấy tờ" hiển thị badge "Đang giữ" trong khối Tài chính.

**Dùng gì từ bước trước / tạo ra gì cho bước sau:**
Dùng đơn ở chặng khác "Yêu cầu" từ Bước 5; khối "Tài chính" từ Bước 6/7. Tạo ra: một giấy tờ cọc ở trạng thái "Đang giữ" để Bước 9 có dữ liệu thao tác.

**Cách thử:**
Mở đơn đang ở chặng "Báo giá" hoặc sau đó, chọn loại "CCCD", nhập số hiệu "079123456789", bấm "Thêm giấy tờ cọc" → thấy ngay badge "🪪 CCCD · 079123456789 · Đang giữ" trong khối Tài chính.

---

## Bước 9 — Đánh dấu đã hoàn trả giấy tờ cọc

**Hành động:** Người dùng bấm nút đánh dấu một giấy tờ cọc đang giữ là đã trả lại cho khách.

**Điều kiện kiểm tra trước khi ghi:**
- Nút chỉ hiển thị trên giao diện với giấy tờ đang có `trang_thai = 'dang_giu'` — đây là điều kiện chặn duy nhất, kiểm tra ở tầng hiển thị.
- Máy chủ chỉ cần id giấy tờ tồn tại thì cập nhật được.

**Tạo hoặc sửa file:**
- `app/src/lib/actions/giaoDich.ts` *(sửa)* — thêm hàm `hoanTraGiayTo(id, donId)`.
- `app/src/components/orders/OrderActions.tsx` *(sửa)* — thêm nút "Đánh dấu đã hoàn trả giấy tờ" hiển thị dưới mỗi giấy tờ đang có badge "Đang giữ".

**Dùng gì từ bước trước / tạo ra gì cho bước sau:**
Dùng giấy tờ cọc đã thêm ở Bước 8. Không tạo dữ liệu mới cho bước sau — đây là bước khép kín luồng cọc giấy tờ.

**Cách thử:**
Bấm nút "Đánh dấu đã hoàn trả giấy tờ" trên giấy tờ vừa thêm ở Bước 8 → badge đổi thành "✓ Đã hoàn trả", nút biến mất khỏi giấy tờ đó.

---

## Bước 10 — Ghi biên bản kiểm tra tình trạng

**Hành động:** Người dùng chọn thiết bị, chọn tình trạng (Tốt/Trầy xước/Hỏng hóc), nhập người kiểm và ghi chú, lưu biên bản kiểm tra khi trả.

**Điều kiện kiểm tra trước khi ghi:**
- Trường "Thiết bị" phải chọn được một giá trị (không rỗng). Rỗng → không gửi đi.
- Form chỉ hiển thị trên giao diện khi đơn đang ở chặng `da_giao` hoặc `cho_tra`.
- Nếu đã có bản ghi kiểm tra cho đúng cặp (đơn, thiết bị) đó rồi thì ghi đè lên bản cũ (không tạo bản trùng) — dựa vào ràng buộc duy nhất `(don_thue_id, thiet_bi_id)` đã tạo ở Bước 5.

**Tạo hoặc sửa file:**
- `app/src/lib/actions/giaoDich.ts` *(sửa)* — thêm hàm `ghiKiemTraTinhTrang(donId, input)`, dùng UPSERT theo cặp `(don_thue_id, thiet_bi_id)`.
- `app/src/components/orders/OrderActions.tsx` *(sửa)* — thêm `KiemTraForm`, chỉ hiện khi `chang === 'da_giao'` hoặc `chang === 'cho_tra'`.
- `app/src/app/orders/[id]/page.tsx` *(sửa)* — thêm khối "Biên bản kiểm tra khi trả": mỗi thiết bị trong đơn hiện badge Tốt/Trầy xước/Hỏng hóc hoặc "Chưa kiểm tra"; khối này chỉ hiện khi chặng là `da_giao`/`cho_tra`/`xong`.

**Dùng gì từ bước trước / tạo ra gì cho bước sau:**
Dùng bảng `kiem_tra_tinh_trang` đã tạo ở Bước 5; đơn đang ở chặng `da_giao`/`cho_tra` (Bước 5); danh sách thiết bị trong đơn (Bước 3). Đây là bước cuối cùng trong kế hoạch — hoàn tất điều kiện còn thiếu ở Bước 5.

**Cách thử:**
Mở lại đúng đơn đã dùng ở Bước 5 (đang ở chặng "Chờ trả", trước đó đã bị chặn không chuyển sang "Xong" được). Với từng thiết bị trong đơn: chọn thiết bị, chọn tình trạng "Tốt", nhập người kiểm "Minh Kho", bấm "Lưu kiểm tra" → badge "Tốt" xuất hiện trong khối Biên bản kiểm tra ứng với đúng thiết bị đó. Ghi đủ cho tất cả thiết bị trong đơn xong, quay lại bấm "Chốt công nợ & Hoàn tất" (nút đã thử và bị chặn ở Bước 5) → lần này chuyển chặng thành công sang "Xong"; vào `/equipment` thấy các thiết bị trong đơn đã chuyển lại về trạng thái "Sẵn sàng".
