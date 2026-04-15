import Image from "next/image";
import Link from "next/link";
import { LogOut, Search } from "lucide-react";
import { fetchFromBackend } from "@/lib/api/server";
import NotificationPanel from "@/components/NotificationPanel";
import type {
  ApiHealthResponse,
  HeaderProfileResponse,
} from "@/lib/api/types";
import { getSession } from "@/lib/auth/session";
import "./Header.css";

async function getHeaderData(
  userId?: string,
): Promise<{
  profile: HeaderProfileResponse | null;
  health: ApiHealthResponse | null;
}> {
  try {
    const [profile, health] = await Promise.all([
      userId
        ? fetchFromBackend<HeaderProfileResponse>(
            `/api/header/me?userId=${encodeURIComponent(userId)}`,
          )
        : Promise.resolve(null),
      fetchFromBackend<ApiHealthResponse>("/api/health"),
    ]);

    return { profile, health };
  } catch {
    return { profile: null, health: null };
  }
}

export default async function Header() {
  const session = await getSession();
  const { profile, health } = await getHeaderData(session?.userId);
  const activeUser = profile ?? session;
  const isLoggedIn = Boolean(session);
  const isApiOnline = Boolean(health?.ok);

  const statusCopy = isApiOnline
    ? "Backend connected"
    : "Backend unreachable";

  const subheading = activeUser?.seatNumber && activeUser.classroomNumber
    ? `Seat ${activeUser.seatNumber} in ${activeUser.classroomNumber}`
    : isLoggedIn
      ? "Live service dashboards and request workflows are available."
      : "Sign in to access the student workspace and service console.";

  return (
    <header className="header">
      <div className="header-intro">
        <span className="header-kicker">Campus Service Management</span>
        <div className="header-title-row">
          <h2>Operational Control Center</h2>
          <div className={`header-health ${isApiOnline ? "online" : "offline"}`}>
            <span className="header-health-dot" aria-hidden="true" />
            {statusCopy}
          </div>
        </div>
        <p>{subheading}</p>
      </div>

      <div className="header-actions">
        <label className="header-search" aria-label="Search">
          <Search size={16} className="header-search-icon" />
          <input
            type="text"
            placeholder="Search ticket codes, rooms, or categories"
          />
        </label>

        {activeUser?.seatNumber && activeUser.classroomNumber ? (
          <div className="header-chip">
            Contest seat {activeUser.seatNumber}
          </div>
        ) : null}

        {isLoggedIn ? (
          <NotificationPanel
            initialUnreadCount={profile?.unreadNotifications ?? 0}
          />
        ) : null}

        {isLoggedIn ? (
          <>
            <Link href="/ticket/new" className="btn btn-primary">
              New Request
            </Link>
            <form action="/api/auth/logout" method="post">
              <button
                className="header-icon-btn"
                type="submit"
                aria-label="Sign out"
              >
                <LogOut size={18} />
              </button>
            </form>
          </>
        ) : (
          <Link href="/login" className="btn btn-primary">
            Sign In
          </Link>
        )}

        <div className="header-user-card">
          <div className="header-user-copy">
            <strong>{activeUser?.name ?? "Guest access"}</strong>
            <span>
              {activeUser
                ? `${activeUser.role.replace(/_/g, " ")} · ${activeUser.email}`
                : "Authentication required"}
            </span>
          </div>
          <div className="avatar header-avatar">
            <Image
              src={
                activeUser?.avatarUrl ??
                "https://i.pravatar.cc/150?u=nst-guest"
              }
              alt={activeUser?.name ?? "Guest user"}
              width={44}
              height={44}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
