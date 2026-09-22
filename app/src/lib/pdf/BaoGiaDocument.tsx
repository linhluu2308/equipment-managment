import { Document, Font, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

Font.register({
  family: "BeVietnamPro",
  fonts: [
    { src: "/fonts/BeVietnamPro-Regular.ttf", fontWeight: "normal" },
    { src: "/fonts/BeVietnamPro-Bold.ttf", fontWeight: "bold" },
  ],
});

export const DON_VI = {
  ten: "CINEB PRODUCTION",
  mst: "0402190079",
  diaChi: "22 Giang Văn Minh, Hoà Cường, Đà Nẵng",
  lienHe: "0905.207.491 (Bảo) · 0839.413.823 (Linh) — Production · Equipment Rental",
  email: "Cinebproduction@gmail.com",
  logoUrl: "/cineb-logo.png" as string | null,
};

const VAT_PHAN_TRAM = 8;

const DIEU_KHOAN: { tieuDe: string; dong: string[] }[] = [
  {
    tieuDe: "Điều khoản về giờ làm cho nhân sự",
    dong: [
      "Báo giá chưa bao gồm:",
      "- Chi phí lưu trú, ăn ở, di chuyển ngoài Thành phố Đà Nẵng cho nhân viên kỹ thuật và tài xế xe tải.",
      "- Các loại phí cầu đường, phí đậu bến bãi… của phương tiện xe vận chuyển thiết bị.",
      "- Chi phí lương ngày di chuyển của nhân sự khi khách hàng ghi hình ở ngoài phạm vi Thành phố Đà Nẵng hoặc ở các khu vực có thời gian di chuyển từ công ty/khách sạn đến địa điểm quay từ 3 tiếng/1 lượt di chuyển thì công ty sẽ tính thêm 1/2 ngày lương cho nhân sự.",
      "Quay ngày: 15 tiếng — tính từ lúc có mặt theo yêu cầu của Đoàn sản xuất cho đến khi hoàn tất việc quay phim (khi Đoàn sản xuất xác nhận hoàn thành).",
      "Quay đêm: 12 tiếng — tính từ lúc có mặt theo yêu cầu của Đoàn sản xuất (sau 12 giờ trưa) đến khi hoàn tất việc ghi hình (khi Đoàn sản xuất xác nhận hoàn thành).",
      "Thời gian làm việc tiếp theo được tính như sau:",
      "Quay ban ngày:",
      "  • Sau 15 - 18 giờ: cộng thêm 0,5 ngày công cho toàn bộ ekip",
      "  • Sau 18 - 21 giờ: cộng thêm 1,0 ngày công cho toàn bộ ekip",
      "  • Sau 21 - 24 giờ: cộng thêm 1,5 ngày công cho toàn bộ ekip",
      "Quay ban đêm:",
      "  • Sau 12 - 15 giờ: cộng thêm 0,5 ngày công cho toàn bộ ekip",
      "  • Sau 15 - 18 giờ: cộng thêm 1,0 ngày công cho toàn bộ ekip",
      "Đối với xe 16 chỗ và xe tải (nếu có): sau 15 giờ, cứ mỗi 1 giờ tăng thêm tài xế sẽ được tính thêm 150.000 đồng.",
    ],
  },
  {
    tieuDe: "Điều khoản thanh toán và lưu ý khác",
    dong: [
      "Quý khách vui lòng đặt cọc 50% giá trị gói dịch vụ trước ngày làm việc ít nhất 02 ngày và hoàn tất thanh toán ngay sau khi hoàn trả thiết bị.",
      "",
      "* Lưu ý:",
      "- Vui lòng kiểm tra kỹ thông tin thiết bị và dịch vụ trong báo giá.",
      "- Khách hàng tự trang bị ổ cứng lưu trữ dữ liệu.",
      "- CineB được quyền từ chối không cho sử dụng thiết bị đối với những trường hợp không an toàn cho thiết bị như: tia laser, di chuyển trên sông nước, cháy, nổ, khói lửa… và những trường hợp khác.",
    ],
  },
];

const LOI_CAM_ON =
  "Cảm ơn Quý khách đã tin tưởng và lựa chọn dịch vụ của chúng tôi. Chúng tôi rất trân trọng cơ hội được đồng hành cùng dự án của Quý khách và hy vọng sẽ sớm được hợp tác!";

const s = StyleSheet.create({
  page: { fontFamily: "BeVietnamPro", fontSize: 9.5, padding: 32, color: "#0f172a", lineHeight: 1.4 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 },
  logo: { width: 100, height: 32, objectFit: "contain", marginBottom: 4 },
  donViKhoi: { flexGrow: 1 },
  donViTen: { fontSize: 13, fontWeight: "bold", marginBottom: 2 },
  donViDong: { fontSize: 8, color: "#475569" },
  tieuDe: { fontSize: 16, fontWeight: "bold", textAlign: "center", marginBottom: 2, letterSpacing: 1 },
  tieuDeSub: { fontSize: 8.5, color: "#64748b", textAlign: "center", marginBottom: 14 },
  thongTinKhoi: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10, gap: 16 },
  thongTinCot: { flexGrow: 1 },
  nhan: { fontSize: 7.5, color: "#64748b", textTransform: "uppercase", marginBottom: 1 },
  giaTri: { fontSize: 9.5, fontWeight: "bold", marginBottom: 5 },
  table: { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 4, marginBottom: 10 },
  trHead: { flexDirection: "row", backgroundColor: "#f1f5f9", borderBottomWidth: 1, borderBottomColor: "#e2e8f0" },
  tr: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e2e8f0" },
  th: { padding: 5, fontSize: 8, fontWeight: "bold", textTransform: "uppercase", color: "#475569" },
  td: { padding: 5, fontSize: 9 },
  colThietBi: { width: "38%" },
  colDonGia: { width: "17%", textAlign: "right" },
  colSoNgay: { width: "12%", textAlign: "center" },
  colChietKhau: { width: "13%", textAlign: "center" },
  colThanhTien: { width: "20%", textAlign: "right" },
  tongKhoi: { alignItems: "flex-end", marginBottom: 16 },
  tongDong: { flexDirection: "row", width: 220, justifyContent: "space-between", marginBottom: 2 },
  tongNhan: { fontSize: 9, color: "#475569" },
  tongGiaTri: { fontSize: 9 },
  tongCongDong: {
    flexDirection: "row",
    width: 220,
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#0f172a",
    paddingTop: 3,
    marginTop: 2,
  },
  tongCongNhan: { fontSize: 10, fontWeight: "bold" },
  tongCongGiaTri: { fontSize: 10, fontWeight: "bold" },
  dieuKhoanTieuDe: { fontSize: 10, fontWeight: "bold", marginTop: 10, marginBottom: 4 },
  dieuKhoanDong: { fontSize: 8.5, marginBottom: 1.5, color: "#1e293b" },
  camOn: { fontSize: 9, marginTop: 14, marginBottom: 20, color: "#1e293b" },
  kyKhoi: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  kyCot: { width: "40%", textAlign: "center" },
  kyNhan: { fontSize: 9, fontWeight: "bold", marginBottom: 40 },
  kySub: { fontSize: 7.5, color: "#94a3b8" },
});

function tienVnd(n: number): string {
  return `${Math.round(n).toLocaleString("vi-VN")}đ`;
}

export interface DongThietBiBaoGia {
  ten: string;
  ma: string | null;
  donGia: number;
  chietKhauPhanTram: number;
  thanhTien: number;
}

export interface BaoGiaProps {
  maDon: string;
  ngayLap: string;
  tenKhach: string;
  sdtKhach: string;
  ngayBatDau: string;
  ngayTraDuKien: string;
  soNgay: number;
  dong: DongThietBiBaoGia[];
}

export default function BaoGiaDocument({
  maDon,
  ngayLap,
  tenKhach,
  sdtKhach,
  ngayBatDau,
  ngayTraDuKien,
  soNgay,
  dong,
}: BaoGiaProps) {
  const tienThietBi = dong.reduce((sum, d) => sum + d.thanhTien, 0);
  const tienVat = (tienThietBi * VAT_PHAN_TRAM) / 100;
  const tongCong = tienThietBi + tienVat;

  return (
    <Document title={`Bao gia ${maDon}`}>
      <Page size="A4" style={s.page} wrap>
        <View style={s.headerRow}>
          {DON_VI.logoUrl && <Image src={DON_VI.logoUrl} style={s.logo} />}
          <View style={s.donViKhoi}>
            <Text style={s.donViTen}>{DON_VI.ten}</Text>
            <Text style={s.donViDong}>MST: {DON_VI.mst}</Text>
            <Text style={s.donViDong}>{DON_VI.diaChi}</Text>
            <Text style={s.donViDong}>{DON_VI.lienHe}</Text>
            <Text style={s.donViDong}>{DON_VI.email}</Text>
          </View>
        </View>

        <Text style={s.tieuDe}>BÁO GIÁ THUÊ THIẾT BỊ</Text>
        <Text style={s.tieuDeSub}>
          Số: {maDon} · Ngày lập: {ngayLap}
        </Text>

        <View style={s.thongTinKhoi}>
          <View style={s.thongTinCot}>
            <Text style={s.nhan}>Khách hàng</Text>
            <Text style={s.giaTri}>{tenKhach}</Text>
            <Text style={s.nhan}>Số điện thoại</Text>
            <Text style={s.giaTri}>{sdtKhach || "—"}</Text>
          </View>
          <View style={s.thongTinCot}>
            <Text style={s.nhan}>Dải ngày thuê</Text>
            <Text style={s.giaTri}>
              {ngayBatDau} → {ngayTraDuKien}
            </Text>
            <Text style={s.nhan}>Số ngày thuê</Text>
            <Text style={s.giaTri}>{soNgay} ngày</Text>
          </View>
        </View>

        <View style={s.table}>
          <View style={s.trHead}>
            <Text style={[s.th, s.colThietBi]}>Thiết bị</Text>
            <Text style={[s.th, s.colDonGia]}>Đơn giá/ngày</Text>
            <Text style={[s.th, s.colSoNgay]}>Số ngày</Text>
            <Text style={[s.th, s.colChietKhau]}>Chiết khấu</Text>
            <Text style={[s.th, s.colThanhTien]}>Thành tiền</Text>
          </View>
          {dong.map((d, i) => (
            <View style={s.tr} key={i}>
              <Text style={[s.td, s.colThietBi]}>
                {d.ten}
                {d.ma ? ` (${d.ma})` : ""}
              </Text>
              <Text style={[s.td, s.colDonGia]}>{tienVnd(d.donGia)}</Text>
              <Text style={[s.td, s.colSoNgay]}>{soNgay}</Text>
              <Text style={[s.td, s.colChietKhau]}>{d.chietKhauPhanTram > 0 ? `${d.chietKhauPhanTram}%` : "—"}</Text>
              <Text style={[s.td, s.colThanhTien]}>{tienVnd(d.thanhTien)}</Text>
            </View>
          ))}
        </View>

        <View style={s.tongKhoi}>
          <View style={s.tongDong}>
            <Text style={s.tongNhan}>Tổng tiền thiết bị (chưa VAT)</Text>
            <Text style={s.tongGiaTri}>{tienVnd(tienThietBi)}</Text>
          </View>
          <View style={s.tongDong}>
            <Text style={s.tongNhan}>VAT ({VAT_PHAN_TRAM}%)</Text>
            <Text style={s.tongGiaTri}>{tienVnd(tienVat)}</Text>
          </View>
          <View style={s.tongCongDong}>
            <Text style={s.tongCongNhan}>Tổng cộng</Text>
            <Text style={s.tongCongGiaTri}>{tienVnd(tongCong)}</Text>
          </View>
        </View>

        {DIEU_KHOAN.map((khoi, i) => (
          <View key={i} wrap={false}>
            <Text style={s.dieuKhoanTieuDe}>{khoi.tieuDe}</Text>
            {khoi.dong.map((dong, j) =>
              dong ? (
                <Text style={s.dieuKhoanDong} key={j}>
                  {dong}
                </Text>
              ) : (
                <Text key={j} style={{ fontSize: 3 }}> </Text>
              )
            )}
          </View>
        ))}

        <Text style={s.camOn}>{LOI_CAM_ON}</Text>

        <View style={s.kyKhoi}>
          <View style={s.kyCot}>
            <Text style={s.kyNhan}>Đại diện {DON_VI.ten}</Text>
            <Text style={s.kySub}>(Ký, ghi rõ họ tên)</Text>
          </View>
          <View style={s.kyCot}>
            <Text style={s.kyNhan}>Khách hàng xác nhận</Text>
            <Text style={s.kySub}>(Ký, ghi rõ họ tên)</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
