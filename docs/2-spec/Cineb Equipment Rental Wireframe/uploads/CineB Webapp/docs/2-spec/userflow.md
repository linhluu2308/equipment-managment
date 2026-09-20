# userflow.md — Luồng người dùng hệ thống CineB Equipment Rental

Tài liệu này mô tả chi tiết luồng tương tác của **Chủ** và **Nhân viên kho** trên 4 màn hình của hệ thống CineB, kèm sơ đồ luồng dạng ASCII.

---

## 1. Sơ đồ điều hướng tổng thể (Navigation Flow)

```
                       +-----------------------------+
                       |       CINEB WEBAPP          |
                       | (Thanh điều hướng Sidebar)  |
                       +--------------+--------------+
                                      |
         +-----------------+----------+----------+-----------------+
         |                 |                     |                 |
         v                 v                     v                 v
+-----------------+ +---------------+   +-----------------+ +-----------------+
| MÀN 1: TỔNG QUAN| | MÀN 2: ĐƠN THUÊ|  | MÀN 3: THIẾT BỊ | | MÀN 4: CALENDAR |
|  (Dashboard)    | | (Core Ops)    |   | (Asset/Profit)  | | (Planning Grid) |
+--------+--------+ +-------+-------+   +--------+--------+ +--------+--------+
         |                  ^                    |                   |
         | Bấm vào đơn      |                    | Xem lịch sử thuê  | Bấm vào dự án
         +------------------+                    | & chi tiết thiết  +-------+
         |                                       | bị                |       |
         +---------------------------------------+-------------------+-------+
                                                 |
                                                 v
                                    [Xem chi tiết đơn tại Màn 2]
```

---

## 2. Luồng chi tiết: Vòng đời đơn thuê (Màn 2)

Đây là luồng nghiệp vụ trung tâm xử lý một đơn hàng từ khi phát sinh đến khi hoàn tất lưu kho và chốt sổ nợ.

```
[ Khách hàng liên hệ ]
         |
         v
+-------------------------------------------------------------------------------+
| BƯỚC 1: TẠO ĐƠN THUÊ (Chặng: YÊU CẦU)                                         |
| - Nhập thông tin khách: Tên, SĐT, Người giới thiệu                            |
| - Chọn ngày bắt đầu thuê & ngày trả dự kiến                                   |
| - Thêm thiết bị vào đơn                                                       |
+---------------------------------------+---------------------------------------+
                                        |
                                        v
                        /-------------------------------\
                       <  Kiểm tra trùng lịch thiết bị?  >
                        \-------------------------------/
                               /                \
                     (Trùng lịch)             (Còn trống)
                             /                    \
                            v                      v
             +-----------------------+   +-------------------------------------+
             | Báo đỏ "Trùng lịch"   |   | Tự động lấy đơn giá hiện hành       |
             | Gợi ý đổi máy khác    |   | Nhập % chiết khấu (nếu có)          |
             +-----------------------+   +------------------+------------------+
                                                            |
                                                            v
+-------------------------------------------------------------------------------+
| BƯỚC 2: LẬP BÁO GIÁ & GỬI KHÁCH (Chặng: BÁO GIÁ)                              |
| - App tự tính: Tổng tiền = (Đơn giá x Số ngày x Số lượng) - Chiết khấu        |
| - Xuất file / gửi báo giá cho khách                                           |
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
             | Chuyển chặng "HUỶ"    |   | Khách đặt cọc / Cam kết trả sau     |
             | Giải phóng thiết bị   |   | Ghi nhận khoản cọc vào hệ thống     |
             +-----------------------+   +------------------+------------------+
                                                            |
                                                            v
+-------------------------------------------------------------------------------+
| BƯỚC 3: GIAO THIẾT BỊ (Chặng: ĐÃ GIAO)                                        |
| - Kho xuất thiết bị cho khách mang đi                                         |
| - Thiết bị chính thức bị KHÓA CỨNG (Hard Block) trên lịch                     |
| - Trạng thái thiết bị ở Màn 3 chuyển sang: "ĐANG THUÊ"                        |
+---------------------------------------+---------------------------------------+
                                        |
                                        v
+-------------------------------------------------------------------------------+
| BƯỚC 4: KHÁCH TRẢ THIẾT BỊ (Chặng: CHỜ TRẢ)                                   |
| - Khách mang thiết bị về lại kho                                              |
| - Nhân viên kho tạo BIÊN BẢN KIỂM TRA (Check-in list):                        |
|   + Máy quay: [x] Tốt / Bình thường                                           |
|   + Ống kính: [!] Trầy xước thấu kính -> Ghi nhận chi phí phạt 500k           |
| - Nhập chi phí phát sinh (nếu có: bồi thường, phí trễ hạn, phụ phí ship)      |
+---------------------------------------+---------------------------------------+
                                        |
                                        v
+-------------------------------------------------------------------------------+
| BƯỚC 5: ĐỐI SOÁT & CHỐT CÔNG NỢ (Chặng: XONG)                                 |
| - App tự tính: Công nợ cuối = Tổng tiền + Chi phí phát sinh - Tiền đã cọc     |
| - Thu nốt số tiền còn lại (hoặc hoàn cọc thừa)                                |
| - Bấm [CHỐT CÔNG NỢ]:                                                         |
|   + Đơn chuyển chặng "XONG" (Khóa không sửa)                                  |
|   + Thiết bị chuyển về "SẴN SÀNG"                                             |
|   + Doanh thu/Lợi nhuận được cộng vào hồ sơ thiết bị (Màn 3)                  |
+-------------------------------------------------------------------------------+
```

---

## 3. Luồng kiểm tra trùng lịch thiết bị (Availability Check Logic)

```
              [ Người dùng chọn Thiết bị X & Khoảng ngày [D1 -> D2] ]
                                         |
                                         v
                     +---------------------------------------+
                     | Quét cơ sở dữ liệu các đơn khác       |
                     | có chứa Thiết bị X                    |
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
           <  Đơn trùng đang ở chặng nào?      >   | [HỢP LỆ - XANH]      |
            \---------------------------------/    | Cho phép thêm máy    |
                    /                   \          +----------------------+
       (Đã giao / Đã cọc)        (Yêu cầu / Báo giá)
               /                         \
              v                           v
+----------------------------+   +----------------------------+
| [KHÓA CỨNG - ĐỎ]           |   | [CẢNH BÁO MỀM - VÀNG]      |
| Chặn không cho thêm vào    |   | "Đang có đơn Báo giá khác  |
| "Thiết bị đã có đơn thuê"  |   | hỏi cùng ngày"             |
+----------------------------+   | Vẫn cho phép làm báo giá   |
                                 +----------------------------+
```

---

## 4. Luồng vận hành Dashboard (Màn 1) vs Calendar (Màn 4)

```
========================= MÀN 1: TỔNG QUAN (Vận hành ngày) =========================

   [MỞ MÀN 1]
       |
       +---> [Xem Đơn Trong Ngày]  ---> [Xuất kho / Nhận kho hôm nay] ---> [Bấm vào đơn]
       |                                                                        |
       +---> [Xem Tồn Kho Nhanh]   ---> [Category: Máy / Lens / Đèn]            v
                                        (VD: Đèn 5/8 sẵn sàng)           [Mở chi tiết Màn 2]


========================= MÀN 4: CALENDAR (Kế hoạch tháng) =========================

   [MỞ MÀN 4]
       |
       +---> [Lưới Lịch Tháng]     ---> [Xem các thanh dự án theo dải ngày]
                                        + Xám: Đã xong
                                        + Xanh lá: Đã chốt chờ giao
                                        + Xanh dương: Đang chạy
                                        + Vàng: Chờ chốt
                                                 |
                                                 v
                                        [Bấm vào thanh dự án]
                                                 |
                                                 v
                                        [Mở chi tiết Màn 2]
```

---

## 5. Luồng quản lý tài sản & lợi nhuận thiết bị (Màn 3)

```
[Chủ mở Màn 3]
      |
      +---> [Xem Danh Sách Thiết Bị] ---> Lọc theo: Sẵn sàng / Đang thuê / Bảo trì
      |
      +---> [Thêm / Sửa Thiết Bị]    ---> Cập nhật: Đơn giá, Giá vốn (nếu thuê ngoài)
      |
      +---> [Xem Chi Tiết 1 Máy]     ---> [Lịch sử cho thuê qua các đơn]
                                     ---> [Lịch sử tình trạng kiểm tra qua các lần trả]
                                     ---> [Lợi nhuận lũy kế = Doanh thu - Giá vốn - Chi phí]
```
