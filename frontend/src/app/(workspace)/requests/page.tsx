import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Clock3, MessageSquareText, Paperclip } from "lucide-react";
import { fetchFromBackend } from "@/lib/api/server";
import { requireSession } from "@/lib/auth/session";
import type {
  RequestBoardColumn,
  RequestBoardResponse,
} from "@/lib/api/types";
import "./page.css";

export const metadata: Metadata = {
  title: "Requests Board",
  description:
    "Track service requests by stage, priority, and assignment on the operational board.",
};

async function getRequestBoard(
  userId: string,
): Promise<RequestBoardResponse | null> {
  try {
    return await fetchFromBackend<RequestBoardResponse>(
      `/api/requests/board?userId=${encodeURIComponent(userId)}`,
    );
  } catch {
    return null;
  }
}

function columnToneClass(column: RequestBoardColumn): string {
  if (column.tone === "accent") {
    return "accent";
  }
  if (column.tone === "success") {
    return "success";
  }

  return "neutral";
}

function priorityClass(priority: string): string {
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

function statusClass(status: string): string {
  if (status === "PENDING") {
    return "status-text-pending";
  }
  if (status === "DISPATCHED" || status === "SCHEDULED") {
    return "status-text-dispatched";
  }
  if (status === "RESOLVED") {
    return "status-text-resolved";
  }

  return "status-text-in-progress";
}

function columnDescription(title: string): string {
  if (title.toLowerCase().includes("submitted")) {
    return "Fresh requests waiting for dispatch or review.";
  }
  if (title.toLowerCase().includes("progress")) {
    return "Work that is currently moving with a live assignee.";
  }

  return "Requests approaching verification or recent completion.";
}

export default async function RequestsPage() {
  const session = await requireSession();
  const requestBoard = await getRequestBoard(session.userId);

  if (!requestBoard) {
    return (
      <main className="page-shell">
        <section className="panel">
          <h2 className="text-2xl mb-2">Requests Unavailable</h2>
          <p className="text-secondary">
            Unable to load the service request board from the backend API.
          </p>
        </section>
      </main>
    );
  }

  const totalRequests = requestBoard.columns.reduce(
    (sum, column) => sum + column.count,
    0,
  );
  const activeColumns = requestBoard.columns.filter((column) => column.count > 0).length;

  return (
    <main className="requests-page page-shell">
      <section className="page-hero requests-hero panel animate-slide-up">
        <div>
          <div className="eyebrow">Request Board</div>
          <h1 className="page-title">Manage every request with stage clarity.</h1>
          <p className="page-description">
            View the queue exactly as it progresses from submission to active
            work and final verification, with priority and assignment context
            kept in the same surface.
          </p>
        </div>

        <div className="requests-hero-stats">
          <article className="requests-hero-card">
            <span>Total tracked</span>
            <strong>{String(totalRequests).padStart(2, "0")}</strong>
          </article>
          <article className="requests-hero-card">
            <span>Active stages</span>
            <strong>{String(activeColumns).padStart(2, "0")}</strong>
          </article>
          <article className="requests-hero-card">
            <span>Resident queue</span>
            <strong>{session.name.split(" ")[0]}</strong>
          </article>
        </div>
      </section>

      <div className="requests-toolbar animate-slide-up delay-100">
        <div className="pill">{totalRequests} requests currently visible</div>
        <Link href="/ticket/new" className="btn btn-primary">
          Create New Request
        </Link>
      </div>

      <div className="requests-board">
        {requestBoard.columns.map((column, columnIndex) => (
          <section
            key={column.id}
            className={`panel requests-column ${columnToneClass(column)} animate-slide-up delay-${
              (columnIndex + 2) * 100
            }`}
          >
            <div className="requests-column-header">
              <div>
                <span className="requests-column-kicker">{column.title}</span>
                <h3>{column.count} ticket{column.count === 1 ? "" : "s"}</h3>
                <p>{columnDescription(column.title)}</p>
              </div>
              <span className="badge badge-gray">{column.count}</span>
            </div>

            {column.cards.length === 0 ? (
              <div className="requests-empty">
                <p>No requests are currently in this stage.</p>
              </div>
            ) : (
              <div className="requests-card-stack">
                {column.cards.map((card) => (
                  <article key={card.requestId} className="request-card">
                    <div className="request-card-top">
                      <span className={priorityClass(card.priority)}>
                        {card.priority}
                      </span>
                      <span className="request-card-code">#{card.ticketCode}</span>
                    </div>

                    <h4>{card.title}</h4>
                    <p>{card.description}</p>

                    <div className="request-card-meta">
                      <span>
                        Status:{" "}
                        <strong className={statusClass(card.status)}>
                          {card.status.replace(/_/g, " ")}
                        </strong>
                      </span>
                    </div>

                    <div className="request-card-footer">
                      {card.priority === "EMERGENCY" ? (
                        <div className="request-emergency-flag">
                          <Clock3 size={14} />
                          Exceeding SLA watch
                        </div>
                      ) : (
                        <div className="request-card-signals">
                          <span>
                            <MessageSquareText size={14} />
                            {card.comments}
                          </span>
                          <span>
                            <Paperclip size={14} />
                            {card.attachments}
                          </span>
                        </div>
                      )}

                      <div className="avatar request-assignee">
                        <Image
                          src={card.assigneeAvatar}
                          alt="Assigned staff member"
                          width={30}
                          height={30}
                        />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}
