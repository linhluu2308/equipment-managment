import type { Metadata } from "next";
import Link from "next/link";

// Trang công khai (không cần đăng nhập — xem DUONG_DAN_CONG_KHAI trong proxy.ts).
// Google bắt buộc có link chính sách bảo mật mới cho publish OAuth app sang "In production"
// (cần cho đăng nhập Google + kết nối Google Drive lưu ảnh thiết bị).

export const metadata: Metadata = {
  title: "Chính sách bảo mật — CineB",
};

const CAP_NHAT = "15/11/2026";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen w-full bg-[#f8fafc] px-4 py-10">
      <article className="mx-auto max-w-2xl space-y-6 rounded-2xl bg-white p-6 text-sm leading-relaxed text-[var(--text-main)] shadow sm:p-10">
        <header className="space-y-1">
          <h1 className="text-2xl font-extrabold">Chính sách bảo mật</h1>
          <p className="text-[var(--text-muted)]">
            CineB Equipment Management · CINEB PRODUCTION · Cập nhật {CAP_NHAT}
          </p>
        </header>

        <Muc tieuDe="Ứng dụng này là gì">
          Công cụ nội bộ của CINEB PRODUCTION để quản lý thiết bị, đơn cho thuê, công nợ và ảnh tình trạng thiết bị.
          Chỉ thành viên được CineB cấp quyền mới đăng nhập và sử dụng được.
        </Muc>

        <Muc tieuDe="Thông tin chúng tôi thu thập">
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <b>Khi bạn đăng nhập bằng Google:</b> địa chỉ email, tên và ảnh đại diện, chỉ để xác nhận bạn là thành viên
              được cấp quyền và hiển thị tên người thao tác.
            </li>
            <li>
              <b>Dữ liệu nghiệp vụ:</b> thông tin khách thuê, đơn thuê, thanh toán, biên bản kiểm tra và ảnh thiết bị do
              thành viên CineB nhập vào.
            </li>
          </ul>
        </Muc>

        <Muc tieuDe="Google Drive">
          Ảnh thiết bị lúc giao và lúc nhận về được lưu trong Google Drive của tài khoản CineB. Ứng dụng dùng quyền{" "}
          <code>drive.file</code>: chỉ truy cập được các file và thư mục do chính ứng dụng tạo ra, không đọc, sửa hay
          xoá bất kỳ file nào khác trong Drive. Ảnh không được chia sẻ công khai và chỉ thành viên đã đăng nhập mới xem
          được.
        </Muc>

        <Muc tieuDe="Sử dụng và chia sẻ">
          Dữ liệu chỉ dùng cho hoạt động cho thuê thiết bị của CineB. Chúng tôi không bán, không chia sẻ dữ liệu cho bên
          thứ ba và không dùng cho quảng cáo. Dữ liệu được lưu trên Supabase (cơ sở dữ liệu) và Google Drive (ảnh).
          Việc sử dụng thông tin nhận từ Google API tuân thủ{" "}
          <a
            className="text-[var(--accent-primary)] underline"
            href="https://developers.google.com/terms/api-services-user-data-policy"
            target="_blank"
            rel="noreferrer"
          >
            Google API Services User Data Policy
          </a>
          , bao gồm các yêu cầu về Limited Use.
        </Muc>

        <Muc tieuDe="Xoá dữ liệu">
          Thành viên hoặc khách hàng muốn xem, sửa hoặc xoá dữ liệu của mình có thể liên hệ CINEB PRODUCTION. Có thể thu
          hồi quyền truy cập Google của ứng dụng bất cứ lúc nào tại{" "}
          <a
            className="text-[var(--accent-primary)] underline"
            href="https://myaccount.google.com/permissions"
            target="_blank"
            rel="noreferrer"
          >
            myaccount.google.com/permissions
          </a>
          .
        </Muc>

        <Muc tieuDe="Liên hệ">CINEB PRODUCTION · 22 Giang Văn Minh, Hoà Cường, Đà Nẵng · MST 0402190079</Muc>

        <hr className="border-[var(--border-color)]" />

        <section lang="en" className="space-y-2 text-[var(--text-muted)]">
          <h2 className="font-bold text-[var(--text-main)]">Summary (English)</h2>
          <p>
            CineB Equipment Management is an internal tool of CINEB PRODUCTION, used only by authorised staff. Google
            Sign-In is used to read your email, name and profile picture solely to verify membership. Equipment photos
            are stored in CineB&apos;s own Google Drive using the <code>drive.file</code> scope, so the app can only
            access files it created itself. Data is used only for CineB&apos;s rental operations, is never sold or
            shared with third parties, and is not used for advertising. Use of information received from Google APIs
            adheres to the Google API Services User Data Policy, including the Limited Use requirements. To request
            access to or deletion of your data, contact CINEB PRODUCTION at the address above.
          </p>
        </section>

        <p>
          <Link href="/login" className="font-semibold text-[var(--accent-primary)] hover:underline">
            ← Về trang đăng nhập
          </Link>
        </p>
      </article>
    </main>
  );
}

function Muc({ tieuDe, children }: { tieuDe: string; children: React.ReactNode }) {
  return (
    <section className="space-y-1.5">
      <h2 className="text-base font-bold">{tieuDe}</h2>
      <div>{children}</div>
    </section>
  );
}
