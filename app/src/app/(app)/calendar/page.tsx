import { headers } from "next/headers";
import { listDonThue } from "@/lib/actions/donThue";
import CalendarGrid from "@/components/calendar/CalendarGrid";
import SyncGoogleCalendarBox from "@/components/calendar/SyncGoogleCalendarBox";

export const dynamic = "force-dynamic";

async function layFeedUrl(): Promise<string | null> {
  const secret = process.env.CALENDAR_FEED_SECRET;
  if (!secret) return null;

  const h = await headers();
  const host = h.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${host}/calendar.ics?key=${secret}`;
}

export default async function CalendarPage() {
  const [orders, feedUrl] = await Promise.all([listDonThue(), layFeedUrl()]);

  const events = orders
    .filter((o) => o.chang !== "huy")
    .map((o) => ({
      id: o.id,
      ma_don: o.ma_don,
      chang: o.chang,
      ngay_bat_dau: o.ngay_bat_dau,
      ngay_tra_du_kien: o.ngay_tra_du_kien,
      ten_khach: o.khach_hang?.ten ?? "—",
      sdt_khach: o.khach_hang?.so_dien_thoai ?? "",
      so_thiet_bi: o.don_thue_chi_tiet?.length ?? 0,
    }));

  return (
    <>
      <CalendarGrid events={events} />
      <SyncGoogleCalendarBox feedUrl={feedUrl} />
    </>
  );
}
