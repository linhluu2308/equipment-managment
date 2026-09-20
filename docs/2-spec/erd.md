# erd.md — Sơ đồ quan hệ dữ liệu (ERD) CineB Webapp

Vẽ theo đúng mục "4. Dữ liệu cần lưu" trong `design.md` (9 bảng, không thêm/bớt). Tên bảng/cột dùng tiếng Anh; các cột thể hiện trạng thái/loại có tập giá trị cố định trong tài liệu đều khai báo kiểu `enum` (không dùng `string` tự do) — giá trị enum lấy đúng danh sách đã liệt kê trong `design.md`.

```mermaid
erDiagram
    EquipmentCategory ||--o{ Equipment : "1 danh mục có nhiều thiết bị"
    StaffAccount ||--o{ ConditionCheck : "1 nhân viên ghi nhiều bản kiểm tra"
    Customer ||--o{ RentalOrder : "1 khách hàng có nhiều đơn thuê"
    RentalOrder ||--o{ RentalOrderItem : "1 đơn thuê có nhiều dòng thiết bị"
    Equipment ||--o{ RentalOrderItem : "1 thiết bị xuất hiện trong nhiều dòng đơn"
    Equipment ||--o{ PriceHistory : "1 thiết bị có nhiều mốc giá"
    RentalOrder ||--o{ DepositDocument : "1 đơn có nhiều giấy tờ cọc"
    RentalOrder ||--o{ Payment : "1 đơn có nhiều lần thanh toán"
    RentalOrder ||--o{ ExtraCost : "1 đơn có nhiều khoản chi phí phát sinh"
    RentalOrder ||--o{ ConditionCheck : "1 đơn có nhiều bản kiểm tra tình trạng"
    Equipment ||--o{ ConditionCheck : "1 thiết bị có nhiều lần được kiểm tra"

    EquipmentCategory {
        uuid id PK
        string name
    }

    StaffAccount {
        uuid id PK
        string name
        enum role "OWNER | WAREHOUSE"
    }

    Equipment {
        uuid id PK
        string code
        string name
        uuid category_id FK
        enum source "OWNED | RENTED_IN"
        string supplier
        decimal cost_price
        string description
        string image_url
        enum status "AVAILABLE | RENTED | MAINTENANCE"
    }

    PriceHistory {
        uuid id PK
        uuid equipment_id FK
        decimal daily_rate
        date effective_date
    }

    Customer {
        uuid id PK
        string name
        string phone
        string referred_by
    }

    RentalOrder {
        uuid id PK
        string order_number UK
        uuid customer_id FK
        enum stage "REQUESTED | QUOTED | DELIVERED | RETURN_PENDING | DONE | CANCELLED"
        date start_date
        date end_date
        string note
        timestamp created_at
    }

    RentalOrderItem {
        uuid id PK
        uuid order_id FK
        uuid equipment_id FK
        decimal locked_daily_rate
        decimal discount_percent
    }

    DepositDocument {
        uuid id PK
        uuid order_id FK
        enum document_type "ID_CARD | DRIVER_LICENSE | VEHICLE_REGISTRATION | PASSPORT | OTHER"
        string document_number
        string photo_url
        enum status "HELD | RETURNED"
        timestamp created_at
    }

    Payment {
        uuid id PK
        uuid order_id FK
        decimal amount
        date paid_at
        enum method "CASH | BANK_TRANSFER"
        enum type "DEPOSIT | INSTALLMENT | FINAL_SETTLEMENT | REFUND"
        timestamp created_at
    }

    ExtraCost {
        uuid id PK
        uuid order_id FK
        enum type "SHIPPING | DAMAGE_COMPENSATION | SURCHARGE"
        string description
        decimal amount
        timestamp created_at
    }

    ConditionCheck {
        uuid id PK
        uuid equipment_id FK
        uuid order_id FK
        date returned_at
        enum condition "GOOD | SCRATCHED | DAMAGED"
        uuid inspector_id FK
        string note
        timestamp created_at
    }
```

## Ghi chú ánh xạ tên bảng (tiếng Việt trong design.md → tiếng Anh trong ERD)

| design.md | erd.md |
|---|---|
| `thiet_bi` | `Equipment` |
| `lich_su_gia` | `PriceHistory` |
| `khach_hang` | `Customer` |
| `don_thue` | `RentalOrder` |
| `don_thue_chi_tiet` | `RentalOrderItem` |
| `coc_giay_to` | `DepositDocument` |
| `thanh_toan` | `Payment` |
| `chi_phi` | `ExtraCost` |
| `kiem_tra_tinh_trang` | `ConditionCheck` |

`EquipmentCategory` không có trong `design.md` gốc — được thêm theo đề xuất đã duyệt (xem mục "Đã duyệt và đưa vào bản vẽ") để tránh sai lệch số liệu gộp nhóm do gõ tay không thống nhất.

---

## Đã duyệt và đưa vào bản vẽ

- ✅ **Timestamp tạo bản ghi** (`created_at`) cho `Payment`, `ExtraCost`, `DepositDocument`, `ConditionCheck` — đã thêm vào sơ đồ ở trên.
- ✅ **Bảng danh mục thiết bị riêng** (`EquipmentCategory`) thay cho `category` chữ tự do — đã thêm vào sơ đồ ở trên (`Equipment.category_id FK`).
- ✅ **Mã đơn dễ đọc** (`order_number`) trên `RentalOrder` — đã thêm vào sơ đồ ở trên.
- ✅ **Ảnh đính kèm** (`Equipment.image_url`, `DepositDocument.photo_url`) — đã thêm vào sơ đồ ở trên. *(Lưu ý: giao diện thật chưa có chỗ tải/chụp ảnh — cần làm thêm phần đó mới dùng được cột này.)*
- ✅ **Bảng nhân sự** (`StaffAccount`) — đã thêm vào sơ đồ ở trên; `ConditionCheck.inspector` đổi thành khóa ngoại `inspector_id`. *(Lưu ý: giao diện thật chưa có đăng nhập thật — vai Chủ/Kho vẫn chỉ là lựa chọn tạm trên trình duyệt, chưa gắn với `StaffAccount` nào; cần làm thêm phần đăng nhập mới dùng được đầy đủ bảng này.)*

Cả 5 đề xuất đã được duyệt và đưa vào bản vẽ chính — không còn đề xuất nào đang chờ.
