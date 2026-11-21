import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Ảnh thiết bị đã nén ở trình duyệt (~300–500KB) nhưng chừa dư cho ảnh nhiều chi
      // tiết; mặc định 1MB dễ bị từ chối. Giữ dưới giới hạn 4.5MB của Vercel.
      bodySizeLimit: "4.5mb",
    },
  },
};

export default nextConfig;
