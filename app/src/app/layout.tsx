import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Space_Mono } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "CineB — Quản lý cho thuê thiết bị",
  description: "Quản lý thiết bị, đơn thuê, công nợ và lợi nhuận cho thuê thiết bị điện ảnh",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className={`${jakarta.variable} ${spaceMono.variable} h-full antialiased`}>
      <body className="h-full">{children}</body>
    </html>
  );
}
