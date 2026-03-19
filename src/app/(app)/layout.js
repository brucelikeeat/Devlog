import { Sidebar } from "@/components/layout/Sidebar";

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Sidebar />
      <div className="min-h-screen lg:pl-72">
        {children}
      </div>
    </div>
  );
}
