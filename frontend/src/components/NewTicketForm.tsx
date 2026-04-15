"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Info,
  Monitor,
  Package,
  Shield,
  Trash2,
  UploadCloud,
  Wrench,
} from "lucide-react";
import type {
  CreateRequestResponse,
  TicketFormConfigResponse,
} from "@/lib/api/types";

interface NewTicketFormProps {
  config: TicketFormConfigResponse;
}

type FeedbackState =
  | { type: "success"; message: string }
  | { type: "error"; message: string }
  | null;

function categoryIcon(code: string) {
  if (code === "MAINTENANCE") {
    return <Wrench size={22} />;
  }
  if (code === "IT_SUPPORT") {
    return <Monitor size={22} />;
  }
  if (code === "SECURITY") {
    return <Shield size={22} />;
  }
  if (code === "SUPPLIES") {
    return <Package size={22} />;
  }

  return <Trash2 size={22} />;
}

function categoryDescription(code: string): string {
  if (code === "MAINTENANCE") {
    return "Physical repairs, HVAC, lighting, and infrastructure issues.";
  }
  if (code === "IT_SUPPORT") {
    return "Connectivity, devices, projector, and classroom technical support.";
  }
  if (code === "SECURITY") {
    return "Access, permissions, coordination, and on-site safety support.";
  }
  if (code === "SUPPLIES") {
    return "Operational materials, logistics, and workspace supply needs.";
  }

  return "Cleaning, disposal, and recurring upkeep support.";
}

function priorityDescription(priority: string): string {
  switch (priority) {
    case "LOW":
      return "Routine issue with standard response time.";
    case "MEDIUM":
      return "Needs attention soon but is not service critical.";
    case "HIGH":
      return "Causing disruption and should be handled quickly.";
    case "EMERGENCY":
      return "Critical issue affecting safety or major operations.";
    default:
      return priority;
  }
}

export default function NewTicketForm({ config }: NewTicketFormProps) {
  const [category, setCategory] = useState(
    config.categories[0]?.code ?? "MAINTENANCE",
  );
  const [priority, setPriority] = useState(config.priorities[0] ?? "LOW");
  const [title, setTitle] = useState("");
  const [building, setBuilding] = useState("");
  const [room, setRoom] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  const selectedCategory = useMemo(
    () => config.categories.find((item) => item.code === category),
    [category, config.categories],
  );

  const resetForm = () => {
    setCategory(config.categories[0]?.code ?? "MAINTENANCE");
    setPriority(config.priorities[0] ?? "LOW");
    setTitle("");
    setBuilding("");
    setRoom("");
    setDescription("");
    setFeedback(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);
    setIsSubmitting(true);

    try {
      const payload = {
        title,
        description,
        category,
        building,
        room,
        priority,
      };

      const response = await fetch("/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const body = (await response.json().catch(() => ({ message: "Request failed" }))) as
        | (CreateRequestResponse & { message?: string })
        | { message?: string };

      if (!response.ok || !("ticketCode" in body)) {
        setFeedback({
          type: "error",
          message:
            body.message ?? "Could not create request. Please verify your details.",
        });
        return;
      }

      setFeedback({
        type: "success",
        message: `Request submitted successfully. Ticket #${body.ticketCode} is now ${body.status.replace(
          /_/g,
          " ",
        )}.`,
      });
      setTitle("");
      setBuilding("");
      setRoom("");
      setDescription("");
      setPriority(config.priorities[0] ?? "LOW");
    } catch {
      setFeedback({
        type: "error",
        message: "Network error while submitting your request.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="ticket-page page-shell">
      <section className="page-hero ticket-hero panel animate-slide-up">
        <div>
          <div className="eyebrow">New Service Request</div>
          <h1 className="page-title">Create a request with the right operational context.</h1>
          <p className="page-description">
            Choose the service area, describe the issue clearly, and submit a
            backend-connected ticket that appears immediately in the request
            board.
          </p>
        </div>

        <div className="ticket-step-strip">
          <div className="ticket-step active">
            <span>1</span>
            <strong>Category</strong>
          </div>
          <div className="ticket-step active">
            <span>2</span>
            <strong>Location</strong>
          </div>
          <div className="ticket-step active">
            <span>3</span>
            <strong>Priority</strong>
          </div>
        </div>
      </section>

      {feedback ? (
        <div className={`ticket-feedback ${feedback.type}`} role="status" aria-live="polite">
          <span>{feedback.message}</span>
          {feedback.type === "success" ? (
            <Link href="/requests" className="ticket-feedback-link">
              View request board
            </Link>
          ) : null}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="ticket-form-layout">
        <div className="ticket-form-main">
          <section className="panel animate-slide-up delay-100">
            <div className="section-header">
              <div>
                <h3>Choose a service category</h3>
                <p>Start with the team or service area best suited to the issue.</p>
              </div>
            </div>

            <div className="ticket-category-grid">
              {config.categories.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  className={`ticket-category-card ${
                    item.code === category ? "selected" : ""
                  }`}
                  onClick={() => setCategory(item.code)}
                >
                  <div className="ticket-category-icon">{categoryIcon(item.code)}</div>
                  <div className="ticket-category-copy">
                    <h4>{item.label}</h4>
                    <p>{categoryDescription(item.code)}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="panel animate-slide-up delay-200">
            <div className="section-header">
              <div>
                <h3>Location and issue details</h3>
                <p>Write the issue clearly so the assigned team can act quickly.</p>
              </div>
            </div>

            <div className="form-group mb-6">
              <label htmlFor="ticket-title">Issue title</label>
              <input
                id="ticket-title"
                type="text"
                required
                minLength={6}
                maxLength={120}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Short summary of the issue"
              />
            </div>

            <div className="ticket-field-grid">
              <div className="form-group">
                <label htmlFor="ticket-building">Building name</label>
                <input
                  id="ticket-building"
                  type="text"
                  required
                  minLength={2}
                  maxLength={100}
                  value={building}
                  onChange={(event) => setBuilding(event.target.value)}
                  placeholder="North Wing - Engineering Complex"
                />
              </div>

              <div className="form-group">
                <label htmlFor="ticket-room">Room or area</label>
                <input
                  id="ticket-room"
                  type="text"
                  required
                  minLength={1}
                  maxLength={50}
                  value={room}
                  onChange={(event) => setRoom(event.target.value)}
                  placeholder="e.g. C 103 or Projector Bay"
                />
              </div>
            </div>

            <div className="form-group mb-6">
              <label htmlFor="ticket-description">Issue description</label>
              <textarea
                id="ticket-description"
                rows={5}
                required
                minLength={10}
                maxLength={2000}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe what is happening, what is affected, and anything the team should know before arriving."
              />
            </div>

            <div className="ticket-upload-note">
              <UploadCloud size={20} />
              Attachment upload is reserved for the next release. For now, place
              the most important context in the description field.
            </div>
          </section>

          <section className="panel animate-slide-up delay-300">
            <div className="section-header">
              <div>
                <h3>Set response priority</h3>
                <p>Choose the urgency level that matches operational impact.</p>
              </div>
            </div>

            <div className="ticket-priority-grid">
              {config.priorities.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`ticket-priority-card ${priority === item ? "selected" : ""}`}
                  onClick={() => setPriority(item)}
                  aria-pressed={priority === item}
                >
                  <strong>{item.replace(/_/g, " ")}</strong>
                  <p>{priorityDescription(item)}</p>
                </button>
              ))}
            </div>
          </section>
        </div>

        <aside className="ticket-form-side">
          <div className="ticket-side-stack">
            <section className="panel ticket-summary-panel animate-slide-up delay-200">
              <div className="section-header">
                <div>
                  <h3>Request summary</h3>
                  <p>Review the final context before submitting.</p>
                </div>
              </div>

              <div className="ticket-summary-row">
                <span>Category</span>
                <strong>{selectedCategory?.label ?? "Maintenance"}</strong>
              </div>
              <div className="ticket-summary-row">
                <span>Location</span>
                <strong>{building || "Not set"}{room ? ` · ${room}` : ""}</strong>
              </div>
              <div className="ticket-summary-row">
                <span>Priority</span>
                <strong>{priority.replace(/_/g, " ")}</strong>
              </div>
              <div className="ticket-summary-row">
                <span>SLA goal</span>
                <strong>{config.slaGoal}</strong>
              </div>
            </section>

            <section className="panel animate-slide-up delay-300">
              <div className="section-header">
                <div>
                  <h3>Technical guidelines</h3>
                  <p>Helpful context that speeds up the first response.</p>
                </div>
              </div>

              <ul className="ticket-guidelines">
                {config.guidelines.map((item) => (
                  <li key={item}>
                    <Info size={16} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="ticket-status-card animate-slide-up delay-400">
              <div
                className="ticket-status-image"
                style={{ backgroundImage: `url('${config.campusStatus.imageUrl}')` }}
              />
              <div className="ticket-status-copy">
                <span className="badge badge-primary">{config.campusStatus.label}</span>
                <h3>{config.campusStatus.message}</h3>
                <p>
                  This operational banner is pulled into the form so students
                  keep the current campus service posture in view while filing a
                  request.
                </p>
              </div>
            </section>
          </div>
        </aside>

        <div className="ticket-actions animate-slide-up delay-400">
          <button type="button" onClick={resetForm} className="btn btn-outline">
            Reset Form
          </button>
          <button type="submit" disabled={isSubmitting} className="btn btn-primary">
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </form>
    </main>
  );
}
