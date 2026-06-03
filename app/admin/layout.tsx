import Sidebar from "@/components/admin/Sidebar";

export const metadata = { title: "Admin — Santiago Azcuy" };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-[var(--color-background)]">
      <Sidebar />
      <main className="flex-1 ml-56 min-h-screen">
        {children}
      </main>
    </div>
  );
}
