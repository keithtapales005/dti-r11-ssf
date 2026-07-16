import Sidebar from "@/app/components/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sidebar overlay />
      {children}
    </>
  );
}