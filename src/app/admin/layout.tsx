import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin — QuickBite",
  description: "Admin dashboard for managing canteen menu, orders, and QR codes.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
