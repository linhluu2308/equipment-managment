# design.md — App quản lý cho thuê thiết bị CineB

> Một câu: app này giúp chủ và nhân viên kho quản lý toàn bộ vòng đời cho thuê thiết bị điện ảnh, đồng nhất báo giá, tự động kiểm tra trùng lịch, quản lý cọc tiền & cọc giấy tờ, thu đúng công nợ và theo dõi lợi nhuận/tần suất cho thuê từng thiết bị.

## 1. Người dùng

| Vai | Tên/bộ phận | Họ mở app để hỏi điều gì |
|---|---|---|
| **Chủ** | Quản lý / Điều hành | "Hôm nay có những đơn nào chạy? Tháng này dự án phân bổ ra sao? Đơn nào chưa thu hết nợ / chưa trả giấy tờ cọc? Thiết bị nào sinh lời tốt nhất, thiết bị nào được thuê nhiều nhất?" |
| **Nhân viên kho** | Kỹ thuật / Thủ kho | "Hôm nay cần chuẩn bị xuất thiết bị gì cho khách? Đang giữ giấy tờ cọc nào của khách? Thiết bị khách vừa trả về có đủ và nguyên vẹn không?" |

**Hiện nay việc đang nằm ở:** Google Sheet, Google Calendar, tin nhắn trao đổi rời rạc
**Chỗ đau nhất:** "báo giá chưa được đồng nhất, quên thu công nợ, quên trả hoặc thất lạc giấy tờ cọc, cho thuê thiếu hoặc thừa so với thực tế, dễ trùng lịch thiết bị"

**Rủi ro:** Khách hàng không tự mở app ở vòng đầu này — khách liên hệ trực tiếp, Chủ/Kho nhập thông tin thay họ. Trang khách tự đặt thiết bị để dành cho vòng sau.

**Phân quyền hiện tại chỉ ở mức giao diện** (chưa có tài khoản đăng nhập thật — chọn vai qua nút "Xem như: Chủ / Kho" ở chân sidebar, lưu tạm trên trình duyệt): Kho không thấy nút thêm/sửa/import thiết bị và không thấy mục điều hướng "Báo cáo"; các chức năng còn lại (tạo đơn, chuyển chặng, ghi cọc, kiểm tra tình trạng...) hai vai thao tác như nhau.

## 2. Nghiệp vụ

**Dạng A — app CÓ chặng**

Dòng đời một đơn thuê:
Yêu cầu → Báo giá → Đã giao → Chờ trả → Xong

Nhánh rẽ:
- Tại **Yêu cầu** hoặc **Báo giá** → **Huỷ đơn**; Chủ/Kho tự bấm huỷ.
- Không có chặng "Đã cọc" riêng — ghi cọc tiền/cọc giấy tờ là thao tác tuỳ chọn đi kèm, không phải điều kiện bắt buộc để chuyển chặng.

**Con số app phải tính ra** (không lưu tay):
- **Số ngày thuê** = (Ngày trả dự kiến − Ngày bắt đầu thuê) + 1
- **Tổng tiền đơn** = Σ(Giá thuê chốt/ngày × Số ngày thuê × (1 − % chiết khấu của dòng đó)) + Tổng chi phí phát sinh
- **Công nợ còn lại** = Tổng tiền đơn − Tổng đã thu (cộng các khoản cọc/thanh toán đợt/tất toán, trừ ngược lại khoản hoàn cọc)
- **Lợi nhuận thiết bị** = Doanh thu từ các đơn đã ở chặng "Xong" − Giá vốn × số lượt (chỉ với thiết bị thuê ngoài) — *chi phí phát sinh của đơn (vận chuyển, bồi thường...) chưa được phân bổ về từng thiết bị, chỉ tính ở cấp đơn*
- **Tồn kho sẵn sàng (theo loại)** = Tổng số thiết bị của loại đó − Số thiết bị đang có trạng thái "Đang thuê"
- **Tần suất cho thuê của thiết bị** = số lượt xuất hiện trong các đơn chưa huỷ (kể cả đơn đang chạy, chưa xong) + tổng số ngày thuê cộng dồn

**Quy tắc:**
- **Kiểm tra trùng lịch (Availability Check)** — theo chặng của đơn đang giữ thiết bị đó, không phân biệt đã cọc hay chưa:
  - Đơn ở chặng **Báo giá, Đã giao, Chờ trả**: **Khoá cứng (Hard block)** — không cho thêm thiết bị này vào đơn khác nếu trùng khoảng ngày.
  - Đơn ở chặng **Yêu cầu**: **Cảnh báo mềm (Soft warning)** — báo có đơn khác đang hỏi cùng ngày nhưng vẫn cho thêm vào đơn đang tạo.
- **Chuyển chặng "Đã giao":** không bị chặn bởi việc đã ghi cọc hay chưa — ghi cọc tiền/cọc giấy tờ là form riêng, tuỳ chọn, không phải điều kiện bắt buộc.
- **Chuyển chặng "Xong":** bắt buộc phải có bản ghi kiểm tra tình trạng cho **tất cả** thiết bị trong đơn; thiếu một thiết bị thì nút chuyển chặng báo lỗi và không cho qua. Không bắt buộc công nợ phải về 0, cũng không bắt buộc đã đánh dấu hoàn trả giấy tờ cọc trước khi chốt "Xong" (hai việc này vẫn ghi nhận được độc lập, không khoá lẫn nhau).
- **Quy tắc giá & chiết khấu:**
  - Giá thuê chốt vào đơn tại thời điểm tạo đơn; sau này đổi giá niêm yết của thiết bị thì đơn cũ vẫn giữ giá cũ.
  - % chiết khấu nhập riêng cho **từng dòng thiết bị trong đơn**, không phải một con số chung cho cả đơn.
- **Quy tắc Import Excel:** Tải file mẫu Excel (.xlsx), điền danh sách thiết bị theo cột `ten, ma, danh_muc, nguon_goc, nha_cung_cap, gia_von, gia_thue`, app đọc và validate trước khi cho xác nhận import hàng loạt.

## 3. Màn hình

| Màn | Ai xem | Mở ra thấy gì | Làm được gì ở đây |
|---|---|---|---|
| **1 · Tổng quan** | Chủ, Nhân viên kho | - 4 thẻ KPI: Đơn thuê đang chạy, Cần bàn giao hôm nay, Dự kiến nhận về hôm nay, Thiết bị sẵn sàng<br>- Bảng đơn đang diễn ra (chặng Báo giá/Đã giao/Chờ trả) và bảng yêu cầu/sắp tới (chặng Yêu cầu)<br>- Bảng tồn kho nhanh theo loại: Tổng / Còn trống | - Bấm vào 1 đơn để nhảy sang chi tiết tại Màn 2 |
| **2 · Đơn thuê** *(Trung tâm thao tác)* | Chủ, Nhân viên kho | - Danh sách đơn lọc theo chặng: Tất cả / Yêu cầu / Báo giá / Đã giao / Chờ trả / Xong / Đã huỷ<br>- **Modal Tạo đơn mới:** tìm kiếm thiết bị theo tên/mã + lọc theo danh mục (lấy động từ dữ liệu thiết bị), cảnh báo ngay nếu thiết bị trùng lịch<br>- **Chi tiết đơn:** thông tin khách hàng, dải ngày thuê, danh sách thiết bị + giá + chiết khấu + thành tiền, tài chính (tổng tiền/đã thu/công nợ, lịch sử thanh toán, cọc giấy tờ, chi phí phát sinh), biên bản kiểm tra khi trả, khu vực thao tác chuyển chặng | - Tạo đơn mới, chọn thiết bị & khoảng ngày (kiểm tra trùng lịch)<br>- Xoá dòng thiết bị khỏi đơn (chỉ khi đơn còn ở chặng Yêu cầu)<br>- Ghi nhận thanh toán, chi phí phát sinh, cọc giấy tờ (và đánh dấu hoàn trả)<br>- Ghi biên bản kiểm tra tình trạng khi trả<br>- Chuyển chặng đơn theo đúng luồng cho phép |
| **3 · Thiết bị** | Chủ (toàn quyền), Nhân viên kho (chỉ xem, không thấy nút thêm/sửa/import) | - Danh sách thiết bị: Mã, Tên, Danh mục, Giá thuê/ngày, Nguồn gốc, Trạng thái (Sẵn sàng/Đang thuê/Bảo trì)<br>- Chi tiết thiết bị: giá hiện hành + lịch sử đổi giá, lịch sử cho thuê, lịch sử kiểm tra tình trạng, hiệu quả sinh lời (doanh thu/giá vốn/lợi nhuận) | - Thêm thiết bị mới lẻ (Chủ)<br>- Import danh sách thiết bị từ Excel (Chủ)<br>- Xem chi tiết, lịch sử cho thuê & lợi nhuận (cả hai vai) |
| **4 · Calendar** | Chủ, Nhân viên kho | - Lưới lịch theo tháng, các đơn hiển thị dưới dạng thanh màu theo chặng (vàng: chờ chốt/báo giá · xanh dương: đã giao · xanh lá: chờ trả · xám: xong)<br>- Popover xem nhanh khi bấm vào một thanh | - Chuyển tháng trước/sau<br>- Bấm vào thanh dự án → nhảy sang chi tiết đơn ở Màn 2 |
| **5 · Báo cáo** | Chỉ Chủ (mục điều hướng ẩn với Kho) | - 4 thẻ KPI: tổng doanh thu (đơn đã Xong), tổng lợi nhuận ròng, số đơn đã hoàn tất, thiết bị sinh lời tốt nhất<br>- Bảng xếp hạng theo thiết bị: lượt thuê, tổng ngày thuê, doanh thu, giá vốn, lợi nhuận (sắp theo lợi nhuận giảm dần)<br>- Khối liệt kê thiết bị chưa từng được thuê | - Xem xếp hạng để ra quyết định đầu tư/định giá thiết bị |

*Thông tin khách hàng (tên, SĐT, người giới thiệu) được tạo/nhập trực tiếp trong Màn 2 khi tạo đơn, không cần màn hình quản lý khách riêng ở vòng đầu.*

## 4. Dữ liệu cần lưu

Thứ phải **còn lại** sau khi tắt trình duyệt:

| Lưu hồ sơ của | Mỗi hồ sơ gồm những mục | Nối với nhau thế nào | Chỗ tôi tự suy — cần bạn xác nhận |
|---|---|---|---|
| **Thiết bị** `thiet_bi` | mã · tên · danh mục (chữ tự do, không giới hạn danh sách cố định) · nguồn gốc (sở hữu / thuê ngoài) · nhà cung cấp (nếu thuê ngoài) · giá vốn (nếu thuê ngoài) · mô tả · trạng thái (sẵn sàng / đang thuê / bảo trì) | một thiết bị xuất hiện trong nhiều đơn thuê, có nhiều mốc lịch sử giá và nhiều lần kiểm tra | Trường ảnh có trong dữ liệu nhưng **chưa có ô nhập ảnh trên giao diện** — để trống cho vòng sau |
| **Lịch sử giá thuê** `lich_su_gia` | thiết bị nào · giá thuê/ngày · ngày bắt đầu áp dụng | một thiết bị có nhiều mốc giá theo thời gian | Đổi giá tạo dòng mới, không ghi đè giá cũ — đã xác nhận |
| **Khách hàng** `khach_hang` | tên khách · số điện thoại · người giới thiệu (không bắt buộc) | một khách hàng có nhiều đơn thuê | — |
| **Đơn thuê** `don_thue` | khách hàng nào · chặng hiện tại (yêu cầu / báo giá / đã giao / chờ trả / xong / huỷ) · ngày tạo đơn · ngày bắt đầu thuê · ngày trả dự kiến · ghi chú chung | một đơn thuê có nhiều thiết bị, nhiều khoản thanh toán, nhiều chi phí phát sinh, nhiều giấy tờ cọc | Đơn không có mã số nghiệp vụ dạng "DH-xxxx" — giao diện hiển thị bằng 8 ký tự đầu của ID hệ thống |
| **Dòng thiết bị trong đơn** `don_thue_chi_tiet` | đơn nào · thiết bị nào · giá thuê chốt tại đơn · % chiết khấu áp dụng cho riêng dòng này | mỗi dòng gắn với đúng một đơn và một thiết bị cụ thể | — |
| **Cọc giấy tờ** `coc_giay_to` | đơn nào · loại giấy tờ (CCCD / Bằng lái xe / Cà vẹt xe / Passport / Khác) · số hiệu giấy tờ · trạng thái (đang giữ / đã hoàn trả) | một đơn có thể giữ một hoặc nhiều loại giấy tờ cọc | Trường ảnh có trong dữ liệu nhưng **chưa có ô chụp/đính kèm ảnh trên giao diện** — để trống cho vòng sau |
| **Thanh toán** `thanh_toan` | đơn nào · số tiền · ngày thu · hình thức (tiền mặt / chuyển khoản) · loại (cọc tiền / thanh toán đợt / tất toán / hoàn cọc) | một đơn có nhiều lần giao dịch thanh toán | — |
| **Chi phí phát sinh** `chi_phi` | đơn nào · loại (vận chuyển / bồi thường hư hại / phụ phí) · mô tả · số tiền | một đơn có nhiều khoản chi phí phát sinh | — |
| **Kiểm tra tình trạng** `kiem_tra_tinh_trang` | thiết bị nào · thuộc đơn nào · ngày trả · tình trạng (tốt / trầy xước / hỏng hóc) · người kiểm · ghi chú | mỗi thiết bị trong một đơn có đúng một bản kiểm tra (ghi đè nếu nhập lại) | — |

**Không lưu riêng** (app tự tính mỗi khi mở): Tổng số ngày thuê, Tổng tiền đơn, Công nợ còn lại, Tồn kho tức thời, Lợi nhuận & tần suất cho thuê của thiết bị.

## 5. Xong khi nào

- Tạo đơn mới, chọn thiết bị & dải ngày → số ngày thuê hiển thị đúng, giá thuê tự lấy đúng giá đang áp dụng của thiết bị, app tự tính tổng tiền đơn.
- Chọn thiết bị đã bị giữ bởi đơn khác (đang ở chặng Báo giá/Đã giao/Chờ trả) trùng khoảng ngày → app báo ngay "thiết bị không còn trống" và chặn không cho thêm.
- Chọn thiết bị đang được một đơn khác **ở chặng Yêu cầu** hỏi cùng ngày → app vẫn cho thêm, kèm cảnh báo mềm.
- Tải file Excel danh sách thiết bị lên Màn 3 → toàn bộ dòng hợp lệ trong file được import vào hệ thống với đầy đủ giá thuê, giá vốn và danh mục; dòng thiếu tên/giá bị báo lỗi và không import.
- Ghi nhận thanh toán → công nợ còn lại tự giảm ngay lập tức; ghi nhận hoàn cọc → công nợ tự tăng lại tương ứng.
- Xoá bớt thiết bị khỏi đơn (ở chặng Yêu cầu) → tổng tiền và công nợ tự động cập nhật lại chính xác.
- Cố chuyển đơn sang "Xong" khi còn thiết bị chưa được ghi kiểm tra tình trạng → app chặn lại, báo rõ lý do.
- Mở Màn 1 (Tổng quan) → thấy ngay danh sách đơn đang chạy/yêu cầu và bảng tồn kho thiết bị khả dụng.
- Mở Màn 4 (Calendar) → thấy lưới lịch tháng với các thanh dự án hiển thị đúng màu theo chặng; bấm vào thanh nhảy sang Màn 2.
- Sau khi chốt đơn "Xong" → Màn 3 và Màn 5 (Báo cáo) cập nhật ngay doanh thu, lợi nhuận và lượt thuê của các thiết bị trong đơn đó.
- Mở Màn 5 (Báo cáo) → thấy bảng xếp hạng thiết bị theo lợi nhuận, kèm số lượt thuê và tổng ngày thuê của từng thiết bị.

## Đã cân nhắc và hoãn

| Tính năng | Vì sao hoãn |
|---|---|
| Cổng khách hàng tự đặt thuê online | Là luồng công khai riêng — để sau khi luồng quản trị nội bộ chạy mượt mà |
| Đồng bộ tự động 2 chiều Google Calendar | Giai đoạn đầu dùng Calendar tích hợp sẵn trong Màn 4 |
| Công thức chiết khấu tự động theo số ngày thuê | Hiện tại thỏa thuận chiết khấu thủ công từng dòng thiết bị |
| Phân quyền tài khoản đăng nhập thật | Vòng đầu chia quyền theo giao diện (ẩn/hiện nút và mục điều hướng), chưa có đăng nhập/bảo vệ ở tầng server |
| Ảnh thiết bị & ảnh chụp giấy tờ cọc | Có sẵn chỗ lưu trong dữ liệu nhưng chưa làm giao diện chụp/tải ảnh |
| Xuất file/PDF báo giá gửi khách | Chưa làm; chuyển chặng sang Báo giá hiện chỉ là đổi trạng thái nội bộ |
| Bắt buộc có cọc mới được giao, bắt buộc công nợ về 0 và trả giấy tờ mới được chốt Xong | Các ràng buộc này chưa được cài đặt — hiện là các thao tác độc lập, không khoá lẫn nhau |
| Phân bổ chi phí phát sinh của đơn về từng thiết bị trong tính lợi nhuận | Hiện lợi nhuận thiết bị chỉ trừ giá vốn, chưa trừ chi phí vận chuyển/bồi thường ở cấp đơn |
