import Image from "next/image";
import type { Metadata } from "next";
import {
  AlertOctagon,
  CheckCircle2,
  ClipboardList,
  Lock,
  Package,
  Snowflake,
  Timer,
  Users,
  Wifi,
} from "lucide-react";
import { fetchFromBackend } from "@/lib/api/server";
import { requireSession } from "@/lib/auth/session";
import type {
  AdminDashboardResponse,
  AdminEvent,
  AdminQueueItem,
} from "@/lib/api/types";
import "./page.css";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description:
    "Administrative operations dashboard for dispatch queue, field units, and live service telemetry.",
};

function categoryIcon(category: string) {
  const normalized = category.toLowerCase();

  if (normalized.includes("network") || normalized.includes("it")) {
    return <Wifi size={14} />;
  }
  if (normalized.includes("hvac") || normalized.includes("maintenance")) {
    return <Snowflake size={14} />;
  }
  if (normalized.includes("security")) {
    return <Lock size={14} />;
  }

  return <Package size={14} />;
}

function statusBadge(status: string): { className: string; dotClass: string } {
  if (status === "PENDING") {
    return { className: "badge badge-status-pending", dotClass: "status-dot pending" };
  }
  if (status === "DISPATCHED" || status === "SCHEDULED") {
    return { className: "badge badge-status-dispatched", dotClass: "status-dot dispatched" };
  }
  if (status === "RESOLVED") {
    return { className: "badge badge-status-resolved", dotClass: "status-dot resolved" };
  }

  return { className: "badge badge-status-in-progress", dotClass: "status-dot in-progress" };
}

function priorityBadge(priority: string): string {
  if (priority === "EMERGENCY") {
    return "badge badge-priority-emergency";
  }
  if (priority === "HIGH") {
    return "badge badge-priority-high";
  }
  if (priority === "MEDIUM") {
    return "badge badge-priority-medium";
  }

  return "badge badge-priority-low";
}

function eventTone(event: AdminEvent): string {
  if (event.type === "resolved") {
    return "resolved";
  }
  if (event.type === "alert") {
    return "alert";
  }

  return "new";
}

async function getAdminDashboard(): Promise<AdminDashboardResponse | null> {
  try {
    return await fetchFromBackend<AdminDashboardResponse>("/api/dashboard/admin");
  } catch {
    return null;
  }
}

function queueRow(item: AdminQueueItem, isLast: boolean) {
  const status = statusBadge(item.status);
  const assignmentAvatars = item.assignedAvatars.slice(0, 2);
  const overflowCount = Math.max(0, item.assignedAvatars.length - assignmentAvatars.length);

  return (
    <tr key={item.requestId} className={isLast ? "border-none" : ""}>
      <td className="font-semibold">#{item.ticketCode}</td>
      <td>
        <div className="admin-requester">
          <div className="avatar admin-avatar">
            <Image
              src={item.requesterAvatar}
              alt={item.requesterName}
              width={36}
              height={36}
            />
          </div>
          <div>
            <strong>{item.requesterName}</strong>
            <span>{item.requesterUnit}</span>
          </div>
        </div>
      </td>
      <td>
        <div className="admin-category">
          {categoryIcon(item.category)}
          {item.category}
        </div>
      </td>
      <td>
        <span className={status.className}>
          <span className={status.dotClass} />
          {item.status.replace(/_/g, " ")}
        </span>
      </td>
      <td>
        <span className={priorityBadge(item.priority)}>{item.priority}</span>
      </td>
      <td>
        <div className="admin-assignees">
          {assignmentAvatars.map((avatar, index) => (
            <div
              key={`${item.requestId}-${avatar}`}
              className={`avatar admin-assignee ${index > 0 ? "stacked" : ""}`}
            >
              <Image src={avatar} alt="Assigned staff" width={28} height={28} />
            </div>
          ))}
          {overflowCount > 0 ? (
            <div className="admin-assignee admin-assignee-count">+{overflowCount}</div>
          ) : null}
        </div>
      </td>
      <td className="text-secondary">Read only</td>
    </tr>
  );
}

export default async function AdminDashboard() {
  await requireSession();
  const dashboard = await getAdminDashboard();

  if (!dashboard) {
    return (
      <main className="page-shell">
        <section className="panel">
          <h2 className="text-2xl mb-2">Admin Dashboard Unavailable</h2>
          <p className="text-secondary">
            We could not load admin analytics and dispatch queue data.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-page page-shell">
      <section className="page-hero admin-hero panel animate-slide-up">
        <div>
          <div className="eyebrow">Admin Operations</div>
          <h1 className="page-title">Dispatch coverage with decision-ready detail.</h1>
          <p className="page-description">
            Review open work, high-priority exposure, field unit capacity, and
            the live event stream from one coordinated administrative view.
          </p>
        </div>

        <div className="admin-metric-grid">
          <article className="admin-metric-card">
            <div className="admin-metric-icon">
              <ClipboardList size={18} />
            </div>
            <span>Total open</span>
            <strong>{dashboard.stats.totalOpen}</strong>
            <p>Requests still active across the board.</p>
          </article>
          <article className="admin-metric-card emphasis">
            <div className="admin-metric-icon">
              <AlertOctagon size={18} />
            </div>
            <span>High priority</span>
            <strong>{dashboard.stats.highPriority}</strong>
            <p>Requests needing fast operational attention.</p>
          </article>
          <article className="admin-metric-card">
            <div className="admin-metric-icon">
              <Timer size={18} />
            </div>
            <span>Average resolution</span>
            <strong>{dashboard.stats.avgResolution}</strong>
            <p>Current average closeout time.</p>
          </article>
          <article className="admin-metric-card">
            <div className="admin-metric-icon">
              <CheckCircle2 size={18} />
            </div>
            <span>Resolved today</span>
            <strong>{dashboard.stats.resolvedToday}</strong>
            <p>Closed successfully in the current reporting window.</p>
          </article>
        </div>
      </section>

      <section className="panel admin-table-panel animate-slide-up delay-100">
        <div className="section-header">
          <div>
            <h3>Active dispatch queue</h3>
            <p>Requests currently visible to the administrative control desk.</p>
          </div>
        </div>

        <div className="admin-table-shell">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Requester</th>
                <th>Category</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Assignment</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {dashboard.queue.map((item, index) =>
                queueRow(item, index === dashboard.queue.length - 1),
              )}
            </tbody>
          </table>
        </div>

        <div className="admin-table-footer">
          <span>
            Showing {dashboard.queue.length} of {dashboard.stats.totalOpen} active
            requests
          </span>
          <span>Live operational snapshot</span>
        </div>
      </section>

      <div className="admin-bottom-grid">
        <section className="panel animate-slide-up delay-200">
          <div className="section-header">
            <div>
              <h3>Field unit status</h3>
              <p>Coverage mix across support teams right now.</p>
            </div>
          </div>

          <div className="admin-field-unit-list">
            {dashboard.fieldUnits.map((unit) => (
              <article key={unit.label} className="admin-field-unit">
                <div className="admin-field-unit-head">
                  <span>{unit.label}</span>
                  <strong>{unit.count}</strong>
                </div>
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${unit.percentage}%` }}
                  />
                </div>
                <p>{unit.percentage}% of total active unit distribution.</p>
              </article>
            ))}
          </div>
        </section>

        <section className="panel animate-slide-up delay-300">
          <div className="section-header">
            <div>
              <h3>Event stream</h3>
              <p>Incoming operational signals and recent completions.</p>
            </div>
          </div>

          <div className="admin-event-stream">
            {dashboard.eventStream.map((event) => (
              <article
                key={event.id}
                className={`admin-event-item ${eventTone(event)}`}
              >
                <div className="admin-event-icon">
                  {event.type === "resolved" ? (
                    <CheckCircle2 size={16} />
                  ) : event.type === "alert" ? (
                    <AlertOctagon size={16} />
                  ) : (
                    <Users size={16} />
                  )}
                </div>
                <div className="admin-event-copy">
                  <p>{event.text}</p>
                  <span>{event.timestampLabel}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
