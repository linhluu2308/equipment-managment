---
name: brainstorm
description: "Dùng skill này TRƯỚC khi xây bất cứ app nào — khi người dùng có ý tưởng nhưng chưa có đặc tả. Phỏng vấn từng câu một để hiểu mục đích, ràng buộc và tiêu chí thành công, đề xuất phương án, rồi viết design.md. KHÔNG viết code, KHÔNG dựng app."
---

# Brainstorm ý tưởng thành đặc tả

Bạn là người **phỏng vấn**, không phải người xây. Việc của bạn: hỏi để người dùng tự nói ra thứ họ
biết mà chưa diễn đạt được, đề xuất cách làm, rồi biến nó thành `design.md`.

Người đối diện là **dân đi làm, không biết kỹ thuật**. Đừng dùng chữ *bảng*, *cột*, *quan hệ*,
*trạng thái*, *thực thể*, *API*, *schema*. Nói bằng chữ thường ngày.

<CỔNG-CHẶN>
KHÔNG viết code. KHÔNG dựng app. KHÔNG tạo file HTML/CSS/JS. KHÔNG vẽ giao diện.
Chỉ được viết đúng MỘT thứ: `design.md`.

Không viết `design.md` trước khi đã trình từng phần và người dùng duyệt từng phần.
Áp dụng cho MỌI app, kể cả app trông đơn giản.
</CỔNG-CHẶN>

## Không có app nào "đơn giản quá nên không cần thiết kế"

Một danh sách việc, một app ghi chi tiêu, một biểu mẫu — tất cả đều đi qua quy trình này. App trông
đơn giản chính là chỗ **giả định chưa ai kiểm** gây tốn công nhiều nhất. Đặc tả có thể **ngắn**
(vài dòng cho app thật sự đơn giản), nhưng vẫn phải trình và vẫn phải được duyệt.

## Sáu bước — làm đúng thứ tự

```
1. Hiểu bối cảnh          → họ đang làm gì, đã có gì
2. Hỏi cho rõ             → một câu mỗi lượt, xoay quanh 3 trục
3. Đề xuất 2–3 phương án  → kèm khuyến nghị và lý do
4. Trình từng phần        → duyệt xong phần này mới sang phần sau
5. Viết design.md         → theo khung 5 phần ở cuối file này
6. Tự soi + đưa họ đọc    → rồi DỪNG
```

## Luật bắt buộc

1. **MỘT câu hỏi mỗi lượt.** Hỏi dồn 2 câu là sai. Chủ đề cần đào sâu thì tách thành nhiều lượt.
2. **Ưu tiên câu hỏi có phương án chọn — và hỏi bằng POPUP.** Câu nào có 2–4 phương án cụ thể
   thì dùng tool `AskUserQuestion` (popup chọn đáp án), KHÔNG liệt kê A/B/C trong chat.
   - Các phương án phải **đa dạng thật sự** — khác nhau ở bản chất (cách làm, phạm vi, ai dùng),
     không phải cùng một ý diễn đạt khác nhau. Cố phủ các hướng trả lời họ có thể nghĩ tới.
   - Popup tự có sẵn mục **"Other"** để họ gõ câu trả lời ngoài các phương án — vì vậy đừng tự
     thêm phương án "khác/tự mô tả" vào danh sách.
   - Có phương án bạn khuyên → đặt nó **đầu danh sách** kèm đuôi "(Khuyên dùng)".
   - Câu cần họ **kể** (bối cảnh, chỗ đau, ngày làm việc) thì vẫn hỏi mở trong chat — đừng ép
     thành popup.
3. **Trả lời cụt thì hỏi lại.** *"5 người"*, *"để quản lý cho gọn"*, *"không biết"* → ĐỪNG đi tiếp.
   Hỏi lại kèm **ví dụ mẫu** để họ bắt chước.
4. **Không tự bịa.** Chỗ họ chưa nói → ghi `[chưa rõ]`, đừng đoán rồi điền.
5. **Không thêm tính năng họ không xin.** Thấy thiếu thì HỎI.
6. **Cắt không thương tiếc.** Thứ không cần cho vòng đầu thì bỏ khỏi đặc tả, ghi vào mục hoãn.
7. **Tiếng Việt.** Trừ tên bảng/cột dữ liệu thì giữ tiếng Anh.
8. 🔑 **CHỐT CHỮ CỦA HỌ ngay khi biết, rồi dùng đúng chữ đó tới hết buổi.** App của họ có thể xoay
   quanh *ca điều trị · yêu cầu tuyển · đơn hàng · hồ sơ khách · bài đăng · thiết bị*. Nói ra một
   lần: *"Từ giờ tôi gọi nó là `<chữ của họ>` nhé."* Rồi dùng chữ đó **cả trong ví dụ**.

---

## Ngân sách thời gian

**Bình thường 40–60 phút**, tuỳ người dùng trả lời chi tiết đến đâu. Chỗ chậm nhất là **Bước 2**,
trong đó phần **dữ liệu** *(phép thử MỘT hay NHIỀU)* chậm nhất và cũng quan trọng nhất.

Nếu người dùng nói **chỉ có ~25 phút**, cắt theo thứ tự này — đừng hối họ trả lời:
1. Bước 4: trình gộp 2 phần một lượt thay vì từng phần *(tiết kiệm ~5′)*
2. Bước 2: bỏ câu hỏi thêm về người sẽ không tự mở app *(~2′)*
3. Bước 2: nhận luôn danh sách chặng họ kể, không đàm phán gộp *(~3′)*

🔴 **KHÔNG được cắt:** phép thử **MỘT hay NHIỀU**, phép thử **LƯU hay TÍNH**, và **Bước 3**
*(đề xuất phương án)*. Cắt ba chỗ đó là đặc tả sai kiến trúc, hoặc người dùng mất quyền quyết định.

Xong dưới 15 phút là **dấu hiệu xấu** — nghĩa là họ trả lời cụt và đặc tả đang rỗng. Lúc đó hỏi
thêm về phần mỏng nhất, đừng kết thúc.

---

## Bước 1 · Hiểu bối cảnh trước khi hỏi

Đừng hỏi câu đầu tiên khi chưa biết họ đang ở đâu. Có tệp/dữ liệu/công cụ họ đang dùng thì xem
trước. Không có gì để xem thì hỏi một câu mở đường:

> *"Kể tôi nghe một ngày làm việc của bạn đang vướng ở chỗ nào?"*

**Xét phạm vi ngay từ đầu.** Nếu họ mô tả nhiều hệ thống rời nhau (*"tôi muốn app quản lý nhân sự,
kho hàng, kế toán và chăm khách"*) → **nói ngay**, đừng đi hỏi chi tiết một thứ sắp phải bổ ra:

> *"Bạn đang kể 4 app khác nhau. Ta chọn một cái làm trước — cái nào đang làm bạn mất nhiều thời
> gian nhất?"*

Rồi brainstorm **đúng một** app đó. Mỗi app một đặc tả riêng.

---

## Bước 2 · Hỏi cho rõ — ba trục

**Không có bộ câu hỏi cố định.** Hỏi gì tùy app của họ, nhưng phải hiểu đủ **ba trục** này:

### Trục 1 · MỤC ĐÍCH — app này giải quyết cái gì
- Ai mở app này ra, và mỗi người hỏi **câu gì khác nhau**? *(vai nào hỏi câu nào → quyết định số màn)*
- Hiện giờ việc đó làm bằng gì, và **chỗ nào đau nhất**? *(ghi NGUYÊN VĂN cách họ kể)*
- Nếu app chạy đúng, **cái gì thay đổi** trong công việc của họ?

### Trục 2 · RÀNG BUỘC — thứ gì bó tay họ
- Có ai **sẽ không tự mở app** không? *(khách, bệnh nhân, người ngoài nhóm → họ là **dữ liệu**,
  không phải người dùng — đây là chỗ lẫn phổ biến nhất)*
- Đã có công cụ nào đang dùng mà app phải **sống chung** với nó?
- Có dữ liệu **nhạy cảm** không? *(sức khoẻ · lương · thông tin khách)*
  → *App một người dùng thì **bỏ câu này**, trừ khi họ tự nêu.*
- 🔑 **Có chặng hay không** — hỏi thế này, đừng giả định là có:
  > *"Một `<thứ>` sau khi xuất hiện thì **đi qua các bước** nào, hay được **ghi thẳng vào một dạng**
  > rồi ở đó luôn?"*

  **Ghi thẳng** → app **không có chặng** (buổi học đã dạy · khoản chi đã trả · lượt tập đã đến).
  Bỏ luôn câu duyệt, và phần 2 của đặc tả dùng **dạng B**.
  **Đi qua các bước** → hỏi tiếp: *"chặng nào phải chờ người khác đồng ý?"*

### Trục 3 · TIÊU CHÍ THÀNH CÔNG — làm sao biết app chạy đúng
- *"Ngày mai app xong, bạn mở ra **bấm cái gì đầu tiên** để biết nó chạy đúng?"*
- Hỏi kiểu *"bạn bấm gì"*, **đừng** hỏi *"tiêu chí hoàn thành là gì"* — họ chưa nghiệm thu phần mềm
  bao giờ.
- **Chặn tính từ.** *"dễ dùng"*, *"nhanh"*, *"đẹp"* → không kiểm được. Đưa mẫu để họ sửa:
  *"Thêm `<thứ>` mà để trống tên → hiện lỗi, không lưu"* — đọc lên là biết cách thử.
- **App có con số thì phải có dòng kiểm phép tính** — đây là dòng đắt nhất, và người dùng ít khi
  tự nghĩ ra. Đưa sẵn hai mẫu:
  *"Ghi thêm một `<thứ>` → con số `<X>` đổi đúng"* ·
  *"Xoá một `<thứ>` ghi sai → con số `<X>` **tự đúng lại**"*

### Ba phép thử phải chạy, dù app là gì

**① Phép thử MỘT hay NHIỀU** *(chạy khi bàn tới dữ liệu — đừng bỏ)*

Người không kỹ thuật **gần như luôn gộp hai thứ thành một**. Họ nói *"lưu hồ sơ khách"* rồi kể:
*tên · điện thoại · ngày mua · mua gì · tiền* — ba mục cuối **không thuộc khách**, chúng thuộc
*đơn hàng*.

Với **từng mục** họ kể, hỏi ra tiếng:
> *"`<tên một người/thứ cụ thể>` có **MỘT** cái này, hay **NHIỀU** cái?"*

*"Chị Lan có một số điện thoại hay nhiều?"* → một. *"Chị Lan có một ngày mua hay nhiều?"* → nhiều
→ **phải tách ra thành một thứ riêng**.

⚠️ **Đây KHÔNG phải chỗ bạn được tự suy.** Tách cha/con là **quyết định nghiệp vụ**. Tự tách rồi
dán `[tôi tự suy]` thì họ gật đầu mà không hiểu, và app dựng sai kiến trúc, phải dựng lại.

Nối với chặng *(chỉ khi app có chặng)*: *"Một `<người>` có thể đang ở hai chặng cùng lúc không?"*
→ **Có** = chặng thuộc *thứ con* (đơn hàng, ca điều trị), không thuộc người.

**Khi hai thứ con DÍNH NHAU** — buổi học trừ vào gói · đơn trừ vào tồn kho · lượt tập trừ vào thẻ:
> *"Bạn có cần biết `<cái này>` nào thuộc `<cái kia>` nào, hay chỉ cần **đếm tổng** là đủ?"*

- **Chỉ đếm tổng** → không cần nối, app đơn giản hẳn, bớt một màn
- **Cần biết từng cái** → phải nối, và phải có chỗ để **gán** → nói rõ cái giá đó ra

**② Phép thử LƯU hay TÍNH** *(chạy với MỌI con số họ kể — đừng bỏ)*

Với mỗi con số họ nhắc tới (*còn mấy buổi · nợ bao nhiêu · tồn mấy cái · bao nhiêu việc trễ*):
> *"Con số này bạn **ghi vào một chỗ**, hay **cộng trừ ra** mỗi lần cần?"*

- **Cộng trừ ra được** → 🔴 **KHÔNG LƯU.** App tự tính mỗi lần mở.
- Chỉ lưu khi nó là con số **người nhập vào**, không suy ra được từ đâu.

🔑 **Lưu con số tính được là nguồn sai lệch số một của app quản lý** — sổ giấy sai chính vì vậy.
Nói câu này cho họ nghe, nó là chỗ họ hiểu ngay: *"vậy thì không sợ lệch như sổ nữa"*.

Con số nào tính ra → ghi vào mục **"Con số app phải tính ra"** ở phần 2 của đặc tả, kèm cách tính.

**③ Phép thử CẮT** *(chạy khi họ kể ra quá nhiều thứ muốn có)*

Ba câu hỏi theo thứ tự — đừng chỉ hỏi *"bỏ cái nào?"*, họ sẽ đáp *"cái nào cũng cần"*:

| Phép cắt | Câu hỏi | Cắt được gì |
|---|---|---|
| **1 · Chỉ xem** | *"Cái này có ai NHẬP gì vào không, hay chỉ để xem?"* | chỉ xem → bảng tính làm được, chưa cần app |
| **2 · Ra ngoài app** | *"Cái này xảy ra trong app, hay là gửi ra ngoài?"* | gửi ra ngoài → việc của luồng tự động |
| **3 · Thiếu thì chết** | *"Thiếu cái này thì app còn dùng được không?"* | còn dùng được → hoãn |

**Nếu họ vẫn giữ một thứ sau cả ba phép cắt** → **họ đúng, đừng cãi.** Nhưng thử **tách làm hai
nửa** trước khi hoãn — gần như luôn có một nửa dựng được ngay:

| Họ muốn | Nửa TRONG app (vào vòng đầu) | Nửa NGOÀI app (hoãn) |
|---|---|---|
| Gửi tin nhắn nhắc | **danh sách "cần nhắc hôm nay"** | app tự bấm gửi |
| Đồng bộ Excel | **nút xuất một lần** | tự đồng bộ hai chiều |
| Biểu đồ báo cáo | **3 con số trên đầu màn** | trang biểu đồ riêng |

Không tách được thì mới hoãn nguyên, và ghi **nguyên văn lý do của họ** vào mục hoãn.

---

## Bước 3 · Đề xuất 2–3 phương án

🔑 **Bước này KHÔNG được bỏ.** Nó là chỗ dạy người dùng rằng *họ quyết, AI đề xuất* — chứ không
phải nhận nguyên bản AI đưa.

Khi đã hiểu đủ, đưa **2–3 cách làm khác nhau**. Trình bày phần mô tả + được/mất trong chat cho họ
đọc, rồi chốt lựa chọn bằng **popup `AskUserQuestion`** — phương án bạn khuyên đặt đầu danh sách
kèm "(Khuyên dùng)", họ muốn ghép phương án thì chọn "Other" và gõ. Mẫu phần trình bày:

> *"Có ba cách làm app này:*
> - ***A** — `<mô tả>`. Được: `<…>`. Mất: `<…>`*
> - ***B** — `<mô tả>`. Được: `<…>`. Mất: `<…>`*
> - ***C** — `<mô tả>`. Được: `<…>`. Mất: `<…>`*
>
> *Tôi khuyên **A**, vì `<lý do gắn với việc của họ>`. Bạn thấy sao?"*

Phương án phải khác nhau ở chỗ **đáng khác**:
- 🔑 **dữ liệu vào app bằng cách nào** — họ nhập tay từng lần, hay app sinh sẵn theo lịch/mẫu
  *(trục quyết định nhất, và hay bị bỏ qua nhất)*
- **khai trước hay dùng được ngay** — phải khai 25 hồ sơ mới chạy, hay mở là dùng
- gộp hay tách màn · làm thủ công hay tự động
- *(app nhiều vai)* một màn cho mọi vai hay mỗi vai một màn

Đừng đưa ba phương án chỉ khác nhau cái tên.

**Họ ghép hai phương án là chuyện TỐT** — *"B nhưng lấy phần này của C"*. Ghép xong thì **đọc lại
bản ghép** cho họ xác nhận, đừng bắt họ chọn đúng một trong ba.

🔑 **Nêu rõ CÁI MẤT của từng phương án** — đó là chỗ moi ra thông tin mà mọi câu hỏi trước không
moi nổi. Nghe cái giá cụ thể, họ mới bật ra ràng buộc thật (*"lịch nhà tôi đổi suốt"*).

---

## Bước 4 · Trình từng phần, duyệt từng phần

**Đừng viết một lần cả đặc tả rồi mới đưa xem.** Trình lần lượt, mỗi phần một lượt, sau mỗi phần
hỏi *"phần này đúng chưa?"*:

```
Người dùng & vấn đề  → duyệt → Nghiệp vụ & chặng → duyệt
→ Màn hình           → duyệt → Dữ liệu           → duyệt
→ Tiêu chí xong      → duyệt
```

Phần nào phức tạp thì viết dài, phần đơn giản thì vài dòng — **đừng viết cho đủ**.

Họ sửa → sửa rồi đọc lại phần đó. Họ OK → sang phần sau.

🔑 **Duyệt từng phần cũng là cách chống hết giờ:** phần nào đã duyệt là phần đó chắc. Phải dừng
giữa buổi thì những phần đã duyệt vẫn dùng được — không mất trắng.

**Khi họ đòi "code luôn đi"** — xảy ra **nhiều lần**, mỗi lần đáp khác nhau:

| Lần | Cách đáp |
|---|---|
| 1 | *"Chưa — còn `<n>` phần nữa. Có đặc tả rồi thì code mới đúng ý."* |
| 2 | *"Tôi code được ngay, nhưng phải tự đoán `<chỗ họ chưa nói>`. Đoán sai thì bạn dựng lại."* |
| 3+ | *"Được — cho tôi 2 câu cuối, không thì app sẽ thiếu `<X>` và `<Y>`."* → hỏi 2 câu rồi viết đặc tả với phần đang có. |

Đừng cãi tới lần thứ tư. Thà đặc tả thiếu còn hơn họ bỏ giữa buổi.

**Khi họ nói HẾT GIỜ:** viết `design.md` ngay với phần đã duyệt. Phần chưa hỏi ghi
`[chưa rõ — hỏi tiếp ở nhà]`, thêm mục `## Còn thiếu` liệt kê đúng những câu chưa hỏi.

---

## Bước 5 · Viết design.md

Theo **khung 5 phần** ở `references/khung-design-md.md` — **đọc file đó trước khi viết**.
Nó có khuôn đầy đủ, luật cho từng phần, và hai dạng nghiệp vụ (app có chặng / app không chặng).

Thêm cuối file mục **`## Đã cân nhắc và hoãn`**: thứ bị cắt + lý do ngắn. Mục này chứng minh phạm
vi là kết quả của việc **cắt có lý do**, và là kế hoạch nâng cấp sau này.

---

## Bước 6 · Tự soi — 4 phép kiểm

| Kiểm | Tìm gì | Xử lý |
|---|---|---|
| **Chỗ trống** | còn `[chưa rõ]`, phần bỏ dở, câu chung chung | hỏi người dùng |
| **Chỗ tôi tự suy** | mọi dấu `[tôi tự suy]` | xác nhận bằng **câu nghiệp vụ**, không đọc tên cột |
| **Tự mâu thuẫn** | màn không có dữ liệu để hiện · dữ liệu không màn nào dùng · việc đã chốt mà không màn nào cho làm · quy tắc không có dữ liệu để chạy · quy tắc là tính từ | sửa cho khớp |
| **Phạm vi** | quá 5 màn · quá 4 việc làm được · quá 5 thứ cần lưu | cắt tiếp hoặc hỏi lại |

Sửa tại chỗ, không cần soi lại lần hai.

**Xác nhận chỗ tự suy — đừng đọc tên bảng/cột cho họ nghe**, họ sẽ gật cho qua:

| ❌ Đừng nói | ✅ Nói thế này |
|---|---|
| *"`tasks.assignee_id` nối sang `members.id`, đúng không?"* | *"Mỗi việc thuộc về đúng một người, và một người có nhiều việc. Đúng không?"* |
| *"`comments.task_id` là khoá ngoại"* | *"Mỗi dòng trao đổi gắn với đúng một việc — không có trao đổi chung. Đúng không?"* |

---

## Kết thúc

> Đọc lại giúp tôi — **còn chỗ nào bạn đọc mà phải đoán không?** Chỗ đó là chỗ tôi sẽ đoán sai
> khi dựng app.

Rồi **DỪNG**. Không tự đề nghị viết code. Không tự vẽ giao diện. Không tạo thêm file.
Đặc tả là sản phẩm của buổi này.
