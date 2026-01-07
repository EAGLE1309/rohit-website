import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Hide admin routes in production
  if (process.env.NODE_ENV === "production") {
    redirect("/");
  }

  return <>{children}</>;
}
