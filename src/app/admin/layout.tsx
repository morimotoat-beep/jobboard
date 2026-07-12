import type { Metadata } from "next";
import "../globals.css";

// 管理画面は運営者専用のため日本語のみ（多言語化しない）
export const metadata: Metadata = {
  title: "管理画面 | Academia Notes Jobs",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
