import { NextResponse } from "next/server";
import { layDanhSachSuKienLich } from "@/lib/queries/lichIcs";

// Feed .ics công khai theo secret trên URL (?key=...) — KHÔNG dùng session đăng
// nhập vì Google Calendar tự động tải link này định kỳ, không gửi kèm cookie.
export const dynamic = "force-dynamic";

function escapeIcsText(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function ngayIcs(ngay: string): string {
  return ngay.replaceAll("-", "");
}

function ngaySauMot(ngay: string): string {
  const d = new Date(`${ngay}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10).replaceAll("-", "");
}

function timestampIcs(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

export async function GET(request: Request) {
  const key = new URL(request.url).searchParams.get("key");
  const secret = process.env.CALENDAR_FEED_SECRET;

  if (!secret) {
    return new NextResponse("Chưa cấu hình CALENDAR_FEED_SECRET trên server.", { status: 500 });
  }
  if (key !== secret) {
    return new NextResponse("Sai hoặc thiếu key.", { status: 401 });
  }

  const suKien = await layDanhSachSuKienLich();
  const now = new Date().toISOString();

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//CineB Equipment Rental//lich-thue//VI",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:CineB — Lịch thuê thiết bị",
    "X-WR-TIMEZONE:Asia/Ho_Chi_Minh",
    "REFRESH-INTERVAL;VALUE=DURATION:PT1H",
  ];

  for (const sk of suKien) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:don-thue-${sk.id}@cineb`,
      `DTSTAMP:${timestampIcs(now)}`,
      `DTSTART;VALUE=DATE:${ngayIcs(sk.ngayBatDau)}`,
      `DTEND;VALUE=DATE:${ngaySauMot(sk.ngayTraDuKien)}`,
      `LAST-MODIFIED:${timestampIcs(sk.capNhatLuc)}`,
      `SUMMARY:${escapeIcsText(`🎬 ${sk.tenKhach} — ${sk.soThietBi} thiết bị (${sk.changLabel})`)}`,
      `DESCRIPTION:${escapeIcsText(`SĐT: ${sk.sdtKhach}\nChặng: ${sk.changLabel}\nMã đơn: ${sk.id.slice(0, 8).toUpperCase()}`)}`,
      "END:VEVENT"
    );
  }

  lines.push("END:VCALENDAR");

  return new NextResponse(lines.join("\r\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="cineb-lich-thue.ics"',
      "Cache-Control": "public, max-age=1800",
    },
  });
}
