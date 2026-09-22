"use client";

import { useState } from "react";

export default function SyncGoogleCalendarBox({ feedUrl }: { feedUrl: string | null }) {
  const [daCopy, setDaCopy] = useState(false);

  if (!feedUrl) {
    return (
      <div className="card">
        <div className="card-title !mb-1">🔗 Đồng bộ vào Google Calendar cá nhân</div>
        <p className="text-xs text-[var(--text-muted)]">
          Chưa cấu hình biến môi trường <code className="font-mono">CALENDAR_FEED_SECRET</code> trên server — cần
          thêm biến này (một chuỗi bí mật tự đặt) rồi triển khai lại để bật tính năng đồng bộ.
        </p>
      </div>
    );
  }

  async function saoChep() {
    try {
      await navigator.clipboard.writeText(feedUrl!);
      setDaCopy(true);
      setTimeout(() => setDaCopy(false), 2000);
    } catch {
      // Trình duyệt chặn clipboard API (vd http không an toàn) — người dùng tự bôi đen copy.
    }
  }

  return (
    <div className="card">
      <div className="card-title !mb-1">🔗 Đồng bộ vào Google Calendar cá nhân</div>
      <p className="text-xs text-[var(--text-muted)] mb-3">
        Mỗi thành viên copy link bên dưới, mở Google Calendar (trên máy tính) → góc trái chọn{" "}
        <strong>Other calendars</strong> → dấu <strong>+</strong> → <strong>From URL</strong> → dán link vào. Lịch
        thuê đồ sẽ tự xuất hiện trong Google Calendar cá nhân, tự làm mới sau mỗi vài giờ (Google tự quyết định chu
        kỳ, không ép nhanh hơn được).
      </p>
      <div className="flex gap-2">
        <input className="input font-mono text-xs" readOnly value={feedUrl} onFocus={(e) => e.target.select()} />
        <button type="button" onClick={saoChep} className="btn-secondary whitespace-nowrap">
          {daCopy ? "Đã copy ✓" : "Copy link"}
        </button>
      </div>
    </div>
  );
}
