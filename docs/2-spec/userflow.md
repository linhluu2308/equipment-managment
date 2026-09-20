# userflow.md — Luồng người dùng hệ thống CineB Equipment Rental

Tài liệu này mô tả chi tiết luồng tương tác của **Chủ** và **Nhân viên kho** trên 5 màn hình của hệ thống CineB, kèm sơ đồ luồng dạng ASCII.

---

## 1. Sơ đồ điều hướng tổng thể (Navigation Flow)

```text
                       +-----------------------------+
                       |       CINEB WEBAPP          |
                       | (Thanh điều hướng Sidebar)  |
                       +--+-------+-------+-------+--+
                          |       |       |       |
         +----------------+  +----+   +---+   +---+-----------+
         |                   |            |                    |
         v                   v            v                    v
+-----------------+ +---------------+ +-----------------+ +-----------------+   +-----------------+
| MÀN 1: TỔNG QUAN| | MÀN 2: ĐƠN THUÊ| | MÀN 3: THIẾT BỊ | | MÀN 4: CALENDAR |   | MÀN 5: BÁO CÁO  |
|  (Dashboard)    | | (Core Ops)    | | (Asset/Profit)  | | (Planning Grid) |   | (Chỉ Chủ)       |
+--------+--------+ +-------+-------+ +--------+--------+ +--------+--------+   +-----------------+
         |                  ^                  |                   |
         | Bấm vào đơn      |                  | Xem lịch sử thuê  | Bấm vào thanh sự kiện
         +------------------+                  | & chi tiết thiết  +-------+
         |                                     | bị                |       |
         +-------------------------------------+-------------------+-------+
                                               |
                                               v
                                  [Xem chi tiết đơn tại Màn 2]
```

*Màn 5 (Báo cáo) chỉ xuất hiện trên sidebar khi đang xem ở vai Chủ; không có luồng điều hướng đi ra từ đó sang màn khác.*

---

## 2. Luồng chi tiết: Vòng đời đơn thuê (Màn 2)

```text
[ Khách hàng liên hệ ]
         |
         v
+-------------------------------------------------------------------------------+
| BƯỚC 1: TẠO ĐƠN THUÊ (Chặng: YÊU CẦU)                                         |
| - Bấm "+ Tạo đơn mới" trên /orders → mở modal (không có route riêng)          |
| - Nhập thông tin khách: Tên, SĐT, Người giới thiệu                            |
| - CHỌN NGÀY THUÊ: Ngày bắt đầu → Ngày trả dự kiến                             |
| - TÌM & CHỌN THIẾT BỊ:                                                        |
|   + Gõ ô tìm kiếm theo tên/mã thiết bị                                        |
|   + Bấm tag lọc theo danh mục (danh sách tag lấy động theo dữ liệu thực tế)   |
|   + Tick chọn thiết bị, nhập % chiết khấu riêng cho từng dòng đã chọn         |
| - Ghi chú đơn hàng (không bắt buộc)                                           |
+---------------------------------------+---------------------------------------+
                                        |
                                        v
                        /-------------------------------\
                       <  Thiết bị đã tick có trùng lịch  >
                       <  với đơn khác không?              >
                        \-------------------------------/
                               /                \
                     (Trùng lịch)             (Còn trống)
                             /                    \
                            v                      v
             +-----------------------+   +-------------------------------------+
             | Hiện badge cảnh báo   |   | Cho phép chọn bình thường            |
             | ngay trên dòng đó     |   | (giá thuê tự lấy giá hiện hành)      |
             +-----------------------+   +------------------+------------------+
                                                            |
                                                            v
                          Bấm "Tạo đơn" → server kiểm tra lại trùng lịch lần cuối
                                                            |
                              (Có thiết bị đã bị khoá cứng)   |   (Hợp lệ)
                                     /                        \
                                    v                          v
                     Báo lỗi, không tạo đơn         Tạo khách hàng + đơn (chặng
                                                     Yêu cầu) + các dòng thiết bị,
                                                     chuyển thẳng sang trang chi
                                                     tiết đơn vừa tạo
                                                            |
                                                            v
+-------------------------------------------------------------------------------+
| BƯỚC 2: LẬP BÁO GIÁ (Chặng: BÁO GIÁ)                                          |
| - Từ trang chi tiết đơn, bấm [Lập báo giá] để chuyển chặng                    |
| - App tự tính: Tổng tiền = Σ(Đơn giá × Số ngày × (1 − %CK riêng dòng))        |
|                             + Chi phí phát sinh (nếu có)                      |
| - (Chưa có tính năng xuất file/PDF báo giá gửi khách)                         |
+---------------------------------------+---------------------------------------+
                                        |
                        /-------------------------------\
                       <         Khách chốt đơn?        >
                        \-------------------------------/
                               /                \
                          (Không)              (Đồng ý)
                             /                    \
                            v                      v
             +-----------------------+   +-------------------------------------+
             | Bấm [Huỷ đơn]         |   | Bấm [Xác nhận giao thiết bị]        |
             | → chặng "Đã huỷ"      |   | (không bị chặn dù chưa ghi cọc)     |
             +-----------------------+   | Có thể ghi trước/sau: Cọc tiền mặt/ |
                                         | chuyển khoản, Cọc giấy tờ (CCCD,     |
                                         | Bằng lái, Cà vẹt xe, Passport, Khác  |
                                         | + số hiệu — chưa có ô đính kèm ảnh)  |
                                         +------------------+------------------+
                                                            |
                                                            v
+-------------------------------------------------------------------------------+
| BƯỚC 3: GIAO THIẾT BỊ (Chặng: ĐÃ GIAO)                                        |
| - Thiết bị trong đơn tự chuyển trạng thái "Đang thuê" (Màn 3)                 |
| - Thiết bị bị KHOÁ CỨNG trên availability check cho các đơn khác trùng ngày   |
| - Có thể ghi kiểm tra tình trạng ngay từ chặng này (không cần đợi Chờ trả)    |
+---------------------------------------+---------------------------------------+
                                        |
                                        v
+-------------------------------------------------------------------------------+
| BƯỚC 4: NHẬN THIẾT BỊ VỀ KHO (Chặng: CHỜ TRẢ)                                 |
| - Bấm [Nhận thiết bị về kho] để chuyển chặng                                  |
| - Ghi BIÊN BẢN KIỂM TRA cho từng thiết bị: chọn thiết bị → tình trạng          |
|   (Tốt / Trầy xước / Hỏng hóc) → người kiểm → ghi chú                         |
| - Ghi chi phí phát sinh nếu có (vận chuyển, bồi thường, phụ phí)              |
| - Ghi thêm thanh toán/hoàn cọc nếu cần                                        |
+---------------------------------------+---------------------------------------+
                                        |
                                        v
+-------------------------------------------------------------------------------+
| BƯỚC 5: CHỐT CÔNG NỢ & HOÀN TẤT (Chặng: XONG)                                 |
| - Bấm [Chốt công nợ & Hoàn tất]                                               |
| - App kiểm tra: đã có bản ghi kiểm tra tình trạng cho ĐỦ mọi thiết bị trong    |
|   đơn chưa? Thiếu một thiết bị → chặn lại, báo lỗi rõ ràng                    |
| - KHÔNG bắt buộc công nợ phải về 0, KHÔNG bắt buộc đã đánh dấu hoàn trả       |
|   giấy tờ cọc trước khi chốt (hai việc này độc lập, có thể làm trước/sau)     |
| - Chuyển chặng "Xong" (ẩn hết khu vực Thao tác), thiết bị trong đơn tự chuyển |
|   trạng thái về "Sẵn sàng"                                                    |
| - Doanh thu/lợi nhuận của các thiết bị trong đơn cập nhật ngay ở Màn 3 &      |
|   Màn 5 (Báo cáo)                                                             |
+-------------------------------------------------------------------------------+
```

---

## 3. Luồng kiểm tra trùng lịch thiết bị (Availability Check Logic)

```text
              [ Người dùng tick chọn Thiết bị X trong khoảng ngày [D1 -> D2] ]
                                         |
                                         v
                     +---------------------------------------+
                     | Quét các dòng đơn khác đang chứa       |
                     | Thiết bị X (loại trừ đơn đã Huỷ)       |
                     +-------------------+-------------------+
                                         |
                                         v
                         /-------------------------------\
                        < Khoảng ngày [D1 -> D2] có giao  >
                        < với đơn nào khác không?         >
                         \-------------------------------/
                               /                   \
                            (CÓ)                  (KHÔNG)
                             /                       \
                            v                         v
            /---------------------------------\    +----------------------+
           <  Đơn trùng đang ở chặng nào?      >   | [HỢP LỆ]             |
            \---------------------------------/    | Cho phép thêm máy    |
                    /                   \          +----------------------+
   (Báo giá / Đã giao / Chờ trả)     (Yêu cầu)
               /                         \
              v                           v
+----------------------------+   +----------------------------+
| [KHOÁ CỨNG]                |   | [CẢNH BÁO MỀM]             |
| Chặn không cho thêm vào    |   | "Đang có đơn khác hỏi cùng |
| "Thiết bị không còn trống" |   | ngày" — vẫn cho thêm vào   |
+----------------------------+   +----------------------------+
```

*Lưu ý: hệ thống không phân biệt "đã cọc" hay "chưa cọc" khi xét khoá cứng — chỉ dựa vào chặng hiện tại của đơn đang giữ thiết bị.*

---

## 4. Luồng quản lý thiết bị & Import Excel (Màn 3)

```text
[ Mở Màn 3: THIẾT BỊ ]
       |
       +---> [Xem Danh Sách Thiết Bị] ───> Bảng: Mã, Tên, Danh mục, Giá/ngày, Nguồn gốc, Trạng thái
       |
       +---> [+ Thêm Thiết Bị Mới] ──────> (chỉ Chủ thấy nút)
       |                                   Form: Tên, Mã, Danh mục, Nguồn gốc (+ Nhà cung cấp/Giá vốn
       |                                   nếu Thuê ngoài), Giá thuê/ngày, Mô tả
       |
       +---> [📥 IMPORT EXCEL] ──────────> (chỉ Chủ thấy nút)
       |                                              |
       |                                              v
       |                                   [Tải file mẫu (.xlsx) sinh sẵn trên trình duyệt]
       |                                              |
       |                                              v
       |                                   [Chọn file Excel/CSV từ máy tính]
       |                                              |
       |                                              v
       |                                   [App đọc & hiện bảng xem trước]
       |                                   - Tô đỏ dòng thiếu tên hoặc thiếu/sai giá thuê
       |                                              |
       |                                              v
       |                                   [Bấm Xác nhận Import]
       |                                              |
       |                                              v
       |                                   [Các dòng hợp lệ được thêm vào hệ thống,
       |                                    báo số dòng thành công/tổng số dòng]
       |
       +---> [Xem Chi Tiết 1 Thiết Bị] ──> [Thông tin & lịch sử giá]
                                          [Lịch sử cho thuê qua các đơn]
                                          [Lịch sử kiểm tra tình trạng qua các lần trả]
                                          [Hiệu quả sinh lời = Doanh thu (đơn Xong) - Giá vốn]
```

---

## 5. Luồng vận hành Dashboard (Màn 1) vs Calendar (Màn 4) vs Báo cáo (Màn 5)

```text
========================= MÀN 1: TỔNG QUAN =========================

   [MỞ MÀN 1]
       |
       +---> [Xem 4 thẻ KPI]       ---> Đơn đang chạy / Cần bàn giao hôm nay /
       |                                Dự kiến nhận hôm nay / Thiết bị sẵn sàng
       |
       +---> [Xem Đơn Đang Diễn Ra] ---> [Bấm vào một dòng] ---> [Mở chi tiết Màn 2]
       |
       +---> [Xem Tồn Kho Nhanh]   ---> [Loại thiết bị → Tổng / Còn trống]
       |
       +---> [Xem Yêu Cầu/Sắp Tới] ---> (chỉ hiện khi có đơn ở chặng Yêu cầu)


========================= MÀN 4: CALENDAR =========================

   [MỞ MÀN 4]
       |
       +---> [Lưới Lịch Tháng]     ---> [Xem các thanh sự kiện theo dải ngày]
                                        + Vàng: Yêu cầu/Báo giá (chờ chốt)
                                        + Xanh dương: Đã giao
                                        + Xanh lá: Chờ trả
                                        + Xám: Đã xong
                                                 |
                                                 v
                                        [Bấm vào thanh sự kiện] → [Modal xem nhanh]
                                                 |
                                                 v
                                        [Bấm "Xem chi tiết đơn →"] → [Mở chi tiết Màn 2]


========================= MÀN 5: BÁO CÁO (chỉ Chủ) =========================

   [MỞ MÀN 5]
       |
       +---> [Xem 4 thẻ KPI]        ---> Tổng doanh thu / Tổng lợi nhuận / Số đơn hoàn tất /
       |                                 Thiết bị sinh lời tốt nhất
       |
       +---> [Xem bảng xếp hạng]    ---> Theo từng thiết bị: lượt thuê, ngày thuê, doanh thu,
       |                                 giá vốn, lợi nhuận (sắp giảm dần theo lợi nhuận)
       |
       +---> [Xem thiết bị chưa từng được thuê] ---> Danh sách badge, không có hành động tiếp
```
