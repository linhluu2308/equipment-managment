// Google Drive của tài khoản CineB (Gmail cá nhân) — chỉ chạy phía server.
// CỐ Ý không đặt "use server": các hàm này dùng refresh token của CineB, không được
// thành endpoint client gọi thẳng. Không import vào Client Component.
//
// Cách kết nối: 1 refresh token OAuth (scope drive.file) lấy bằng
// scripts/ket-noi-google-drive.mjs. drive.file chỉ cho app thấy file/thư mục do chính
// app tạo ra, không đọc được phần còn lại của Drive. Ảnh nằm trong:
//   <GOOGLE_DRIVE_ROOT_FOLDER_ID> / YYYY-MM / Đơn <MÃ> – <Tên khách> / <file>.jpg
//
// LƯU Ý: OAuth consent screen trên Google Cloud phải ở trạng thái "In production".
// Nếu để "Testing", Google tự thu hồi refresh token sau 7 ngày → tải ảnh báo lỗi
// invalid_grant, phải chạy lại script để lấy token mới.

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const API = "https://www.googleapis.com/drive/v3";
const UPLOAD_API = "https://www.googleapis.com/upload/drive/v3";
const FOLDER_MIME = "application/vnd.google-apps.folder";

let tokenCache: { token: string; hetHan: number } | null = null;
const folderCache = new Map<string, string>();

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Chưa cấu hình Google Drive (thiếu biến môi trường ${name}).`);
  return v;
}

export function driveDaCauHinh(): boolean {
  return Boolean(
    process.env.GOOGLE_OAUTH_CLIENT_ID &&
      process.env.GOOGLE_OAUTH_CLIENT_SECRET &&
      process.env.GOOGLE_DRIVE_REFRESH_TOKEN &&
      process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID
  );
}

async function accessToken(): Promise<string> {
  if (tokenCache && tokenCache.hetHan > Date.now() + 60_000) return tokenCache.token;
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env("GOOGLE_OAUTH_CLIENT_ID"),
      client_secret: env("GOOGLE_OAUTH_CLIENT_SECRET"),
      refresh_token: env("GOOGLE_DRIVE_REFRESH_TOKEN"),
      grant_type: "refresh_token",
    }),
    cache: "no-store",
  });
  const data = (await res.json()) as { access_token?: string; expires_in?: number; error?: string };
  if (!res.ok || !data.access_token) {
    if (data.error === "invalid_grant") {
      throw new Error(
        "Kết nối Google Drive đã hết hạn hoặc bị thu hồi — chạy lại scripts/ket-noi-google-drive.mjs để lấy refresh token mới."
      );
    }
    throw new Error(`Không lấy được quyền truy cập Google Drive (${data.error ?? res.status}).`);
  }
  tokenCache = { token: data.access_token, hetHan: Date.now() + (data.expires_in ?? 3600) * 1000 };
  return data.access_token;
}

async function driveFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const token = await accessToken();
  const res = await fetch(url, {
    ...init,
    headers: { ...(init.headers ?? {}), Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Google Drive lỗi ${res.status}: ${text.slice(0, 200)}`);
  }
  return res;
}

function escapeQuery(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

/** Tìm thư mục con theo tên trong parent (chỉ thấy thư mục do app tạo), chưa có thì tạo. */
async function layHoacTaoThuMuc(ten: string, parentId: string): Promise<string> {
  const key = `${parentId}/${ten}`;
  const cached = folderCache.get(key);
  if (cached) return cached;

  const q = `name = '${escapeQuery(ten)}' and mimeType = '${FOLDER_MIME}' and '${parentId}' in parents and trashed = false`;
  const found = await driveFetch(
    `${API}/files?${new URLSearchParams({ q, fields: "files(id)", orderBy: "createdTime", pageSize: "1" })}`
  );
  const { files } = (await found.json()) as { files: { id: string }[] };
  let id = files[0]?.id;

  if (!id) {
    const created = await driveFetch(`${API}/files?fields=id`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: ten, mimeType: FOLDER_MIME, parents: [parentId] }),
    });
    id = ((await created.json()) as { id: string }).id;
  }
  folderCache.set(key, id);
  return id;
}

/** Thư mục của 1 đơn: <root>/YYYY-MM/<tenThuMucDon>. */
export async function thuMucCuaDon(thang: string, tenThuMucDon: string): Promise<string> {
  const root = env("GOOGLE_DRIVE_ROOT_FOLDER_ID");
  const thuMucThang = await layHoacTaoThuMuc(thang, root);
  return layHoacTaoThuMuc(tenThuMucDon, thuMucThang);
}

/** Tải 1 file lên thư mục, trả về id file Drive. */
export async function taiFileLen(
  parentId: string,
  tenFile: string,
  mimeType: string,
  noiDung: ArrayBuffer
): Promise<string> {
  const boundary = `cineb-${crypto.randomUUID()}`;
  const metadata = JSON.stringify({ name: tenFile, parents: [parentId] });
  const body = new Blob([
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n`,
    `--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`,
    noiDung,
    `\r\n--${boundary}--`,
  ]);
  const res = await driveFetch(`${UPLOAD_API}/files?uploadType=multipart&fields=id`, {
    method: "POST",
    headers: { "Content-Type": `multipart/related; boundary=${boundary}` },
    body,
  });
  return ((await res.json()) as { id: string }).id;
}

/** Tải nội dung file về (để route /anh-thiet-bi/[id] trả ảnh cho trình duyệt). */
export async function taiFileVe(fileId: string): Promise<Response> {
  return driveFetch(`${API}/files/${encodeURIComponent(fileId)}?alt=media`);
}

/** Chuyển file vào Thùng rác của Drive (khôi phục được trong 30 ngày), không xoá vĩnh viễn. */
export async function chuyenVaoThungRac(fileId: string): Promise<void> {
  await driveFetch(`${API}/files/${encodeURIComponent(fileId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ trashed: true }),
  });
}
