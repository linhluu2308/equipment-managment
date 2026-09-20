# Khuôn `design.md` — 5 phần

Viết đúng 5 phần này, đúng thứ tự này. Không thêm phần, không đổi tên phần.

Mỗi phần viết **ngắn và cụ thể**. Người thứ hai đọc phải hiểu app làm gì mà không cần hỏi thêm.

---

## Khuôn

```markdown
# design.md — <tên app>

> Một câu: app này giúp <ai> làm được <việc gì> mà hiện nay đang <khó ở đâu>.

## 1. Người dùng

| Vai | Tên/bộ phận | Họ mở app để hỏi điều gì |
|---|---|---|
| <vai 1> | <ai> | <câu hỏi trong đầu họ> |
| <vai 2> | <ai> | <câu hỏi trong đầu họ> |

**Hiện nay việc đang nằm ở:** <công cụ đang dùng>
**Chỗ đau nhất:** <nguyên văn cách người dùng nói>

## 2. Nghiệp vụ

*(Chọn MỘT trong hai dạng dưới — đừng dùng cả hai)*

**Dạng A — app CÓ chặng** *(việc/đơn/yêu cầu đi qua các bước, có thể chờ duyệt)*

Dòng đời một <thứ>:
<chặng 1> → <chặng 2> → <chặng 3> → <chặng 4>

Nhánh rẽ: *(bỏ dở, huỷ, trả lại, không duyệt — ghi rõ ai bấm hay app tự đánh dấu)*
- <chặng X> → **<tên nhánh>** khi <điều kiện>; <ai bấm / app tự>

**Dạng B — app KHÔNG chặng** *(buổi học, khoản chi, lượt tập — ghi vào là xong, không đi đâu)*

Một <thứ> được ghi vào một trong các dạng:
- **<dạng 1>** — <khi nào>
- **<dạng 2>** — <khi nào>

Đổi dạng: <có/không — nếu có thì dạng nào sang dạng nào, ai bấm>

**Con số app phải tính ra** *(không lưu — xem luật phần 4)*
- **<tên con số>** = <cách tính>

**Quy tắc:**
- <quy tắc 1 — ví dụ: chỉ trưởng nhóm được chuyển sang Xong · chỉ trừ gói cho ai đóng theo gói>
- <quy tắc 2 — ví dụ: quá 7 ngày không ai chạm thì hiện đỏ>

## 3. Màn hình

| Màn | Ai xem | Mở ra thấy gì | Làm được gì ở đây |
|---|---|---|---|
| **1 · <tên>** | <ai> | <nội dung> | <hành động> |
| **2 · <tên>** | <ai> | <nội dung> | <hành động> |
| **3 · <tên>** | <ai> | <nội dung> | <hành động> |

## 4. Dữ liệu cần lưu

Thứ phải **còn lại** sau khi tắt trình duyệt:

| Lưu hồ sơ của | Mỗi hồ sơ gồm những mục | Nối với nhau thế nào | Chỗ tôi tự suy — cần bạn xác nhận |
|---|---|---|---|
| **<thứ 1>** `<tên_bảng>` | <mục 1> · <mục 2> · <mục 3> | <một thứ 1 có nhiều thứ 2> | <hoặc để trống nếu họ nói hết> |

*Chữ in mờ `<tên_bảng>` là tên kỹ thuật — Claude tự đặt để buổi sau dựng app. Bạn không cần sửa.*

## 5. Xong khi nào

Mỗi dòng phải là **hành vi + kết quả nhìn thấy được**:

- <làm gì> → <thấy gì>
- <làm gì> → <thấy gì>
- <làm gì> → <thấy gì>

## Đã cân nhắc và hoãn

| Tính năng | Vì sao hoãn |
|---|---|
| <tên> | <lý do ngắn> |
```

---

## Luật cho từng phần

### Phần 1 · Người dùng
App cho **nhóm** thì nên có ≥2 vai, và hai vai đó phải hỏi **hai câu khác nhau** — đó chính là lý do
cần nhiều màn. Nếu mọi vai hỏi cùng một câu thì app chỉ cần một màn.

⚠️ App cho **một người** thì **một vai là đủ — đừng bịa thêm vai thứ hai** cho "đủ khuôn".

Có ai sẽ **không tự mở app** (khách, bệnh nhân, người ngoài nhóm)? → họ là **dữ liệu**, không phải
người dùng. Ghi vào một dòng **Rủi ro** riêng, đừng xếp thành vai.

### Phần 2 · Nghiệp vụ
**Chọn dạng A hay B theo app, đừng ép.** Dấu hiệu chọn dạng B: `<thứ>` ghi vào là xong, không ai
chờ ai, không có bước nào "đang chờ". Ví dụ: buổi học đã dạy · khoản chi đã trả · lượt tập đã đến.

Dạng A: dòng đời là **một đường thẳng có mũi tên**, có nhánh thì ghi rõ nhánh.
Dạng B: **đừng vẽ mũi tên** — các dạng là lựa chọn song song, không phải bước nối tiếp. Vẽ mũi tên
ở đây là bịa ra một cỗ máy trạng thái không ai cần.

⚠️ App **một người** thường là dạng B, và **không có quy tắc duyệt nào** — đừng thêm cho đủ khuôn.

Quy tắc phải là câu **máy làm được**: *"việc quá hạn nổi lên đầu"* được; *"nhóm làm việc hiệu quả
hơn"* không được — đó là mong muốn, không phải quy tắc.

### Phần 3 · Màn hình
**2–3 màn, tối đa 5.** Vì sao: mỗi màn là một lần phải mô tả, phải dựng, phải sửa. Quá 5 màn thì
buổi sau không dựng xong, và thường có 2 màn thật ra là một.

🔑 **Đếm màn theo số CÂU HỎI khác nhau, KHÔNG theo số vai.** Một người vẫn có thể hỏi ba câu khác
nhau ở ba nhịp khác nhau *(mỗi lần làm việc · cuối tháng · khi có người hỏi)* → ba màn là đúng.

🔑 **Mỗi màn phải trả lời câu hỏi của ít nhất MỘT vai ở phần 1.** Màn không khớp vai nào → bỏ.

Cột *"Làm được gì ở đây"* mà để trống → **màn đó chỉ để xem** → xem lại có cần không, hay chỉ là
một khối trên màn khác.

### Phần 4 · Dữ liệu
Viết bằng **chữ của người dùng**, không phải chữ kỹ thuật. Cột đầu là *"thứ"* họ kể ở câu 6, cột
giữa là *"mục"* họ kể. Tên bảng tiếng Anh để trong nháy mờ, đứng sau — nó là ghi chú cho buổi sau,
không phải nội dung họ phải hiểu.

Chỉ ghi thứ **phải còn lại**. Thứ **tính ra được** từ dữ liệu khác thì KHÔNG lưu — ví dụ
*"số việc trễ hạn"* là đếm ra, không cần lưu riêng. Nói câu này cho người dùng biết.

**Cột "Nối với nhau thế nào" viết bằng câu thường**, không viết `foreign key`:
*"một khách hàng có nhiều đơn"* · *"mỗi lần khám thuộc về một bệnh nhân"*.

Mọi chỗ bạn tự suy (tên bảng, cột nối) → ghi vào **cột thứ 4** của bảng, đừng để lẫn vào cột "mục".

⚠️ **Nếu có dữ liệu nhạy cảm** (sức khoẻ · lương · thông tin cá nhân khách · hợp đồng) → thêm một
dòng ghi rõ: **ai được xem, ai không**. Không cần thiết kế phân quyền ở buổi này, nhưng phải ghi ra
để buổi sau không làm lộ.

### Phần 5 · Xong khi nào
Khuôn duy nhất được nhận: **`<hành vi>` → `<kết quả quan sát được>`**

| ✅ Nhận | ❌ Không nhận |
|---|---|
| Thêm việc mà để trống tên → hiện lỗi, không lưu | Giao diện dễ dùng |
| Việc có hạn hôm qua → hiện nhãn đỏ ở đầu danh sách | App chạy nhanh |
| Chuyển sang chặng khác → tải lại trang vẫn ở chặng mới | Nhìn đẹp, gọn gàng |

Phép thử: **đọc lên là biết cách thử ngay** thì nhận; phải hỏi *"thử thế nào?"* thì không nhận.

### Phần cuối · Đã cân nhắc và hoãn
Không phải phụ lục cho đủ. Đây là chỗ chứng minh MVP là kết quả của việc **cắt có lý do** — và là
kế hoạch nâng cấp sau khoá.
