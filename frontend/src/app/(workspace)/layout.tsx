import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

export default function WorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="workspace-surface">
      <div className="ambient-backdrop" aria-hidden="true">
        <div className="ambient-orb ambient-orb-one" />
        <div className="ambient-orb ambient-orb-two" />
        <div className="ambient-grid" />
      </div>
      <div className="app-container animate-fade-in">
        <Sidebar />
        <div className="main-content">
          <Header />
          {children}
        </div>
      </div>
    </div>
  );
}
