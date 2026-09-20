# sitemap.md — Sơ đồ trang web (Sitemap) CineB Webapp

Tài liệu này mô tả toàn bộ cấu trúc phân cấp trang, đường dẫn (routes), các thành phần con (modal, bảng, khu vực thao tác) và ma trận phân quyền cho hệ thống CineB Equipment Rental.

---

## 1. Cây sơ đồ trang tổng thể (ASCII Sitemap Tree)

```text
[ CINEB WEBAPP ROOT ]  (Sidebar trái: Tổng quan · Đơn thuê · Thiết bị · Calendar · Báo cáo)
 │
 ├── 1. TỔNG QUAN (Dashboard) ──────── [/]
 │    ├── 4 Thẻ KPI (Đơn thuê đang chạy, Cần bàn giao hôm nay, Dự kiến nhận về hôm nay, Thiết bị sẵn sàng)
 │    ├── Bảng "Đơn thuê đang diễn ra" (chặng Báo giá/Đã giao/Chờ trả)
 │    ├── Bảng "Yêu cầu / sắp tới" (chặng Yêu cầu, chỉ hiện khi có dữ liệu)
 │    └── Bảng Tồn kho nhanh theo loại thiết bị (Tổng / Còn trống)
 │
 ├── 2. ĐƠN THUÊ (Orders Management) ─ [/orders]
 │    ├── Ô tìm kiếm (khung nhập, chưa lọc theo dữ liệu thực)
 │    ├── Bộ lọc chặng dạng pill (Tất cả | Yêu cầu | Báo giá | Đã giao | Chờ trả | Xong | Đã huỷ)
 │    ├── Bảng danh sách đơn (Khách hàng, Dải ngày thuê, Tổng tiền, Đã thu, Công nợ, Trạng thái)
 │    │
 │    ├── [MODAL] Tạo đơn thuê mới (mở trên chính /orders, không có route riêng)
 │    │    ├── Thông tin khách (Tên, SĐT, Người giới thiệu)
 │    │    ├── Ngày bắt đầu → Ngày trả dự kiến (tự tính số ngày ở trang chi tiết sau khi tạo)
 │    │    ├── KHU VỰC CHỌN THIẾT BỊ:
 │    │    │    ├── Ô tìm kiếm theo tên/mã
 │    │    │    ├── Tag lọc theo danh mục (lấy động từ dữ liệu thiết bị đang có, không cố định)
 │    │    │    └── Danh sách thiết bị dạng checkbox, mỗi dòng có % chiết khấu riêng + cảnh báo trùng lịch ngay khi tick chọn
 │    │    ├── Ghi chú đơn hàng
 │    │    └── (Việc ghi cọc tiền/cọc giấy tờ thực hiện ở trang chi tiết đơn sau khi tạo, không có trong modal này)
 │    │
 │    └── [PAGE] Chi tiết đơn thuê ────────────────── [/orders/:id]
 │         ├── Header: Mã hiển thị (8 ký tự đầu của ID) + badge chặng + thanh tiến trình 5 bước
 │         ├── Khối 1: Khách hàng & ngày thuê (Tên, SĐT, Người giới thiệu, dải ngày + tổng số ngày)
 │         ├── Khối 2: Thiết bị thuê (Tên, mã, đơn giá/ngày, % chiết khấu, thành tiền; nút Xoá dòng — chỉ hiện khi đơn ở chặng Yêu cầu)
 │         ├── Khối 3: Tài chính (Tổng tiền đơn / Đã thu / Công nợ còn lại, lịch sử thanh toán, cọc giấy tờ kèm badge Đang giữ/Đã hoàn trả, chi phí phát sinh)
 │         ├── Khối 4: Biên bản kiểm tra khi trả (chỉ hiện khi chặng là Đã giao/Chờ trả/Xong — hiển thị kết quả đã lưu, dạng badge Tốt/Trầy xước/Hỏng hóc/Chưa kiểm tra)
 │         └── Khối 5 — Khu vực Thao tác (ẩn khi đơn đã Xong hoặc Đã huỷ):
 │              ├── Nút chuyển chặng theo đúng chặng hiện tại (chi tiết ở mục 2 bên dưới)
 │              └── 4 form con dạng lưới (ẩn ở chặng Yêu cầu): Ghi nhận thanh toán · Chi phí phát sinh · Cọc giấy tờ (kèm nút đánh dấu hoàn trả) · Biên bản kiểm tra thiết bị khi trả (chỉ hiện ở chặng Đã giao/Chờ trả)
 │
 ├── 3. THIẾT BỊ (Asset & Profit) ──── [/equipment]
 │    ├── Ô tìm kiếm (khung nhập, chưa lọc theo dữ liệu thực)
 │    ├── Nút chức năng: [+ Thêm thiết bị mới] và [📥 Import Excel] *(chỉ Chủ nhìn thấy)*
 │    ├── Bảng danh mục thiết bị (Mã, Tên, Danh mục, Giá thuê/ngày, Nguồn gốc, Trạng thái)
 │    │
 │    ├── [MODAL] Thêm thiết bị mới
 │    │    ├── Tên, Mã/Serial, Danh mục (chữ tự do)
 │    │    ├── Nguồn gốc: Tự sở hữu / Thuê ngoài (hiện thêm Nhà cung cấp + Giá vốn nếu chọn Thuê ngoài)
 │    │    ├── Giá thuê/ngày (VND)
 │    │    └── Mô tả
 │    │
 │    ├── [MODAL] Import Excel danh sách thiết bị
 │    │    ├── Nút [Tải file mẫu Excel chuẩn] (sinh file mẫu ngay trên trình duyệt)
 │    │    ├── Chọn file Excel/CSV từ máy
 │    │    ├── Bảng xem trước dữ liệu, tô đỏ dòng thiếu tên hoặc thiếu/sai giá thuê
 │    │    └── Nút [Xác nhận Import] — chỉ import các dòng hợp lệ
 │    │
 │    └── [PAGE] Chi tiết thiết bị ─────────── [/equipment/:id]
 │         ├── Khối 1: Thông tin & giá (giá hiện hành, nguồn gốc, giá vốn nếu thuê ngoài, mô tả, lịch sử thay đổi giá)
 │         ├── Khối 2: Lịch sử cho thuê (danh sách đơn đã dùng thiết bị này, liên kết sang /orders/:id)
 │         ├── Khối 3: Lịch sử kiểm tra tình trạng (ngày trả, người kiểm, badge tình trạng)
 │         └── Khối 4: Hiệu quả sinh lời (Doanh thu lũy kế, Giá vốn, Lợi nhuận ròng — chỉ tính trên đơn đã Xong)
 │
 ├── 4. CALENDAR (Lịch kế hoạch) ─ [/calendar]
 │    ├── Điều hướng tháng trước/sau + chú thích màu (vàng/xanh dương/xanh lá/xám)
 │    ├── Lưới lịch theo tháng, mỗi ngày hiện tối đa 3 thanh sự kiện + "+N khác"
 │    └── [MODAL] Xem nhanh khi bấm vào 1 thanh sự kiện (tên khách, SĐT, dải ngày, số thiết bị, nút "Xem chi tiết đơn →")
 │
 └── 5. BÁO CÁO (Lợi nhuận & hiệu suất) ─ [/reports]  *(mục điều hướng chỉ hiện với vai Chủ)*
      ├── 4 Thẻ KPI: Tổng doanh thu, Tổng lợi nhuận ròng, Số đơn đã hoàn tất, Thiết bị sinh lời tốt nhất
      ├── Dòng nhấn mạnh: thiết bị được thuê nhiều nhất (số lượt + tổng ngày thuê)
      ├── Bảng xếp hạng theo thiết bị: Danh mục, Lượt thuê, Tổng ngày thuê, Doanh thu, Giá vốn, Lợi nhuận (sắp theo Lợi nhuận giảm dần)
      └── Khối liệt kê thiết bị chưa từng được thuê
```

---

## 2. Chi tiết cấu trúc từng Màn hình & Thành phần UI

### Màn 1 · Tổng quan (`/`)
*Mục tiêu: Nắm bắt toàn bộ bức tranh vận hành tức thời.*
- **Header dùng chung mọi trang:** breadcrumb + tiêu đề trang + ngày hôm nay (không có thông tin đăng nhập vì chưa có tài khoản thật).
- **Thẻ KPI (4 thẻ):** Đơn thuê đang chạy · Cần bàn giao hôm nay · Dự kiến nhận về hôm nay · Thiết bị sẵn sàng (tổng số thiết bị còn trống trên toàn hệ thống).
- **Khối 1 — Đơn thuê đang diễn ra:** bảng các đơn ở chặng Báo giá/Đã giao/Chờ trả. Cột: Khách hàng, Dải ngày thuê, SL máy, Chặng. Bấm vào tên khách để mở `/orders/:id`.
- **Khối 2 — Tồn kho nhanh:** gom theo danh mục thiết bị thực tế đang có trong hệ thống. Cột: Loại | Tổng | Còn trống.
- **Khối 3 — Yêu cầu / sắp tới:** bảng riêng cho các đơn ở chặng Yêu cầu, chỉ xuất hiện khi có dữ liệu.

---

### Màn 2 · Đơn thuê (`/orders` & `/orders/:id`)
*Mục tiêu: Xử lý trọn vẹn toàn bộ quy trình nghiệp vụ của đơn thuê.*
- **Danh sách đơn (`/orders`):**
  - Ô tìm kiếm hiển thị trên giao diện (chưa gắn logic lọc theo tên/SĐT/mã).
  - Bộ lọc chặng dạng pill: `Tất cả` | `Yêu cầu` | `Báo giá` | `Đã giao` | `Chờ trả` | `Xong` | `Đã huỷ` — bấm vào chuyển query `?chang=`.
  - Bảng dữ liệu: Khách hàng (+ SĐT), Dải ngày thuê (+ số ngày), Tổng tiền, Đã thu, Công nợ (đỏ nếu còn nợ, xanh nếu hết), Trạng thái (badge theo chặng).
  - Nút chính: `+ Tạo đơn mới`.
- **Modal tạo đơn mới:**
  - Form khách hàng: Tên khách, Số điện thoại, Người giới thiệu (không bắt buộc).
  - Ngày bắt đầu, Ngày trả dự kiến.
  - Khu vực chọn thiết bị: ô tìm kiếm + tag danh mục (sinh động theo dữ liệu) + danh sách checkbox hiển thị giá/ngày hiện hành; mỗi thiết bị đã chọn có ô nhập % chiết khấu riêng; chọn thiết bị bị trùng lịch → hiện badge cảnh báo ngay trên dòng đó.
  - Ghi chú đơn hàng.
  - Bấm "Tạo đơn" → validate lại trùng lịch phía server, tạo khách hàng + đơn + các dòng thiết bị, chuyển thẳng sang trang chi tiết đơn vừa tạo (chặng mặc định: Yêu cầu).
- **Trang chi tiết đơn (`/orders/:id`):**
  - **Header đơn:** mã hiển thị (8 ký tự đầu ID), badge chặng hiện tại, thanh tiến trình 5 ô màu theo chặng đã qua (`Yêu cầu → Báo giá → Đã giao → Chờ trả → Xong`); nếu đơn Đã huỷ thì chỉ hiện badge đỏ, không có thanh tiến trình.
  - **Khối 1 — Khách hàng & ngày thuê:** Tên, SĐT, Người giới thiệu, dải ngày thuê + tổng số ngày, ghi chú đơn (nếu có).
  - **Khối 2 — Thiết bị thuê:** Tên máy, mã, đơn giá/ngày lúc chốt, % chiết khấu, thành tiền; nút "Xoá" ở cuối dòng chỉ hiện khi đơn đang ở chặng Yêu cầu.
  - **Khối 3 — Tài chính:**
    - 3 ô số liệu: Tổng tiền đơn, Đã thu, Công nợ còn lại (tô đỏ nếu còn nợ).
    - Lịch sử thanh toán (loại, ngày thu, hình thức, số tiền).
    - Cọc giấy tờ: loại giấy tờ + số hiệu + badge "Đang giữ"/"✓ Đã hoàn trả".
    - Chi phí phát sinh (loại, mô tả, số tiền).
  - **Khối 4 — Biên bản kiểm tra khi trả:** chỉ hiện khi chặng là Đã giao/Chờ trả/Xong; mỗi thiết bị hiện badge Tốt/Trầy xước/Hỏng hóc, hoặc "Chưa kiểm tra".
  - **Khu vực Thao tác** (ẩn hoàn toàn khi đơn đã Xong hoặc Đã huỷ):
    - Nút chuyển chặng theo đúng chặng hiện tại:
      - `Yêu cầu` → [Lập báo giá] hoặc [Từ chối / Huỷ đơn]
      - `Báo giá` → [Xác nhận giao thiết bị] hoặc [Huỷ đơn]
      - `Đã giao` → [Nhận thiết bị về kho]
      - `Chờ trả` → [Chốt công nợ & Hoàn tất]
    - 4 form con hiển thị dạng lưới 2 cột (từ chặng Báo giá trở đi): Ghi nhận thanh toán (số tiền, loại, hình thức) · Chi phí phát sinh (loại, mô tả, số tiền) · Cọc giấy tờ (loại, số hiệu + nút đánh dấu đã hoàn trả cho từng giấy tờ đang giữ) · Biên bản kiểm tra thiết bị khi trả (chọn thiết bị, tình trạng, người kiểm, ghi chú — chỉ hiện ở chặng Đã giao/Chờ trả).

---

### Màn 3 · Thiết bị (`/equipment` & `/equipment/:id`)
*Mục tiêu: Quản lý danh mục tài sản và hiệu quả sinh lời.*
- **Danh mục thiết bị (`/equipment`):**
  - Ô tìm kiếm hiển thị trên giao diện (chưa gắn logic lọc).
  - Nút tác vụ: `+ Thêm thiết bị mới` và `📥 Import Excel` *(chỉ Chủ nhìn thấy, Kho không có nút này)*.
  - Bảng danh mục: Mã, Tên thiết bị, Danh mục, Giá thuê/ngày (giá hiện hành), Nguồn gốc, Trạng thái (badge Sẵn sàng/Đang thuê/Bảo trì).
- **Modal Thêm thiết bị mới:** Tên, Mã/Serial, Danh mục (chữ tự do), Nguồn gốc (Tự sở hữu/Thuê ngoài — chọn Thuê ngoài mới hiện Nhà cung cấp & Giá vốn), Giá thuê/ngày, Mô tả.
- **Modal Import Excel:**
  - Nút [Tải file mẫu Excel chuẩn] — sinh file `.xlsx` mẫu trực tiếp trên trình duyệt.
  - Chọn file Excel/CSV từ máy → app đọc và hiện bảng xem trước.
  - Dòng thiếu tên hoặc thiếu/sai giá thuê được tô đỏ và ghi rõ lỗi, không được import.
  - Nút [Xác nhận Import] chỉ import các dòng hợp lệ, báo số dòng thành công/tổng số dòng.
- **Chi tiết thiết bị (`/equipment/:id`):**
  - **Khối 1 — Thông tin & giá:** giá thuê hiện hành, nguồn gốc (+ giá vốn nếu thuê ngoài), mô tả, bảng lịch sử thay đổi giá theo thời gian.
  - **Khối 2 — Lịch sử cho thuê:** danh sách mọi đơn đã dùng thiết bị này (tên khách, dải ngày, chặng), bấm vào để mở `/orders/:id`.
  - **Khối 3 — Lịch sử kiểm tra tình trạng:** ngày trả, người kiểm, badge tình trạng.
  - **Khối 4 — Hiệu quả sinh lời:** 3 số liệu Doanh thu lũy kế / Giá vốn / Lợi nhuận ròng, kèm ghi chú rằng số liệu chỉ tính trên đơn đã Xong và chưa phân bổ chi phí phát sinh theo đơn.

---

### Màn 4 · Calendar (`/calendar`)
*Mục tiêu: Quan sát mật độ đơn thuê theo tháng.*
- **Thanh điều khiển:** nút chuyển tháng trước/sau, tên tháng hiện tại, chú thích màu: vàng (chờ chốt/báo giá) · xanh dương (đã giao/đang chạy) · xanh lá (chờ trả) · xám (đã xong).
- **Lưới lịch:** 7 cột theo tuần (bắt đầu từ Thứ Hai), mỗi ô ngày hiển thị tối đa 3 thanh sự kiện (tên khách, màu theo chặng), quá 3 thì hiện "+N khác".
- **Modal xem nhanh** khi bấm vào một thanh: tên khách, SĐT, dải ngày thuê, số thiết bị trong đơn, nút "Xem chi tiết đơn →" điều hướng sang `/orders/:id`.

---

### Màn 5 · Báo cáo (`/reports`)
*Mục tiêu: Tổng hợp lợi nhuận và tần suất cho thuê để ra quyết định — chỉ Chủ thấy mục này trên sidebar.*
- **4 thẻ KPI:** Tổng doanh thu (đơn đã Xong), Tổng lợi nhuận ròng, Số đơn đã hoàn tất, Thiết bị sinh lời tốt nhất (tên + số tiền lợi nhuận).
- **Dòng nhấn mạnh** thiết bị được thuê nhiều nhất kèm số lượt và tổng ngày thuê cộng dồn.
- **Bảng xếp hạng theo thiết bị:** Thiết bị, Danh mục, Lượt thuê, Tổng ngày thuê, Doanh thu, Giá vốn, Lợi nhuận — sắp xếp theo Lợi nhuận giảm dần. Lượt thuê/tổng ngày tính trên mọi đơn chưa huỷ; doanh thu/giá vốn/lợi nhuận chỉ tính trên đơn đã Xong.
- **Khối thiết bị chưa từng được thuê:** liệt kê dạng badge, kèm gợi ý cân nhắc điều chỉnh giá hoặc quảng bá thêm.

---

## 3. Ma trận phân quyền theo vai trò (Role-Based Access Matrix)

> Toàn bộ phân quyền hiện chỉ ở mức **ẩn/hiện trên giao diện** (chọn vai qua nút ở chân sidebar, lưu tạm trên trình duyệt) — chưa có tài khoản đăng nhập hay chặn ở tầng server. Vào thẳng URL vẫn xem được nội dung dù mục điều hướng bị ẩn.

| Màn hình / Chức năng | Chủ (Admin / Owner) | Nhân viên kho (Warehouse Staff) |
|---|:---:|:---:|
| **Màn 1 · Tổng quan** | Xem | Xem |
| **Màn 2 · Tạo đơn mới / Xoá dòng thiết bị / Chuyển chặng** | Toàn quyền | Toàn quyền |
| **Màn 2 · Ghi thanh toán, chi phí, cọc giấy tờ, hoàn trả giấy tờ** | Toàn quyền | Toàn quyền |
| **Màn 2 · Ghi kiểm tra thiết bị khi trả** | Toàn quyền | Toàn quyền (nhiệm vụ chính) |
| **Màn 3 · Xem danh mục & chi tiết thiết bị (kể cả giá vốn, lợi nhuận)** | Xem | Xem *(chưa bị ẩn số liệu tài chính trên giao diện)* |
| **Màn 3 · Thêm / Import Excel thiết bị** | Toàn quyền | **Không thấy nút (ẩn trên giao diện)** |
| **Màn 4 · Calendar** | Xem | Xem |
| **Màn 5 · Báo cáo** | Có mục điều hướng, xem đầy đủ | **Mục điều hướng bị ẩn trên sidebar** (vào thẳng URL vẫn xem được) |
