# sequence.md — Sequence Diagram cho các hành động ghi dữ liệu

## 1. Thêm thiết bị mới

```mermaid
sequenceDiagram
    participant U as Người dùng
    participant F as Frontend
    participant B as Backend
    participant D as Database

    U->>F: Điền form thiết bị, bấm "Lưu thiết bị"
    F->>B: createThietBi(ten, gia_thue, ...)
    B->>B: Kiểm tra có tên thiết bị và giá thuê/ngày hợp lệ
    alt Hợp lệ
        B->>D: INSERT thiet_bi
        D-->>B: OK, trả id thiết bị mới
        B->>D: INSERT lich_su_gia (thiet_bi_id, gia_thue)
        D-->>B: OK
        B-->>F: Thành công
        F-->>U: Đóng modal, danh sách thiết bị hiển thị dòng mới
    else Không hợp lệ
        B-->>F: Lỗi "Cần nhập tên thiết bị và giá thuê/ngày"
        F-->>U: Hiển thị thông báo lỗi, KHÔNG ghi dữ liệu
    end
```

## 2. Import Excel danh sách thiết bị

```mermaid
sequenceDiagram
    participant U as Người dùng
    participant F as Frontend
    participant B as Backend
    participant D as Database

    U->>F: Chọn file Excel, xem bảng preview, bấm "Xác nhận Import"
    F->>F: Lọc bỏ các dòng đã báo lỗi ở bước preview
    F->>B: importThietBiHangLoat(danh sách dòng hợp lệ)
    loop Từng dòng trong file
        B->>B: Kiểm tra dòng có tên và giá thuê hợp lệ
        alt Hợp lệ
            B->>D: INSERT thiet_bi
            D-->>B: OK, trả id
            B->>D: INSERT lich_su_gia (thiet_bi_id, gia_thue)
            D-->>B: OK
        else Không hợp lệ
            B->>B: Ghi nhận lỗi cho dòng này, KHÔNG ghi dữ liệu dòng đó
        end
    end
    B-->>F: Kết quả (số dòng thành công / tổng số dòng)
    F-->>U: Hiển thị "Đã import X/Y thiết bị thành công"
```

## 3. Tạo đơn thuê mới

```mermaid
sequenceDiagram
    participant U as Người dùng
    participant F as Frontend
    participant B as Backend
    participant D as Database

    U->>F: Điền khách hàng, ngày thuê, tick chọn thiết bị, bấm "Tạo đơn"
    F->>F: Kiểm tra có tên+SĐT khách, có ngày, có ≥1 thiết bị đã chọn
    alt Thiếu dữ liệu trên Frontend
        F-->>U: Hiển thị lỗi ngay trên form, KHÔNG gọi Backend
    else Đủ dữ liệu, gọi Backend
        F->>B: taoDonThue(khachHang, ngayBatDau, ngayTraDuKien, thietBi[])
        loop Từng thiết bị đã chọn
            B->>D: Truy vấn các đơn khác đang giữ thiết bị này
            D-->>B: Danh sách đơn trùng (nếu có)
            B->>B: Kiểm tra có đơn nào ở chặng Báo giá/Đã giao/Chờ trả trùng ngày không
        end
        alt Tất cả thiết bị đều còn trống (không bị khoá cứng)
            B->>D: INSERT khach_hang
            D-->>B: OK, trả id khách hàng
            B->>D: INSERT don_thue (chặng = Yêu cầu)
            D-->>B: OK, trả id đơn
            B->>D: INSERT don_thue_chi_tiet (nhiều dòng)
            D-->>B: OK
            B-->>F: Thành công, trả id đơn mới
            F-->>U: Chuyển sang trang chi tiết đơn vừa tạo
        else Có thiết bị bị khoá cứng
            B-->>F: Lỗi "Thiết bị không còn trống trong khoảng ngày này"
            F-->>U: Hiển thị thông báo lỗi, KHÔNG tạo đơn
        end
    end
```

## 4. Xoá dòng thiết bị khỏi đơn

```mermaid
sequenceDiagram
    participant U as Người dùng
    participant F as Frontend
    participant B as Backend
    participant D as Database

    U->>F: Bấm "Xoá" trên dòng thiết bị (chỉ hiện khi chặng = Yêu cầu)
    F->>B: xoaThietBiKhoiDon(chiTietId, donId)
    B->>D: DELETE don_thue_chi_tiet WHERE id = chiTietId
    alt Xoá thành công
        D-->>B: OK
        B-->>F: Thành công
        F-->>U: Dòng thiết bị biến mất khỏi bảng, tổng tiền cập nhật lại
    else Dòng không tồn tại / lỗi ghi
        D-->>B: Lỗi
        B-->>F: Lỗi xoá dòng thiết bị
        F-->>U: Hiển thị thông báo lỗi, KHÔNG thay đổi dữ liệu
    end
```

## 5. Chuyển chặng đơn thuê

```mermaid
sequenceDiagram
    participant U as Người dùng
    participant F as Frontend
    participant B as Backend
    participant D as Database

    U->>F: Bấm nút chuyển chặng (vd: "Chốt công nợ & Hoàn tất")
    F->>B: chuyenChangDon(donId, changMoi)
    B->>D: SELECT chặng hiện tại của đơn
    D-->>B: Chặng hiện tại
    B->>B: Kiểm tra changMoi có nằm trong danh sách chặng kế tiếp hợp lệ không
    alt changMoi = "Xong"
        B->>D: SELECT các dòng thiết bị + các bản kiểm tra tình trạng của đơn
        D-->>B: Danh sách thiết bị / danh sách đã kiểm tra
        B->>B: Kiểm tra mọi thiết bị trong đơn đã có bản kiểm tra tình trạng chưa
    end
    alt Chuyển chặng hợp lệ (đúng luồng, và nếu là "Xong" thì đã kiểm tra đủ)
        B->>D: UPDATE don_thue SET chang = changMoi
        D-->>B: OK
        B->>D: UPDATE thiet_bi SET trang_thai (Đang thuê / Sẵn sàng) cho các thiết bị liên quan
        D-->>B: OK
        B-->>F: Thành công
        F-->>U: Badge chặng và thanh tiến trình cập nhật
    else Không hợp lệ
        B-->>F: Lỗi "Không thể chuyển từ chặng ... sang ..." hoặc "Chưa kiểm tra tình trạng đầy đủ"
        F-->>U: Hiển thị thông báo lỗi, KHÔNG đổi chặng
    end
```

## 6. Ghi nhận thanh toán

```mermaid
sequenceDiagram
    participant U as Người dùng
    participant F as Frontend
    participant B as Backend
    participant D as Database

    U->>F: Nhập số tiền, chọn loại/hình thức, bấm "Ghi nhận"
    F->>F: Kiểm tra đã nhập số tiền chưa
    alt Chưa nhập số tiền
        F-->>U: Không gửi đi, form giữ nguyên
    else Đã nhập số tiền
        F->>B: ghiThanhToan(donId, so_tien, hinh_thuc, loai)
        B->>D: INSERT thanh_toan (don_thue_id, so_tien, hinh_thuc, loai)
        alt Ghi thành công
            D-->>B: OK
            B-->>F: Thành công
            F-->>U: Lịch sử thanh toán cập nhật, công nợ còn lại tự giảm
        else Lỗi ghi (vd: đơn không tồn tại)
            D-->>B: Lỗi
            B-->>F: Lỗi ghi nhận thanh toán
            F-->>U: Hiển thị thông báo lỗi, KHÔNG ghi dữ liệu
        end
    end
```

## 7. Ghi chi phí phát sinh

```mermaid
sequenceDiagram
    participant U as Người dùng
    participant F as Frontend
    participant B as Backend
    participant D as Database

    U->>F: Chọn loại chi phí, nhập mô tả + số tiền, bấm "Thêm chi phí"
    F->>F: Kiểm tra đã nhập số tiền chưa
    alt Chưa nhập số tiền
        F-->>U: Không gửi đi, form giữ nguyên
    else Đã nhập số tiền
        F->>B: ghiChiPhi(donId, loai, mo_ta, so_tien)
        B->>D: INSERT chi_phi (don_thue_id, loai, mo_ta, so_tien)
        alt Ghi thành công
            D-->>B: OK
            B-->>F: Thành công
            F-->>U: Danh sách chi phí phát sinh cập nhật, tổng tiền đơn tính lại
        else Lỗi ghi (vd: đơn không tồn tại)
            D-->>B: Lỗi
            B-->>F: Lỗi ghi nhận chi phí
            F-->>U: Hiển thị thông báo lỗi, KHÔNG ghi dữ liệu
        end
    end
```

## 8. Thêm cọc giấy tờ

```mermaid
sequenceDiagram
    participant U as Người dùng
    participant F as Frontend
    participant B as Backend
    participant D as Database

    U->>F: Chọn loại giấy tờ, nhập số hiệu, bấm "Thêm giấy tờ cọc"
    F->>B: themCocGiayTo(donId, loai_giay_to, so_hieu)
    B->>D: INSERT coc_giay_to (don_thue_id, loai_giay_to, so_hieu, trang_thai = Đang giữ)
    alt Đơn tồn tại, ghi thành công
        D-->>B: OK
        B-->>F: Thành công
        F-->>U: Badge "Đang giữ [loại giấy tờ]" xuất hiện trong khối Tài chính
    else Đơn không tồn tại / lỗi ghi
        D-->>B: Lỗi ràng buộc khoá ngoại
        B-->>F: Lỗi thêm cọc giấy tờ
        F-->>U: Hiển thị thông báo lỗi, KHÔNG ghi dữ liệu
    end
```

## 9. Đánh dấu đã hoàn trả giấy tờ cọc

```mermaid
sequenceDiagram
    participant U as Người dùng
    participant F as Frontend
    participant B as Backend
    participant D as Database

    U->>F: Bấm "Đánh dấu đã hoàn trả giấy tờ" trên giấy tờ đang giữ
    F->>B: hoanTraGiayTo(id, donId)
    B->>D: UPDATE coc_giay_to SET trang_thai = "Đã hoàn trả" WHERE id = ...
    alt Giấy tờ tồn tại, cập nhật thành công
        D-->>B: OK
        B-->>F: Thành công
        F-->>U: Badge chuyển thành "✓ Đã hoàn trả"
    else Giấy tờ không tồn tại / lỗi ghi
        D-->>B: Lỗi
        B-->>F: Lỗi cập nhật trạng thái giấy tờ
        F-->>U: Hiển thị thông báo lỗi, KHÔNG đổi trạng thái
    end
```

## 10. Ghi biên bản kiểm tra tình trạng

```mermaid
sequenceDiagram
    participant U as Người dùng
    participant F as Frontend
    participant B as Backend
    participant D as Database

    U->>F: Chọn thiết bị, chọn tình trạng, nhập người kiểm/ghi chú, bấm "Lưu kiểm tra"
    F->>F: Kiểm tra đã chọn thiết bị chưa
    alt Chưa chọn thiết bị
        F-->>U: Không gửi đi, form giữ nguyên
    else Đã chọn thiết bị
        F->>B: ghiKiemTraTinhTrang(donId, thiet_bi_id, tinh_trang, nguoi_kiem, ghi_chu)
        B->>D: UPSERT kiem_tra_tinh_trang (don_thue_id, thiet_bi_id, tinh_trang, ...)
        alt Ghi/cập nhật thành công
            D-->>B: OK
            B-->>F: Thành công
            F-->>U: Badge tình trạng thiết bị cập nhật trong Biên bản kiểm tra khi trả
        else Lỗi ghi (vd: đơn/thiết bị không tồn tại)
            D-->>B: Lỗi
            B-->>F: Lỗi ghi biên bản kiểm tra
            F-->>U: Hiển thị thông báo lỗi, KHÔNG ghi dữ liệu
        end
    end
```
