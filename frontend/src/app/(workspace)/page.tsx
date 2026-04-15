import Link from "next/link";
import type { Metadata } from "next";
import {
  Box,
  Lightbulb,
  Monitor,
  Plus,
  ShieldAlert,
  Trash2,
  Wrench,
} from "lucide-react";
import { fetchFromBackend } from "@/lib/api/server";
import { requireSession } from "@/lib/auth/session";
import type {
  ResidentCampusPulse,
  ResidentDashboardResponse,
  ResidentQuickLaunchItem,
} from "@/lib/api/types";
import "./page.css";

export const metadata: Metadata = {
  title: "Resident Dashboard",
  description:
    "Resident workspace for service requests, quick actions, and contest-day seating visibility.",
};

function renderIcon(icon: string, size = 22) {
  switch (icon) {
    case "wrench":
      return <Wrench size={size} />;
    case "router":
    case "wifi":
      return <Monitor size={size} />;
    case "trash":
      return <Trash2 size={size} />;
    case "shield":
      return <ShieldAlert size={size} />;
    case "box":
      return <Box size={size} />;
    case "bulb":
      return <Lightbulb size={size} />;
    case "plus":
      return <Plus size={size} />;
    default:
      return <Wrench size={size} />;
  }
}

function statusBadge(status: string) {
  switch (status) {
    case "PENDING":
      return { badgeClass: "badge badge-status-pending", dotClass: "status-dot pending" };
    case "DISPATCHED":
    case "SCHEDULED":
      return { badgeClass: "badge badge-status-dispatched", dotClass: "status-dot dispatched" };
    case "IN_PROGRESS":
      return { badgeClass: "badge badge-status-in-progress", dotClass: "status-dot in-progress" };
    case "RESOLVED":
      return { badgeClass: "badge badge-status-resolved", dotClass: "status-dot resolved" };
    default:
      return { badgeClass: "badge badge-gray", dotClass: "status-dot gray" };
  }
}

function requestIconClass(status: string): string {
  if (status === "PENDING") {
    return "resident-request-icon pending";
  }
  if (status === "DISPATCHED" || status === "SCHEDULED") {
    return "resident-request-icon dispatched";
  }
  if (status === "RESOLVED") {
    return "resident-request-icon resolved";
  }

  return "resident-request-icon in-progress";
}

function relativeTimeLabel(isoDate: string): string {
  const createdAt = new Date(isoDate).getTime();
  const diffMs = Date.now() - createdAt;
  const diffHours = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60)));

  if (diffHours < 24) {
    return `Created ${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `Created ${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

async function getResidentDashboard(
  userId: string,
): Promise<ResidentDashboardResponse | null> {
  try {
    return await fetchFromBackend<ResidentDashboardResponse>(
      `/api/dashboard/resident?userId=${encodeURIComponent(userId)}`,
    );
  } catch {
    return null;
  }
}

function renderQuickLaunchCard(item: ResidentQuickLaunchItem) {
  return (
    <Link
      key={item.id}
      href={item.href}
      className={`quick-launch-card ${item.id === "new-ticket" ? "featured" : ""}`}
    >
      <div className="quick-launch-icon">{renderIcon(item.icon)}</div>
      <div className="quick-launch-copy">
        <h4>{item.title}</h4>
        <p>{item.description}</p>
      </div>
      <span className="quick-launch-arrow">Open</span>
    </Link>
  );
}

function renderPulseCard(item: ResidentCampusPulse) {
  if (item.imageUrl) {
    return (
      <article key={item.id} className="pulse-story pulse-story-image">
        <div
          className="pulse-story-visual"
          style={{ backgroundImage: `url('${item.imageUrl}')` }}
        >
          {item.tag ? <span className="badge badge-primary">{item.tag}</span> : null}
        </div>
        <div className="pulse-story-copy">
          <h4>{item.title}</h4>
          <p>{item.description}</p>
        </div>
      </article>
    );
  }

  return (
    <article key={item.id} className={`pulse-story ${item.type}`}>
      <div className="pulse-story-copy">
        <span className="pulse-story-label">
          {item.type === "warning" ? "Maintenance notice" : "Campus update"}
        </span>
        <h4>{item.title}</h4>
        <p>{item.description}</p>
      </div>
    </article>
  );
}

export default async function ResidentDashboard() {
  const session = await requireSession();
  const dashboard = await getResidentDashboard(session.userId);

  if (!dashboard) {
    return (
      <main className="page-shell">
        <section className="panel">
          <h2 className="text-2xl mb-2">Resident Dashboard Unavailable</h2>
          <p className="text-secondary">
            We could not load resident data from the backend API.
          </p>
        </section>
      </main>
    );
  }

  const firstName = dashboard.userName.split(" ")[0];
  const seatLabel =
    session.seatNumber && session.classroomNumber
      ? `Seat ${session.seatNumber} · ${session.classroomNumber}`
      : "Seating sync available from registrar import";

  return (
    <main className="resident-page page-shell">
      <section className="page-hero resident-hero panel animate-slide-up">
        <div className="resident-hero-copy">
          <div className="eyebrow">Resident Workspace</div>
          <h1 className="page-title">Welcome back, {firstName}.</h1>
          <p className="page-description">
            Review your live request queue, verify your contest seating details,
            and move from reporting an issue to tracking resolution in one
            consistent workspace.
          </p>

          <div className="resident-pill-row">
            {session.enrollmentNumber ? (
              <span className="pill">Enrollment {session.enrollmentNumber}</span>
            ) : null}
            <span className="pill pill-highlight">{seatLabel}</span>
          </div>
        </div>

        <div className="resident-stat-grid">
          <article className="resident-stat-card">
            <span className="resident-stat-label">Active requests</span>
            <strong>{String(dashboard.activeRequests).padStart(2, "0")}</strong>
            <p>Tickets currently open or moving through dispatch.</p>
          </article>
          <article className="resident-stat-card">
            <span className="resident-stat-label">Upcoming bookings</span>
            <strong>{String(dashboard.upcomingBookings).padStart(2, "0")}</strong>
            <p>Facility reservations still on your schedule.</p>
          </article>
          <article className="resident-stat-card">
            <span className="resident-stat-label">Recent tickets</span>
            <strong>{String(dashboard.recentRequests.length).padStart(2, "0")}</strong>
            <p>Latest requests surfaced directly from the backend board.</p>
          </article>
        </div>
      </section>

      <div className="resident-layout">
        <div className="resident-primary-stack">
          <section className="panel animate-slide-up delay-100">
            <div className="section-header">
              <div>
                <h3>Quick actions</h3>
                <p>Start the task you need most often with one click.</p>
              </div>
            </div>

            <div className="quick-launch-grid">
              {dashboard.quickLaunch.map((item) => renderQuickLaunchCard(item))}
            </div>
          </section>

          <section className="panel animate-slide-up delay-200">
            <div className="section-header">
              <div>
                <h3>Recent requests</h3>
                <p>Your newest tickets and the stage they are currently in.</p>
              </div>
              <Link href="/requests" className="section-link">
                View all
              </Link>
            </div>

            {dashboard.recentRequests.length === 0 ? (
              <div className="resident-empty-state">
                <div>
                  <h4>No requests yet</h4>
                  <p>
                    Create your first maintenance or support request to start
                    tracking it here.
                  </p>
                </div>
                <Link href="/ticket/new" className="btn btn-primary">
                  Raise ticket
                </Link>
              </div>
            ) : (
              <div className="resident-request-list">
                {dashboard.recentRequests.map((request, index) => {
                  const badge = statusBadge(request.status);

                  return (
                    <article
                      key={request.requestId}
                      className={`resident-request-row ${
                        index === dashboard.recentRequests.length - 1 ? "last" : ""
                      }`}
                    >
                      <div className="resident-request-main">
                        <div className={requestIconClass(request.status)}>
                          {renderIcon(request.icon, 18)}
                        </div>
                        <div className="resident-request-copy">
                          <h4>{request.title}</h4>
                          <p>
                            Ticket #{request.ticketCode} ·{" "}
                            {relativeTimeLabel(request.createdAt)}
                          </p>
                        </div>
                      </div>
                      <span className={badge.badgeClass}>
                        <span className={badge.dotClass} />
                        {request.status.replace(/_/g, " ")}
                      </span>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <aside className="resident-secondary-stack">
          <section className="panel animate-slide-up delay-300">
            <div className="section-header">
              <div>
                <h3>Operational brief</h3>
                <p>Live campus notices and resident-facing service signals.</p>
              </div>
            </div>

            <div className="pulse-stack">
              {dashboard.campusPulse.map((item) => renderPulseCard(item))}
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
