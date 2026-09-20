# sitemap.md — Sơ đồ trang web (Sitemap) CineB Webapp

Tài liệu này mô tả toàn bộ cấu trúc phân cấp trang, đường dẫn (routes), các thành phần con (modals, drawers, tabs) và ma trận phân quyền cho hệ thống CineB Equipment Rental.

---

## 1. Cây sơ đồ trang tổng thể (ASCII Sitemap Tree)

```text
[ CINEB WEBAPP ROOT ]
 │
 ├── 1. TỔNG QUAN (Dashboard) ──────── [/dashboard hoặc /]
 │    ├── Thẻ KPI Vận hành ngày (Đơn đang chạy, Xuất hôm nay, Nhận hôm nay)
 │    ├── Bảng Đơn thuê trong ngày & Sắp tới
 │    └── Bảng Tồn kho nhanh theo loại thiết bị (Tổng / Đang thuê / Còn trống)
 │
 ├── 2. ĐƠN THUÊ (Orders Management) ─ [/orders]
 │    ├── Bộ lọc chặng (Tất cả | Yêu cầu | Báo giá | Đã giao | Chờ trả | Xong | Huỷ)
 │    ├── Bảng danh sách đơn hàng
 │    │
 │    ├── [MODAL] Tạo đơn thuê mới ───────────────────────── [/orders/new]
 │    │    ├── Nhập thông tin khách (Tên, SĐT, Người giới thiệu)
 │    │    ├── Chọn ngày thuê [Ngày bắt đầu → Ngày trả dự kiến]
 │    │    ├── Chọn thiết bị (Auto Availability / Conflict Check)
 │    │    └── Nhập % Chiết khấu & Ghi chú
 │    │
 │    └── [PAGE/DRAWER] Chi tiết đơn thuê ────────────────── [/orders/:id]
 │         ├── Khối 1: Thông tin khách hàng & Trạng thái chặng
 │         ├── Khối 2: Danh sách thiết bị & Đơn giá chốt
 │         ├── Khối 3: Báo giá, Đặt cọc & Lịch sử thanh toán
 │         ├── Khối 4: Chi phí phát sinh (Vận chuyển, Phụ phí, Đền bù)
 │         ├── Khối 5: Biên bản kiểm tra thiết bị khi nhập kho (Check-in Checklist)
 │         └── Thanh tác vụ (Chuyển chặng, Xuất báo giá, Ghi nhận cọc, Chốt công nợ)
 │
 ├── 3. THIẾT BỊ (Asset & Profit) ──── [/equipment]
 │    ├── Bộ lọc (Phân loại, Trạng thái: Sẵn sàng / Đang thuê / Bảo trì, Nguồn gốc)
 │    ├── Bảng danh mục thiết bị (Hình ảnh, Mã, Tên, Giá thuê/ngày, Trạng thái)
 │    │
 │    ├── [MODAL] Thêm / Chỉnh sửa thiết bị ─────────────── [/equipment/modal-form]
 │    │    ├── Thông tin cơ bản (Tên, Mã, Danh mục, Ảnh, Mô tả)
 │    │    ├── Thiết lập giá thuê hiện hành
 │    │    └── Phân loại nguồn gốc (Tự sở hữu vs Thuê ngoài + Giá vốn + Nhà cung cấp)
 │    │
 │    └── [PAGE/DRAWER] Hồ sơ chi tiết thiết bị ─────────── [/equipment/:id]
 │         ├── Khối 1: Thông tin cấu hình & Lịch sử thay đổi giá
 │         ├── Khối 2: Lịch sử các lần cho thuê (Nối với Màn 2)
 │         ├── Khối 3: Lịch sử tình trạng qua các lần kiểm tra trả máy
 │         └── Khối 4: Báo cáo hiệu quả sinh lời (Doanh thu - Giá vốn - Chi phí = Lợi nhuận)
 │
 └── 4. LỊCH KẾ HOẠCH (Calendar Grid) ─ [/calendar]
      ├── Lưới lịch theo tháng / tuần (Month / Week View)
      ├── Thanh sự kiện dự án theo dải ngày (Mã màu: Vàng / Xanh lá / Xanh dương / Xám)
      ├── Bộ lọc nhanh theo Trạng thái & Loại thiết bị
      └── [POPOVER] Tóm tắt đơn khi click sự kiện ───────── (Có nút nhảy sang [/orders/:id])
```

---

## 2. Chi tiết cấu trúc từng Màn hình & Thành phần UI

### Màn 1 · Tổng quan (`/` hoặc `/dashboard`)
*Mục tiêu: Nắm bắt toàn bộ bức tranh vận hành tức thời trong ngày.*
- **Header:** Ngày giờ hiện tại, thông tin người đăng nhập.
- **Thẻ KPI (Metric Cards):**
  - Đơn đang chạy trong ngày.
  - Đơn cần bàn giao hôm nay.
  - Đơn dự kiến nhận về hôm nay.
  - Tổng số thiết bị sẵn sàng / đang cho thuê.
- **Khối 1 — Danh sách đơn trong ngày (Today's Schedule):**
  - Tab: "Giao hôm nay" | "Trả hôm nay" | "Sắp tới (3-7 ngày)".
  - Cột: Mã đơn, Khách hàng, Số lượng máy, Thời gian, Trạng thái cọc.
  - Action: Bấm vào dòng để mở chi tiết tại `/orders/:id`.
- **Khối 2 — Bảng tồn kho nhanh (Quick Inventory Summary):**
  - Gom nhóm theo Category (Body Máy quay, Ống kính Lens, Đèn & Ánh sáng, Grip & Phụ kiện...).
  - Cột: Loại thiết bị | Tổng có | Đang cho thuê | Còn rảnh trong kho.

---

### Màn 2 · Đơn thuê (`/orders` & `/orders/:id`)
*Mục tiêu: Xử lý trọn vẹn toàn bộ quy trình nghiệp vụ của đơn thuê.*
- **Danh sách đơn (`/orders`):**
  - Thanh tìm kiếm: Tên khách hàng, SĐT, Mã đơn.
  - Bộ lọc chặng (Status Pills): `Tất cả` | `Yêu cầu` | `Báo giá` | `Đã giao` | `Chờ trả` | `Xong` | `Đã huỷ`.
  - Bảng dữ liệu: Mã đơn, Ngày tạo, Khách hàng, Khoảng ngày thuê, Tổng tiền, Đã thu, Công nợ, Trạng thái.
  - Nút chính: `+ Tạo đơn mới`.
- **Modal tạo đơn mới (`/orders/new`):**
  - Form khách hàng: Tên khách, Số điện thoại, Người giới thiệu.
  - Dải ngày: Ngày bắt đầu, Ngày kết thúc/trả.
  - Bảng chọn thiết bị: Ô tìm kiếm thiết bị, hiện ngay badge tồn kho và cảnh báo trùng lịch thời gian thực.
  - Nhập chiết khấu & ghi chú đơn hàng.
- **Trang / Drawer Chi tiết đơn (`/orders/:id`):**
  - **Header đơn:** Mã đơn, Ngày tạo, Progress Bar hiển thị chặng hiện tại (`Yêu cầu → Báo giá → Đã giao → Chờ trả → Xong`).
  - **Section Khách hàng:** Tên, SĐT, Người giới thiệu, nút gọi/nhắn tin.
  - **Section Danh sách thiết bị:** Tên máy, Mã serial, Ngày bắt đầu, Ngày trả, Đơn giá lúc chốt, Chiết khấu %, Thành tiền.
  - **Section Tài chính & Công nợ:**
    - Tổng tiền thuê gốc.
    - Danh sách các lần thanh toán (Ngày thu, Số tiền, Loại: Cọc/Thanh toán đợt, Hình thức).
    - Danh sách Chi phí phát sinh (Vận chuyển, Phí trễ hạn, Phạt hỏng hóc).
    - **Công nợ còn lại** (Tô màu nổi bật: Xanh lá nếu = 0, Đỏ nếu còn nợ).
  - **Section Biên bản kiểm tra khi trả (Check-in Checklist):**
    - Danh sách từng thiết bị kèm dropdown tình trạng: `Tốt` | `Trầy xước` | `Hỏng hóc/Mất phụ kiện`.
    - Ô nhập ghi chú kiểm tra và người thực hiện kiểm tra.
  - **Footer Action Bar:**
    - Nếu chặng = `Yêu cầu`: Nút [Lập báo giá] / [Từ chối].
    - Nếu chặng = `Báo giá`: Nút [Ghi nhận cọc] / [Xuất PDF báo giá] / [Huỷ đơn].
    - Nếu chặng = `Đã cọc`: Nút [Xác nhận Giao đồ] → chuyển sang `Đã giao`.
    - Nếu chặng = `Đã giao`: Nút [Nhận thiết bị về kho] → chuyển sang `Chờ trả`.
    - Nếu chặng = `Chờ trả`: Nút [Lưu kiểm tra] + [Ghi nhận thanh toán nốt] + [Chốt công nợ & Hoàn tất].

---

### Màn 3 · Thiết bị (`/equipment` & `/equipment/:id`)
*Mục tiêu: Quản lý danh mục tài sản, kiểm soát khấu hao và hiệu quả sinh lời.*
- **Danh mục thiết bị (`/equipment`):**
  - Thanh công cụ: Tìm kiếm theo tên/mã, Lọc theo Danh mục, Lọc theo Trạng thái (`Sẵn sàng`, `Đang thuê`, `Bảo trì`), Lọc nguồn gốc (`Tự sở hữu`, `Thuê ngoài`).
  - Bảng danh mục: Ảnh thumbnail, Mã, Tên thiết bị, Danh mục, Đơn giá thuê/ngày, Nguồn gốc, Trạng thái, Doanh thu lũy kế.
  - Nút: `+ Thêm thiết bị mới` *(Chỉ Chủ mới thấy)*.
- **Modal Thêm / Sửa thiết bị:**
  - Tên thiết bị, Mã định danh/Serial.
  - Danh mục (Body, Lens, Light, Audio, Support...).
  - Đơn giá thuê niêm yết (VND/ngày).
  - Nguồn gốc:
    - *Tự sở hữu:* Giá trị đầu tư ban đầu.
    - *Thuê ngoài:* Tên nhà cung cấp, Giá vốn thuê vào (VND/ngày).
  - Ảnh đại diện & mô tả phụ kiện đi kèm.
- **Chi tiết thiết bị (`/equipment/:id`):**
  - **Tab 1 — Thông tin & Giá:** Thông số kỹ thuật, Bảng lịch sử thay đổi giá niêm yết qua các mốc thời gian.
  - **Tab 2 — Lịch sử cho thuê:** Danh sách tất cả các đơn thuê đã sử dụng thiết bị này (Mã đơn, Khách hàng, Ngày thuê, Doanh thu thu được).
  - **Tab 3 — Lịch sử bảo trì & Kiểm tra:** Tập hợp các ghi chú kiểm tra từ Màn 2 sau mỗi lần khách trả đồ (Ngày trả, Tình trạng, Người kiểm).
  - **Tab 4 — Hiệu quả sinh lời:** Thẻ KPI tài chính:
    - Tổng doanh thu đã tạo ra.
    - Tổng chi phí vốn (nếu thuê ngoài) & Chi phí sửa chữa bảo trì.
    - **Lợi nhuận ròng lũy kế** = Doanh thu - Chi phí.

---

### Màn 4 · Lịch Kế Hoạch (`/calendar`)
*Mục tiêu: Quy hoạch dòng công việc theo tháng và kiểm soát mật độ lịch.*
- **Header Lịch:**
  - Nút chuyển tháng `[< Tháng trước] [Tháng hiện tại] [Tháng sau >]`.
  - Bộ chuyển chế độ xem: `Theo Tháng (Month)` | `Theo Tuần (Week)` | `Timeline Gantt`.
  - Bộ lọc: Trạng thái đơn (`Đã xong` - Xám, `Đang chạy` - Xanh dương, `Đã chốt chờ giao` - Xanh lá, `Chờ chốt/Báo giá` - Vàng).
- **Lưới hiển thị (Calendar Grid):**
  - Hiển thị các thanh sự kiện (Project Bars) kéo dài từ Ngày bắt đầu đến Ngày trả.
  - Trên thanh sự kiện hiển thị: `[Tên khách] - [Tên dự án/Mã đơn] - [Số lượng máy]`.
- **Popover xem nhanh (Quick View Popover):**
  - Khi click vào 1 thanh sự kiện trên lịch → bung popover nhỏ:
    - Tên khách hàng & SĐT.
    - Danh sách thiết bị trong đơn.
    - Trạng thái thanh toán/cọc.
    - Nút bấm: `[Xem chi tiết đơn]` → Điều hướng trực tiếp sang `/orders/:id`.

---

## 3. Ma trận phân quyền theo vai trò (Role-Based Access Matrix)

| Màn hình / Chức năng | Chủ (Admin / Owner) | Nhân viên kho (Warehouse Staff) |
|---|:---:|:---:|
| **Màn 1 · Tổng quan** | Toàn quyền xem | Toàn quyền xem |
| **Màn 2 · Tạo đơn mới / Sửa đơn** | Toàn quyền | Toàn quyền |
| **Màn 2 · Nhập cọc / Chốt công nợ** | Toàn quyền | Toàn quyền |
| **Màn 2 · Ghi kiểm tra thiết bị khi trả** | Toàn quyền | Toàn quyền (Nhiệm vụ chính) |
| **Màn 3 · Xem danh mục thiết bị** | Toàn quyền | Chỉ xem danh sách & tình trạng |
| **Màn 3 · Thêm / Sửa thiết bị & Giá niêm yết** | Toàn quyền | **Không có quyền (Ẩn nút)** |
| **Màn 3 · Xem báo cáo Lợi nhuận / Giá vốn** | Toàn quyền | **Không được xem (Ẩn số liệu tài chính)** |
| **Màn 4 · Calendar (Lịch tháng)** | Toàn quyền xem & lọc | Chỉ xem để theo dõi lịch xuất/nhập |

---

## 4. Bảng liên kết dữ liệu chéo giữa các Màn (Data Linkage Map)

```text
+-----------------------+                         +-----------------------+
|    MÀN 3: THIẾT BỊ    |                         |    MÀN 2: ĐƠN THUÊ    |
| (Danh mục, Giá, Vốn)  |                         | (Đơn hàng, Khách, Cọc)|
+-----------+-----------+                         +-----------+-----------+
            |                                                 |
            | Cung cấp danh mục thiết bị & đơn giá            | Ghi nhận kiểm tra tình trạng
            |------------------------------------------------>| khi trả máy
            |                                                 |
            | Nhận dữ liệu doanh thu & biên bản kiểm tra      |
            |<------------------------------------------------|
            |                                                 |
            |                                                 |
+-----------v-----------+                         +-----------v-----------+
|    MÀN 1: TỔNG QUAN   |<------------------------|   MÀN 4: LỊCH DỰ ÁN   |
| (Tồn kho & Việc ngày) |  Đồng bộ dải ngày đơn   | (Timeline tháng)      |
+-----------------------+  & tình trạng thực hiện +-----------------------+
```
