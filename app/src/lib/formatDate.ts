/**
 * Định dạng ngày kiểu "YYYY-MM-DD" (cột `date` từ Postgres) thành "dd/mm/yyyy" —
 * tách chuỗi trực tiếp, không qua Date/timezone, để tránh lệch ngày do server
 * chạy ở UTC còn dữ liệu là ngày lịch đơn thuần (không có giờ).
 */
export function formatNgay(iso: string | null | undefined): string {
  if (!iso) return "—";
  const [y, m, d] = iso.slice(0, 10).split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

/** Định dạng thời điểm (timestamptz, có giờ) thành "dd/mm/yyyy HH:mm". */
export function formatNgayGio(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${d.getFullYear()} ${hh}:${mi}`;
}
