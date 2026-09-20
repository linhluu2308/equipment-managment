"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useAuth, type Vai } from "@/lib/auth-context";
import { themThanhVien, suaThanhVien, xoaThanhVien } from "@/lib/actions/thanhVien";
import type { ThanhVienDong } from "@/lib/queries/thanhVien";

export default function MembersManager({ danhSach }: { danhSach: ThanhVienDong[] }) {
  const { email: emailHienTai } = useAuth();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [loi, setLoi] = useState("");
  const [openThem, setOpenThem] = useState(false);
  const [dangSua, setDangSua] = useState<ThanhVienDong | null>(null);

  function xoa(tv: ThanhVienDong) {
    setLoi("");
    if (!confirm(`Xoá quyền truy cập của "${tv.ten}" (${tv.email})?`)) return;
    start(async () => {
      try {
        await xoaThanhVien(tv.id);
        router.refresh();
      } catch (err) {
        setLoi((err as Error).message);
      }
    });
  }

  return (
    <>
      <div className="action-bar mb-3">
        <div />
        <button className="btn-primary" onClick={() => setOpenThem(true)}>
          + Thêm thành viên
        </button>
      </div>

      {loi && <p className="badge badge-danger !inline-block mb-3">{loi}</p>}

      <div className="table-container" style={{ border: "none", boxShadow: "none" }}>
        <table>
          <thead>
            <tr>
              <th>Tên</th>
              <th>Email</th>
              <th>Vai</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {danhSach.map((tv) => {
              const laChinhMinh = tv.email === emailHienTai;
              return (
                <tr key={tv.id}>
                  <td className="font-semibold">
                    {tv.ten} {laChinhMinh && <span className="text-xs text-[var(--text-muted)] font-normal">(bạn)</span>}
                  </td>
                  <td className="font-mono text-xs">{tv.email}</td>
                  <td>
                    <span className={`badge ${tv.vai === "chu" ? "badge-info" : "badge-neutral"}`}>
                      {tv.vai === "chu" ? "Chủ" : "Kho"}
                    </span>
                  </td>
                  <td className="text-right whitespace-nowrap">
                    <button
                      className="text-xs text-[var(--accent-primary)] hover:underline mr-3"
                      onClick={() => setDangSua(tv)}
                    >
                      Sửa
                    </button>
                    <button
                      disabled={pending || laChinhMinh}
                      title={laChinhMinh ? "Không thể tự xoá chính mình" : undefined}
                      className="text-xs text-red-600 hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
                      onClick={() => xoa(tv)}
                    >
                      Xoá
                    </button>
                  </td>
                </tr>
              );
            })}
            {danhSach.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-[var(--text-muted)]">
                  Chưa có thành viên nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {openThem && <ThanhVienModal onClose={() => setOpenThem(false)} />}
      {dangSua && <ThanhVienModal thanhVien={dangSua} onClose={() => setDangSua(null)} />}
    </>
  );
}

function ThanhVienModal({ thanhVien, onClose }: { thanhVien?: ThanhVienDong; onClose: () => void }) {
  const router = useRouter();
  const dangSua = !!thanhVien;
  const [email, setEmail] = useState(thanhVien?.email ?? "");
  const [ten, setTen] = useState(thanhVien?.ten ?? "");
  const [vai, setVai] = useState<Vai>(thanhVien?.vai ?? "kho");
  const [dangGui, setDangGui] = useState(false);
  const [loi, setLoi] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoi("");
    if (!ten.trim() || (!dangSua && !email.trim())) return setLoi("Cần nhập đủ email và tên.");
    setDangGui(true);
    try {
      if (dangSua) {
        await suaThanhVien(thanhVien.id, { ten, vai });
      } else {
        await themThanhVien({ email, ten, vai });
      }
      router.refresh();
      onClose();
    } catch (err) {
      setLoi((err as Error).message);
    } finally {
      setDangGui(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: "440px" }}>
        <div className="modal-header">
          <div className="modal-title">{dangSua ? "Sửa thành viên" : "Thêm thành viên"}</div>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-main)] text-xl leading-none">
            ✕
          </button>
        </div>
        <form onSubmit={submit} className="flex flex-col overflow-hidden">
          <div className="modal-body">
            <input
              className="input"
              type="email"
              placeholder="Email Google"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={dangSua}
              title={dangSua ? "Không thể đổi email — xoá rồi thêm lại nếu cần" : undefined}
            />
            <input className="input" placeholder="Tên hiển thị" value={ten} onChange={(e) => setTen(e.target.value)} />
            <select className="input" value={vai} onChange={(e) => setVai(e.target.value as Vai)}>
              <option value="chu">Chủ</option>
              <option value="kho">Kho</option>
            </select>

            {loi && <p className="badge badge-danger !inline-block">{loi}</p>}
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">
              Huỷ
            </button>
            <button type="submit" disabled={dangGui} className="btn-primary">
              {dangGui ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
