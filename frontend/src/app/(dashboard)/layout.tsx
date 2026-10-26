import Sidebar from "@/app/components/sidebar";
import NotificationBell from "@/app/components/notification-bell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sidebar overlay />
      <main className="min-h-screen pl-[120px]">{children}</main>
      <NotificationBell />
    </>
  );
}