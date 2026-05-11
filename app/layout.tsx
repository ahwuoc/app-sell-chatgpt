import type { Metadata } from "next";
import { Toaster } from "sonner";
import { FlashMessages } from "@/components/flash-messages";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChatGPT Account Dashboard",
  description: "Trang lưu và quản lý tài khoản với MongoDB",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        {children}
        <Toaster richColors position="top-right" />
        <FlashMessages />
      </body>
    </html>
  );
}
