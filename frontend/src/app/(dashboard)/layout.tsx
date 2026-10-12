import Sidebar from "@/app/components/sidebar";
import NotificationBell from "@/app/components/notification-bell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sidebar overlay />
      <NotificationBell />
      {children}
    </>
  );
}