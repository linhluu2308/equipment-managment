"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { taiAnhThietBi, xoaAnhThietBi } from "@/lib/actions/anhThietBi";
import { formatNgayGio } from "@/lib/formatDate";
import { LOAI_ANH_LABEL, type AnhThietBiTrongDon, type ChangDon, type LoaiAnhThietBi } from "@/lib/types";
import OrderLyDoModal from "./OrderLyDoModal";

// Giống quy tắc ở server (lib/actions/anhThietBi.ts) — chỉ để ẩn/hiện nút, server vẫn kiểm tra lại.
const CHANG_CHO_PHEP: Record<LoaiAnhThietBi, ChangDon[]> = {
  xuat_kho: ["bao_gia", "da_giao"],
  nhan_ve: ["da_giao", "cho_tra"],
};
const CHANG_CHU_BO_SUNG: ChangDon[] = ["bao_gia", "da_giao", "cho_tra", "xong"];
const LOAI: LoaiAnhThietBi[] = ["xuat_kho", "nhan_ve"];

/** Cạnh dài tối đa sau khi nén — đủ nét để xem vết trầy, ~300–500KB/ảnh. */
const CANH_TOI_DA = 1600;

type DongThietBi = { thiet_bi_id: string; ten: string; ma: string | null };

export default function AnhThietBiSection({
  donId,
  chang,
  daXoa,
  dong,
  anh,
  loi,
}: {
  donId: string;
  chang: ChangDon;
  daXoa: boolean;
  dong: DongThietBi[];
  anh: AnhThietBiTrongDon[];
  loi?: string;
}) {
  const { vai } = useAuth();
  const laChu = vai === "chu";
  const [xem, setXem] = useState<AnhThietBiTrongDon | null>(null);

  const duocTai = (loai: LoaiAnhThietBi) =>
    !daXoa && (laChu ? CHANG_CHU_BO_SUNG.includes(chang) : CHANG_CHO_PHEP[loai].includes(chang));

  return (
    <section className="card">
      <div className="card-title">Ảnh thiết bị (xuất kho / nhận về)</div>
      {loi && <p className="badge badge-danger !inline-block mb-2">{loi}</p>}
      <ul className="divide-y divide-[var(--border-color)]">
        {dong.map((d) => (
          <li key={d.thiet_bi_id} className="py-3">
            <div className="mb-2 text-sm">
              <span className="font-semibold">{d.ten}</span>
              {d.ma && <span className="font-mono text-xs text-[var(--text-muted)]"> · {d.ma}</span>}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {LOAI.map((loai) => (
                <CotAnh
                  key={loai}
                  donId={donId}
                  thietBi={d}
                  loai={loai}
                  anh={anh.filter((a) => a.thiet_bi_id === d.thiet_bi_id && a.loai === loai)}
                  duocTai={duocTai(loai)}
                  onXem={setXem}
                />
              ))}
            </div>
          </li>
        ))}
      </ul>
      {xem && <XemAnh anh={xem} laChu={laChu} tenThietBi={dong.find((d) => d.thiet_bi_id === xem.thiet_bi_id)?.ten} onClose={() => setXem(null)} />}
    </section>
  );
}

function CotAnh({
  donId,
  thietBi,
  loai,
  anh,
  duocTai,
  onXem,
}: {
  donId: string;
  thietBi: DongThietBi;
  loai: LoaiAnhThietBi;
  anh: AnhThietBiTrongDon[];
  duocTai: boolean;
  onXem: (a: AnhThietBiTrongDon) => void;
}) {
  const [moChup, setMoChup] = useState(false);

  return (
    <div className="rounded-lg border border-[var(--border-color)] bg-[#f8fafc] p-2.5">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
          {LOAI_ANH_LABEL[loai]} ({anh.length})
        </span>
        {duocTai && (
          <button type="button" className="btn-secondary !px-2 !py-1 text-xs" onClick={() => setMoChup(true)}>
            📷 Chụp ảnh
          </button>
        )}
      </div>
      {anh.length === 0 ? (
        <p className="text-xs text-[var(--text-muted)]">Chưa có ảnh.</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {anh.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => onXem(a)}
              title={`${a.nguoi_tai} · ${formatNgayGio(a.created_at)}`}
              className="h-16 w-16 overflow-hidden rounded border border-[var(--border-color)] bg-white"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- ảnh riêng tư qua route có kiểm tra đăng nhập, không dùng next/image */}
              <img src={`/anh-thiet-bi/${a.id}`} alt={a.ten_file} loading="lazy" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
      {moChup && <ChupAnhModal donId={donId} thietBi={thietBi} loai={loai} onClose={() => setMoChup(false)} />}
    </div>
  );
}

type AnhNhap = { id: string; blob: Blob; url: string; trangThai: "cho" | "dang_tai" | "loi"; loi?: string };

/** Nén ảnh ở trình duyệt: xoay đúng chiều theo EXIF, thu về ≤1600px, JPEG chất lượng 0.82. */
async function nenAnh(file: File): Promise<Blob> {
  let bmp: ImageBitmap;
  try {
    bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error(`Trình duyệt không đọc được ảnh "${file.name}" (định dạng HEIC?). Thử chụp trực tiếp hoặc dùng ảnh JPG.`);
  }
  const tiLe = Math.min(1, CANH_TOI_DA / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * tiLe);
  canvas.height = Math.round(bmp.height * tiLe);
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  bmp.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Không nén được ảnh."))), "image/jpeg", 0.82)
  );
}

/**
 * Chụp nhiều ảnh, xem lại từng ảnh (Chụp lại / Bỏ) rồi mới bấm Tải lên. Ảnh tải lần
 * lượt từng cái: cái nào lỗi thì ở lại trong danh sách để thử lại, không mất cái khác.
 * Trên điện thoại `capture` mở thẳng camera sau; trên máy tính sẽ là hộp chọn file.
 */
function ChupAnhModal({
  donId,
  thietBi,
  loai,
  onClose,
}: {
  donId: string;
  thietBi: DongThietBi;
  loai: LoaiAnhThietBi;
  onClose: () => void;
}) {
  const router = useRouter();
  const cameraRef = useRef<HTMLInputElement>(null);
  const thuVienRef = useRef<HTMLInputElement>(null);
  const chupLaiId = useRef<string | null>(null);
  const [nhap, setNhap] = useState<AnhNhap[]>([]);
  const [dangXuLy, setDangXuLy] = useState(false);
  const [dangTai, setDangTai] = useState(false);
  const [loi, setLoi] = useState("");

  // Giải phóng bộ nhớ ảnh xem trước khi đóng modal.
  const nhapRef = useRef(nhap);
  useEffect(() => {
    nhapRef.current = nhap;
  }, [nhap]);
  useEffect(() => () => nhapRef.current.forEach((a) => URL.revokeObjectURL(a.url)), []);

  function moCamera(thayAnhId: string | null) {
    chupLaiId.current = thayAnhId;
    cameraRef.current?.click();
  }

  async function nhanFile(files: FileList | null) {
    if (!files || files.length === 0) return;
    setLoi("");
    setDangXuLy(true);
    try {
      const moi: AnhNhap[] = [];
      for (const f of Array.from(files)) {
        const blob = await nenAnh(f);
        moi.push({ id: crypto.randomUUID(), blob, url: URL.createObjectURL(blob), trangThai: "cho" });
      }
      const thay = chupLaiId.current;
      chupLaiId.current = null;
      setNhap((cu) => {
        if (thay && moi.length > 0) {
          const cuAnh = cu.find((a) => a.id === thay);
          if (cuAnh) URL.revokeObjectURL(cuAnh.url);
          return cu.map((a) => (a.id === thay ? moi[0] : a)).concat(moi.slice(1));
        }
        return cu.concat(moi);
      });
    } catch (err) {
      setLoi((err as Error).message);
    } finally {
      setDangXuLy(false);
    }
  }

  function boAnh(id: string) {
    setNhap((cu) => {
      const a = cu.find((x) => x.id === id);
      if (a) URL.revokeObjectURL(a.url);
      return cu.filter((x) => x.id !== id);
    });
  }

  async function taiLen() {
    setLoi("");
    setDangTai(true);
    let conLoi = false;
    for (const a of nhap) {
      setNhap((cu) => cu.map((x) => (x.id === a.id ? { ...x, trangThai: "dang_tai", loi: undefined } : x)));
      const fd = new FormData();
      fd.set("donId", donId);
      fd.set("thietBiId", thietBi.thiet_bi_id);
      fd.set("loai", loai);
      fd.set("file", new File([a.blob], "anh.jpg", { type: "image/jpeg" }));
      let ketQua: { error?: string };
      try {
        ketQua = await taiAnhThietBi(fd);
      } catch {
        ketQua = { error: "Mất kết nối khi tải ảnh — thử lại." };
      }
      if (ketQua.error) {
        conLoi = true;
        setNhap((cu) => cu.map((x) => (x.id === a.id ? { ...x, trangThai: "loi", loi: ketQua.error } : x)));
      } else {
        boAnh(a.id);
      }
    }
    setDangTai(false);
    router.refresh();
    if (!conLoi) onClose();
  }

  function dong() {
    if (dangTai) return;
    if (nhap.length > 0 && !confirm(`Bỏ ${nhap.length} ảnh chưa tải lên?`)) return;
    onClose();
  }

  const ban = dangTai || dangXuLy;

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: "560px" }}>
        <div className="modal-header">
          <div className="modal-title">
            Ảnh {LOAI_ANH_LABEL[loai].toLowerCase()} · {thietBi.ten}
          </div>
          <button onClick={dong} className="text-xl leading-none text-[var(--text-muted)] hover:text-[var(--text-main)]">
            ✕
          </button>
        </div>
        <div className="modal-body space-y-3">
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              nhanFile(e.target.files);
              e.target.value = "";
            }}
          />
          <input
            ref={thuVienRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              nhanFile(e.target.files);
              e.target.value = "";
            }}
          />

          {nhap.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">
              Chụp một hoặc nhiều ảnh, xem lại rồi bấm <b>Tải lên</b>. Ảnh được lưu vào Google Drive của CineB.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {nhap.map((a) => (
                <div key={a.id} className="overflow-hidden rounded border border-[var(--border-color)] bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element -- blob: URL xem trước */}
                  <img src={a.url} alt="Ảnh xem trước" className="aspect-square w-full object-cover" />
                  <div className="space-y-1 p-1.5">
                    {a.trangThai === "dang_tai" && <p className="text-xs text-[var(--text-muted)]">Đang tải lên...</p>}
                    {a.trangThai === "loi" && <p className="text-xs text-[#dc2626]">{a.loi}</p>}
                    <div className="flex gap-1">
                      <button
                        type="button"
                        disabled={ban}
                        className="btn-secondary flex-1 !px-1 !py-1 text-xs"
                        onClick={() => moCamera(a.id)}
                      >
                        ↻ Chụp lại
                      </button>
                      <button
                        type="button"
                        disabled={ban}
                        className="btn-danger-outline !px-2 !py-1 text-xs"
                        onClick={() => boAnh(a.id)}
                        title="Bỏ ảnh này"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={ban} className="btn-secondary" onClick={() => moCamera(null)}>
              📷 {nhap.length === 0 ? "Chụp ảnh" : "Chụp thêm"}
            </button>
            <button type="button" disabled={ban} className="btn-secondary" onClick={() => thuVienRef.current?.click()}>
              🖼️ Chọn từ thư viện
            </button>
          </div>
          {dangXuLy && <p className="text-xs text-[var(--text-muted)]">Đang xử lý ảnh...</p>}
          {loi && <p className="badge badge-danger !inline-block">{loi}</p>}
        </div>
        <div className="modal-footer">
          <button type="button" onClick={dong} disabled={dangTai} className="btn-secondary">
            Huỷ
          </button>
          <button type="button" disabled={ban || nhap.length === 0} onClick={taiLen} className="btn-primary">
            {dangTai ? "Đang tải lên..." : `Tải lên ${nhap.length || ""} ảnh`}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Xem ảnh cỡ lớn; chủ có nút xoá (bắt buộc lý do, ghi nhật ký). */
function XemAnh({
  anh,
  laChu,
  tenThietBi,
  onClose,
}: {
  anh: AnhThietBiTrongDon;
  laChu: boolean;
  tenThietBi?: string;
  onClose: () => void;
}) {
  const [xoa, setXoa] = useState(false);

  if (xoa) {
    return (
      <OrderLyDoModal
        title="Xoá ảnh thiết bị"
        warning={`Xoá ảnh ${LOAI_ANH_LABEL[anh.loai].toLowerCase()} của ${tenThietBi ?? "thiết bị"} (tải lúc ${formatNgayGio(anh.created_at)} bởi ${anh.nguoi_tai}). File trên Google Drive được chuyển vào Thùng rác (khôi phục được trong 30 ngày).`}
        confirmLabel="Xoá ảnh"
        danger
        action={(lyDo) => xoaAnhThietBi(anh.id, lyDo)}
        onClose={onClose}
      />
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: "900px" }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            {LOAI_ANH_LABEL[anh.loai]} · {tenThietBi}
          </div>
          <button onClick={onClose} className="text-xl leading-none text-[var(--text-muted)] hover:text-[var(--text-main)]">
            ✕
          </button>
        </div>
        <div className="modal-body">
          {/* eslint-disable-next-line @next/next/no-img-element -- ảnh riêng tư qua route có kiểm tra đăng nhập */}
          <img src={`/anh-thiet-bi/${anh.id}`} alt={anh.ten_file} className="mx-auto max-h-[70vh] w-auto rounded" />
          <p className="mt-2 text-xs text-[var(--text-muted)]">
            Tải lên bởi {anh.nguoi_tai} lúc {formatNgayGio(anh.created_at)}
          </p>
        </div>
        <div className="modal-footer">
          <a href={`/anh-thiet-bi/${anh.id}`} target="_blank" rel="noreferrer" className="btn-secondary">
            Mở ảnh gốc
          </a>
          {laChu && (
            <button type="button" className="btn-danger-outline" onClick={() => setXoa(true)}>
              🗑️ Xoá ảnh
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
