import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { isSoleAdmin } from "@/lib/auth/admin";
import { getSession } from "@/lib/auth/session";

export default async function WorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  const showAdminNav = isSoleAdmin(session);

  return (
    <div className="workspace-surface">
      <div className="app-container">
        <Sidebar showAdminNav={showAdminNav} />
        <div className="main-content">
          <Header />
          {children}
        </div>
      </div>
    </div>
  );
}
