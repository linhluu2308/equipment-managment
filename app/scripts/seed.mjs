// Seed dữ liệu mẫu (thiết bị, khách hàng, đơn thuê...) khớp với docs/prototype/cineb-prototype.html
// Chạy: node scripts/seed.mjs  (đọc URL + secret key từ .env.local)
import { readFileSync } from "fs";

const envText = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const env = Object.fromEntries(
  envText
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const URL_BASE = env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.SUPABASE_SECRET_KEY;
const headers = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};

async function rest(method, table, body, query = "") {
  const res = await fetch(`${URL_BASE}/rest/v1/${table}${query}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${method} ${table} -> ${res.status}: ${text}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

async function upsertThietBi(item) {
  const [tb] = await rest("POST", "thiet_bi", {
    ma: item.ma,
    ten: item.ten,
    danh_muc: item.danh_muc,
    nguon_goc: item.nguon_goc,
    nha_cung_cap: item.nha_cung_cap ?? null,
    gia_von: item.gia_von ?? null,
    trang_thai: item.trang_thai ?? "san_sang",
  });
  await rest("POST", "lich_su_gia", { thiet_bi_id: tb.id, gia_thue: item.gia_thue });
  return tb;
}

console.log("Xoá dữ liệu cũ (nếu có) để seed lại sạch...");
// Xoá theo thứ tự an toàn (con trước cha) - chỉ xoá nếu trống hoàn toàn để tránh động vào dữ liệu thật đã có
const existingOrders = await rest("GET", "don_thue", null, "?select=id&limit=1");
const existingEquip = await rest("GET", "thiet_bi", null, "?select=id&limit=1");
if (existingOrders.length > 0 || existingEquip.length > 0) {
  console.log("⚠️  Database đã có dữ liệu — bỏ qua seed để tránh ghi đè. Xoá thủ công trước nếu muốn seed lại.");
  process.exit(0);
}

console.log("Tạo thiết bị...");
const EQUIPMENT = [
  { ma: "CAM-014", ten: "Sony FX6 Cinema Camera", danh_muc: "Body máy quay", nguon_goc: "so_huu", gia_thue: 1500000 },
  { ma: "CAM-015", ten: "Canon Cinema EOS C70", danh_muc: "Body máy quay", nguon_goc: "so_huu", gia_thue: 1300000 },
  { ma: "CAM-016", ten: "Sony FX3 Cinema Line", danh_muc: "Body máy quay", nguon_goc: "so_huu", gia_thue: 900000 },
  { ma: "CAM-018", ten: "RED Komodo 6K Cinema", danh_muc: "Body máy quay", nguon_goc: "so_huu", gia_thue: 2200000 },
  { ma: "LEN-022", ten: "Sigma 24-70mm f/2.8 Art DG DN", danh_muc: "Ống kính (Lens)", nguon_goc: "so_huu", gia_thue: 400000 },
  { ma: "LEN-023", ten: "Sony FE 70-200mm f/2.8 GM OSS II", danh_muc: "Ống kính (Lens)", nguon_goc: "so_huu", gia_thue: 500000 },
  { ma: "LEN-025", ten: "Canon RF 24-70mm f/2.8L IS USM", danh_muc: "Ống kính (Lens)", nguon_goc: "so_huu", gia_thue: 450000 },
  { ma: "LEN-028", ten: "DZOFilm Vespis Cine Prime 50mm T2.1", danh_muc: "Ống kính (Lens)", nguon_goc: "so_huu", gia_thue: 600000 },
  { ma: "LGT-005", ten: "Aputure LS 600d Pro LED Light", danh_muc: "Đèn & Ánh sáng", nguon_goc: "thue_ngoai", nha_cung_cap: "Ánh Sáng Việt", gia_von: 400000, gia_thue: 700000, trang_thai: "bao_tri" },
  { ma: "LGT-006", ten: "Aputure Amaran 200x Bi-Color", danh_muc: "Đèn & Ánh sáng", nguon_goc: "so_huu", gia_thue: 350000 },
  { ma: "LGT-009", ten: "Nanlite Pavotube II 30C RGB (Set 2)", danh_muc: "Đèn & Ánh sáng", nguon_goc: "so_huu", gia_thue: 500000 },
  { ma: "GRP-011", ten: "Ronin RS3 Pro Gimbal Combo", danh_muc: "Grip & Phụ kiện", nguon_goc: "so_huu", gia_thue: 450000 },
  { ma: "GRP-014", ten: "Chân máy Sachtler Ace XL Fluid Head", danh_muc: "Grip & Phụ kiện", nguon_goc: "so_huu", gia_thue: 300000 },
  { ma: "GRP-018", ten: "Slider Carbon 120cm Motorized", danh_muc: "Grip & Phụ kiện", nguon_goc: "so_huu", gia_thue: 350000 },
];

const tbById = {};
for (const item of EQUIPMENT) {
  const tb = await upsertThietBi(item);
  tbById[item.ma] = tb;
  console.log(`  + ${item.ma} ${item.ten}`);
}

console.log("Tạo khách hàng + đơn thuê...");

async function taoDon({ khach, ngayBatDau, ngayTraDuKien, chang, thietBi, coc, thanhToan, kiemTra, ghiChu }) {
  const [kh] = await rest("POST", "khach_hang", khach);
  const [don] = await rest("POST", "don_thue", {
    khach_hang_id: kh.id,
    ngay_bat_dau: ngayBatDau,
    ngay_tra_du_kien: ngayTraDuKien,
    chang,
    ghi_chu: ghiChu ?? null,
  });
  for (const line of thietBi) {
    await rest("POST", "don_thue_chi_tiet", {
      don_thue_id: don.id,
      thiet_bi_id: tbById[line.ma].id,
      gia_thue_chot: line.gia,
      phan_tram_chiet_khau: line.ck ?? 0,
    });
    if (chang === "da_giao" || chang === "cho_tra" || chang === "xong") {
      await rest("PATCH", "thiet_bi", { trang_thai: chang === "xong" ? "san_sang" : "dang_thue" }, `?id=eq.${tbById[line.ma].id}`);
    }
  }
  if (coc) {
    await rest("POST", "coc_giay_to", { don_thue_id: don.id, ...coc });
  }
  if (thanhToan) {
    for (const tt of thanhToan) {
      await rest("POST", "thanh_toan", { don_thue_id: don.id, ...tt });
    }
  }
  if (kiemTra) {
    for (const kt of kiemTra) {
      await rest("POST", "kiem_tra_tinh_trang", { don_thue_id: don.id, thiet_bi_id: tbById[kt.ma].id, tinh_trang: kt.tinh_trang, nguoi_kiem: kt.nguoi_kiem });
    }
  }
  console.log(`  + Đơn ${khach.ten} (${chang})`);
  return don;
}

await taoDon({
  khach: { ten: "Lê Minh (Vinatuan)", so_dien_thoai: "0901234567" },
  ngayBatDau: "2026-09-01",
  ngayTraDuKien: "2026-09-05",
  chang: "da_giao",
  thietBi: [
    { ma: "CAM-014", gia: 1500000 },
    { ma: "LEN-023", gia: 500000 },
    { ma: "GRP-011", gia: 450000 },
  ],
  coc: { loai_giay_to: "CCCD", so_hieu: "079xxxxxxxxx", trang_thai: "dang_giu" },
  thanhToan: [{ so_tien: 6000000, hinh_thuc: "Chuyển khoản", loai: "coc" }],
});

await taoDon({
  khach: { ten: "Studio Ánh Sáng", so_dien_thoai: "0912345678" },
  ngayBatDau: "2026-08-30",
  ngayTraDuKien: "2026-09-02",
  chang: "xong",
  thietBi: [
    { ma: "LGT-009", gia: 500000 },
    { ma: "GRP-018", gia: 350000 },
  ],
  coc: { loai_giay_to: "CCCD", so_hieu: "036xxxxxxxxx", trang_thai: "da_hoan_tra" },
  thanhToan: [{ so_tien: 2550000, hinh_thuc: "Tiền mặt", loai: "tat_toan" }],
  kiemTra: [
    { ma: "LGT-009", tinh_trang: "tot", nguoi_kiem: "Minh Kho" },
    { ma: "GRP-018", tinh_trang: "tot", nguoi_kiem: "Minh Kho" },
  ],
});

await taoDon({
  khach: { ten: "Trần Hải", so_dien_thoai: "0923456789" },
  ngayBatDau: "2026-09-02",
  ngayTraDuKien: "2026-09-04",
  chang: "bao_gia",
  thietBi: [
    { ma: "CAM-016", gia: 900000 },
    { ma: "LEN-025", gia: 450000, ck: 10 },
  ],
});

await taoDon({
  khach: { ten: "Ngọc Anh Production", so_dien_thoai: "0934567890" },
  ngayBatDau: "2026-09-03",
  ngayTraDuKien: "2026-09-09",
  chang: "da_giao",
  thietBi: [
    { ma: "LEN-022", gia: 400000 },
    { ma: "LGT-006", gia: 350000 },
    { ma: "GRP-014", gia: 300000 },
  ],
  coc: { loai_giay_to: "Bằng lái xe", so_hieu: "B2-123456", trang_thai: "dang_giu" },
  thanhToan: [{ so_tien: 5000000, hinh_thuc: "Chuyển khoản", loai: "coc" }],
});

await taoDon({
  khach: { ten: "Đức Anh Films", so_dien_thoai: "0945678901" },
  ngayBatDau: "2026-09-10",
  ngayTraDuKien: "2026-09-11",
  chang: "yeu_cau",
  thietBi: [{ ma: "CAM-015", gia: 1300000 }],
  ghiChu: "Khách hỏi qua tin nhắn, chờ kho xác nhận availability",
});

await taoDon({
  khach: { ten: "Minh Quân", so_dien_thoai: "0956789012" },
  ngayBatDau: "2026-09-06",
  ngayTraDuKien: "2026-09-07",
  chang: "huy",
  thietBi: [{ ma: "CAM-018", gia: 2200000 }],
  ghiChu: "Khách huỷ vì đổi lịch quay",
});

// Thêm một số lượt thuê "xong" trong quá khứ cho vài thiết bị để có dữ liệu tần suất/lợi nhuận phong phú hơn ở trang Báo cáo
await taoDon({
  khach: { ten: "Lê Minh (Vinatuan)", so_dien_thoai: "0901234567" },
  ngayBatDau: "2026-08-10",
  ngayTraDuKien: "2026-08-13",
  chang: "xong",
  thietBi: [
    { ma: "CAM-016", gia: 900000 },
    { ma: "LEN-025", gia: 450000 },
  ],
  thanhToan: [{ so_tien: 4050000, hinh_thuc: "Chuyển khoản", loai: "tat_toan" }],
  kiemTra: [
    { ma: "CAM-016", tinh_trang: "tot", nguoi_kiem: "Minh Kho" },
    { ma: "LEN-025", tinh_trang: "tot", nguoi_kiem: "Minh Kho" },
  ],
});

await taoDon({
  khach: { ten: "Ngọc Anh Production", so_dien_thoai: "0934567890" },
  ngayBatDau: "2026-08-15",
  ngayTraDuKien: "2026-08-17",
  chang: "xong",
  thietBi: [
    { ma: "LGT-009", gia: 500000 },
    { ma: "GRP-018", gia: 350000 },
  ],
  thanhToan: [{ so_tien: 1700000, hinh_thuc: "Tiền mặt", loai: "tat_toan" }],
  kiemTra: [
    { ma: "LGT-009", tinh_trang: "tot", nguoi_kiem: "Minh Kho" },
    { ma: "GRP-018", tinh_trang: "tot", nguoi_kiem: "Minh Kho" },
  ],
});

console.log("Xong! Đã seed đầy đủ dữ liệu mẫu.");
