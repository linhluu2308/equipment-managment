// Kết nối Google Drive của tài khoản CineB cho tính năng ảnh thiết bị — chạy 1 lần
// (hoặc chạy lại khi kết nối bị thu hồi/hết hạn).
//
//   cd app
//   node scripts/ket-noi-google-drive.mjs
//
// Cần có sẵn trong .env.local: GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET
// (OAuth client loại "Desktop app" trên Google Cloud). Script mở link đăng nhập Google,
// bạn đăng nhập bằng TÀI KHOẢN CINEB (tài khoản sẽ chứa ảnh), bấm Cho phép, rồi script
// in ra GOOGLE_DRIVE_REFRESH_TOKEN và GOOGLE_DRIVE_ROOT_FOLDER_ID để dán vào
// .env.local + Vercel. Không dùng thư viện ngoài.

import http from "node:http";
import { readFileSync } from "node:fs";
import { spawn } from "node:child_process";

/**
 * Mở link bằng trình duyệt mặc định. Link OAuth rất dài và chứa "&": copy tay từ
 * terminal hay bị cắt mất phần sau (Google báo 400 "missing response_type"). Không
 * dùng `cmd /c start` vì cmd hiểu "&" là nối lệnh và cắt link.
 */
function moTrinhDuyet(url) {
  const [cmd, args] =
    process.platform === "win32"
      ? ["rundll32", ["url.dll,FileProtocolHandler", url]]
      : process.platform === "darwin"
        ? ["open", [url]]
        : ["xdg-open", [url]];
  try {
    spawn(cmd, args, { detached: true, stdio: "ignore" }).on("error", () => {}).unref();
  } catch {
    // Không mở được thì người dùng tự copy link đã in ra.
  }
}

const PORT = 53682;
const REDIRECT_URI = `http://127.0.0.1:${PORT}`;
const SCOPE = "https://www.googleapis.com/auth/drive.file";
const TEN_THU_MUC_GOC = "CineB – Ảnh thiết bị";

function docEnvLocal() {
  try {
    return Object.fromEntries(
      readFileSync(new URL("../.env.local", import.meta.url), "utf8")
        .split(/\r?\n/)
        .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
        .map((l) => {
          const i = l.indexOf("=");
          return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")];
        })
    );
  } catch {
    return {};
  }
}

const envFile = docEnvLocal();
const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID || envFile.GOOGLE_OAUTH_CLIENT_ID;
const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET || envFile.GOOGLE_OAUTH_CLIENT_SECRET;
const thuMucCo = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID || envFile.GOOGLE_DRIVE_ROOT_FOLDER_ID;

if (!clientId || !clientSecret) {
  console.error("Thiếu GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET trong app/.env.local.");
  process.exit(1);
}

const authUrl =
  "https://accounts.google.com/o/oauth2/v2/auth?" +
  new URLSearchParams({
    client_id: clientId,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: SCOPE,
    access_type: "offline",
    prompt: "consent", // luôn trả refresh token mới
  });

const code = await new Promise((resolve, reject) => {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, REDIRECT_URI);
    const c = url.searchParams.get("code");
    const err = url.searchParams.get("error");
    if (!c && !err) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(
      c
        ? "<h2>✅ Đã kết nối Google Drive. Quay lại cửa sổ terminal.</h2>"
        : `<h2>❌ Không kết nối được: ${err}</h2>`
    );
    server.close();
    if (c) resolve(c);
    else reject(new Error(err));
  });
  server.on("error", (e) => {
    if (e.code === "EADDRINUSE") {
      console.error(`Cổng ${PORT} đang bận — có thể lần chạy trước vẫn đang chờ. Đóng nó (Ctrl+C) rồi chạy lại.`);
      process.exit(1);
    }
    reject(e);
  });
  server.listen(PORT, "127.0.0.1", () => {
    console.log("\nĐang mở trình duyệt — đăng nhập bằng TÀI KHOẢN GOOGLE CỦA CINEB và bấm Cho phép.");
    console.log("Nếu trình duyệt không tự mở, copy NGUYÊN VẸN link dưới đây (link dài, đừng để bị cắt):\n");
    console.log(authUrl + "\n");
    moTrinhDuyet(authUrl);
  });
});

const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: REDIRECT_URI,
    grant_type: "authorization_code",
  }),
});
const token = await tokenRes.json();
if (!tokenRes.ok || !token.refresh_token) {
  console.error("Không lấy được refresh token:", token);
  process.exit(1);
}

let thuMucId = thuMucCo;
if (!thuMucId) {
  const r = await fetch("https://www.googleapis.com/drive/v3/files?fields=id,webViewLink", {
    method: "POST",
    headers: { Authorization: `Bearer ${token.access_token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ name: TEN_THU_MUC_GOC, mimeType: "application/vnd.google-apps.folder" }),
  });
  const folder = await r.json();
  if (!r.ok) {
    console.error("Không tạo được thư mục gốc trên Drive:", folder);
    process.exit(1);
  }
  thuMucId = folder.id;
  console.log(`Đã tạo thư mục "${TEN_THU_MUC_GOC}" trong My Drive: ${folder.webViewLink}`);
} else {
  console.log(`Giữ thư mục gốc cũ: ${thuMucId}`);
}

console.log("\nDán 2 dòng sau vào app/.env.local VÀ Vercel → Settings → Environment Variables:\n");
console.log(`GOOGLE_DRIVE_REFRESH_TOKEN=${token.refresh_token}`);
console.log(`GOOGLE_DRIVE_ROOT_FOLDER_ID=${thuMucId}\n`);
