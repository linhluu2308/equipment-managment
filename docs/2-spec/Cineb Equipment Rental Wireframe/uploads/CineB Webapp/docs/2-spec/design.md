# design.md — App quản lý cho thuê thiết bị CineB

> Một câu: app này giúp chủ và nhân viên kho quản lý toàn bộ vòng đời cho thuê thiết bị điện ảnh, đồng nhất báo giá, tự động kiểm tra trùng lịch, thu đúng công nợ và theo dõi lợi nhuận từng thiết bị.

## 1. Người dùng

| Vai | Tên/bộ phận | Họ mở app để hỏi điều gì |
|---|---|---|
| **Chủ** | Quản lý / Điều hành | "Hôm nay có những đơn nào chạy? Tháng này dự án phân bổ ra sao? Báo giá thế nào là chuẩn? Đơn nào chưa thu hết nợ? Thiết bị nào sinh lời tốt nhất?" |
| **Nhân viên kho** | Kỹ thuật / Thủ kho | "Hôm nay cần chuẩn bị xuất thiết bị gì cho khách? Thiết bị khách vừa trả về có đủ và nguyên vẹn không?" |

**Hiện nay việc đang nằm ở:** Google Sheet, Google Calendar, tin nhắn trao đổi rời rạc  
**Chỗ đau nhất:** "báo giá chưa được đồng nhất, quên thu công nợ, cho thuê thiếu hoặc thừa so với thực tế, dễ trùng lịch thiết bị"

**Rủi ro:** Khách hàng không tự mở app ở vòng đầu này — khách liên hệ trực tiếp, Chủ/Kho nhập thông tin thay họ. Trang khách tự đặt thiết bị để dành cho vòng sau.

## 2. Nghiệp vụ

**Dạng A — app CÓ chặng**

Dòng đời một đơn thuê:
Yêu cầu → Báo giá → Đã giao → Chờ trả → Xong

Nhánh rẽ:
- Tại **Yêu cầu / Báo giá** → **Từ chối / Huỷ đơn** khi thiết bị không đủ hoặc khách không đồng ý báo giá; Chủ/Kho đánh dấu huỷ.

**Con số app phải tính ra** (không lưu tay):
- **Tổng tiền đơn** = $\sum(\text{Giá thuê/ngày} \times \text{Số ngày thuê}) - \text{Chiết khấu} + \text{Chi phí phát sinh}$
- **Công nợ còn lại** = $\text{Tổng tiền đơn} - \text{Tổng tiền đã thu}$ (cọc + thanh toán đợt)
- **Lợi nhuận thiết bị** = $\sum \text{Doanh thu cho thuê} - \text{Giá vốn (nếu thuê ngoài)} - \text{Chi phí bảo trì/vận chuyển}$
- **Tồn kho sẵn sàng (theo loại)** = $\text{Tổng số lượng} - \text{Số lượng đang trong đơn đã giao/đang thuê}$

**Quy tắc:**
- **Kiểm tra trùng lịch (Availability Check):**
  - Đơn ở chặng *Đã giao* hoặc *Báo giá đã cọc*: **Khóa cứng (Hard block)** — Không cho phép gán thiết bị này cho đơn khác trùng khoảng ngày `[Ngày bắt đầu → Ngày trả dự kiến]`.
  - Đơn ở chặng *Yêu cầu / Báo giá chưa cọc*: **Cảnh báo mềm (Soft warning)** — Báo hiệu đang có đơn khác hỏi cùng ngày nhưng vẫn cho phép soạn báo giá.
- **Quy tắc chuyển sang "Đã giao":** Phải ghi nhận cọc (trừ khách quen thỏa thuận trả sau 100%).
- **Quy tắc chuyển sang "Xong" (Chốt công nợ):**
  - Bắt buộc phải có phiếu ghi nhận tình trạng kiểm tra (Check-in) cho toàn bộ thiết bị trong đơn.
  - Phải ghi nhận xong toàn bộ phát sinh (nếu có) và đối soát công nợ về 0 (hoặc hoàn cọc thừa).
- **Quy tắc giá & chiết khấu:**
  - Giá thuê lấy theo giá hiệu lực tại thời điểm tạo đơn. Sau này đổi giá danh mục thì đơn cũ giữ nguyên.
  - Chiết khấu nhập trực tiếp theo từng đơn (dựa trên thỏa thuận hoặc chi phí vốn thiết bị).

## 3. Màn hình

| Màn | Ai xem | Mở ra thấy gì | Làm được gì ở đây |
|---|---|---|---|
| **1 · Tổng quan** | Chủ, Nhân viên kho | - Danh sách đơn đang diễn ra (đang thuê, trong ngày trả)<br>- Danh sách đơn sắp tới (đã chốt, chưa tới ngày giao)<br>- Bảng tồn kho nhanh: Phân loại thiết bị → Tổng / Đang thuê / Còn trống | - Bấm vào 1 đơn bất kỳ để nhảy sang xem chi tiết tại Màn 2<br>*(Màn hình chỉ xem - Dashboard vận hành nhanh)* |
| **2 · Đơn thuê** *(Trung tâm thao tác)* | Chủ, Nhân viên kho | - Danh sách đơn lọc theo chặng: Yêu cầu / Báo giá / Đã giao / Chờ trả / Xong<br>- Chi tiết đơn: Khách hàng, danh sách thiết bị + ngày thuê, giá, chiết khấu, cọc/thanh toán, công nợ, chi phí phát sinh, biên bản kiểm tra thiết bị khi trả | - Tạo đơn mới<br>- Chọn thiết bị & ngày (kiểm tra trùng lịch)<br>- Lập báo giá & áp dụng chiết khấu<br>- Ghi nhận cọc / thanh toán đợt<br>- Chuyển chặng đơn<br>- Ghi biên bản kiểm tra thiết bị khi nhập kho<br>- Chốt công nợ & hoàn tất đơn |
| **3 · Thiết bị** | Chủ (toàn quyền), Nhân viên kho (chỉ xem) | - Danh sách thiết bị + trạng thái (Sẵn sàng / Đang thuê / Bảo trì)<br>- Chi tiết thiết bị: Giá thuê/ngày, giá vốn (nếu thuê lại), lịch sử tình trạng qua các lần trả (nối từ Màn 2), lợi nhuận lũy kế | - Thêm thiết bị mới<br>- Sửa thông tin thiết bị (giá thuê, giá vốn, mô tả)<br>- Xem lịch sử cho thuê & hiệu quả sinh lời |
| **4 · Calendar** | Chủ (toàn quyền), Nhân viên kho (chỉ xem) | - Lưới lịch theo tháng hiển thị các dải dự án/đơn thuê<br>- Phân biệt trực quan qua màu sắc trạng thái: Đã xong (xám) / Đang chờ chốt (vàng) / Đã chốt chờ giao (xanh lá) / Đang chạy (xanh dương) | - Chuyển tháng / tuần xem mật độ công việc<br>- Bấm vào 1 thanh dự án trên lịch để nhảy sang chi tiết đơn ở Màn 2 |

*Thông tin khách hàng (tên, SĐT, người giới thiệu) được tạo/nhập trực tiếp trong Màn 2 khi tạo đơn, không cần màn hình quản lý khách riêng ở vòng đầu.*

## 4. Dữ liệu cần lưu

Thứ phải **còn lại** sau khi tắt trình duyệt:

| Lưu hồ sơ của | Mỗi hồ sơ gồm những mục | Nối với nhau thế nào | Chỗ tôi tự suy — cần bạn xác nhận |
|---|---|---|---|
| **Thiết bị** `thiet_bi` | mã/tên thiết bị · phân loại (sở hữu / thuê lại) · nhà cung cấp (nếu thuê lại) · giá vốn (nếu thuê lại) · mô tả · ảnh · trạng thái (sẵn sàng / đang thuê / bảo trì) | một thiết bị xuất hiện trong nhiều đơn thuê, có nhiều mốc lịch sử giá và nhiều lần kiểm tra | — |
| **Lịch sử giá thuê** `lich_su_gia` | thiết bị nào · giá thuê/ngày · ngày bắt đầu áp dụng | một thiết bị có nhiều mốc giá theo thời gian | Đổi giá tạo dòng mới, không ghi đè giá cũ — đã xác nhận |
| **Khách hàng** `khach_hang` | tên khách · số điện thoại · người giới thiệu (không bắt buộc) | một khách hàng có nhiều đơn thuê | — |
| **Đơn thuê** `don_thue` | mã đơn · khách hàng nào · chặng hiện tại (yêu cầu / báo giá / đã giao / chờ trả / xong / huỷ) · ngày tạo đơn · ghi chú chung | một đơn thuê có nhiều thiết bị, nhiều khoản thanh toán, nhiều chi phí phát sinh | — |
| **Dòng thiết bị trong đơn** `don_thue_chi_tiet` | đơn nào · thiết bị nào · ngày bắt đầu thuê · ngày trả dự kiến · giá thuê chốt tại đơn · % chiết khấu áp dụng | mỗi dòng gắn với đúng một đơn và một thiết bị cụ thể | Giá trên đơn chốt lúc báo giá, không đổi khi danh mục đổi giá — đã xác nhận |
| **Thanh toán** `thanh_toan` | đơn nào · số tiền · ngày thu · hình thức (tiền mặt / chuyển khoản) · loại (cọc / thanh toán đợt / tất toán / hoàn cọc) | một đơn có nhiều lần giao dịch thanh toán | — |
| **Chi phí phát sinh** `chi_phi` | đơn nào · loại (vận chuyển / bồi thường hư hại / phụ phí) · mô tả · số tiền | một đơn có nhiều khoản chi phí phát sinh | — |
| **Kiểm tra tình trạng** `kiem_tra_tinh_trang` | thiết bị nào · thuộc đơn nào · ngày trả · tình trạng (bình thường / trầy xước / hỏng hóc) · người kiểm | mỗi lần khách trả thiết bị tạo một biên bản kiểm tra gắn với đơn đó | — |

**Không lưu riêng** (app tự tính mỗi khi mở): Tổng tiền đơn, Công nợ còn lại, Tồn kho tức thời, Lợi nhuận lũy kế của thiết bị.

## 5. Xong khi nào

- Tạo đơn mới, chọn thiết bị & ngày → giá thuê tự lấy đúng giá đang áp dụng của thiết bị, app tự tính tổng tiền đơn.
- Chọn thiết bị đã bị trùng lịch với đơn đã chốt khác → app báo đỏ "Thiết bị không còn trống trong khoảng ngày này" và chặn không cho thêm.
- Ghi nhận thanh toán / đặt cọc → công nợ còn lại tự giảm ngay lập tức.
- Xóa bớt hoặc thêm thiết bị trong đơn → tổng tiền và công nợ tự động cập nhật lại chính xác.
- Mở Màn 1 (Tổng quan) → thấy ngay danh sách đơn trong ngày và bảng tồn kho thiết bị khả dụng.
- Mở Màn 4 (Calendar) → thấy lưới lịch tháng với các thanh dự án hiển thị đúng màu theo trạng thái; bấm vào thanh dự án nhảy sang Màn 2.
- Trả đồ & kiểm tra tình trạng: Ghi nhận đủ tình trạng cho mọi thiết bị trong đơn → nút "Chốt công nợ" sáng lên cho phép chuyển đơn sang chặng "Xong".
- Sau khi chốt đơn xong → Màn 3 (Thiết bị) cập nhật doanh thu và lịch sử kiểm tra mới nhất của từng thiết bị.

## Đã cân nhắc và hoãn

| Tính năng | Vì sao hoãn |
|---|---|
| Cổng khách hàng tự đặt thuê online | Là luồng công khai riêng — để sau khi luồng quản trị nội bộ chạy mượt mà |
| Đồng bộ tự động 2 chiều Google Calendar | Giai đoạn đầu dùng Calendar tích hợp sẵn trong Màn 4 |
| Công thức chiết khấu tự động theo số ngày thuê | Hiện tại thỏa thuận chiết khấu thủ công từng đơn |
| Phân quyền tài khoản đăng nhập phức tạp | Vòng đầu chia quyền theo giao diện: Kho chỉ xem Màn 3 & 4, thao tác Màn 1 & 2 |
