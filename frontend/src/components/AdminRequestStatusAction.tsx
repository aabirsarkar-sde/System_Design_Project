"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

const STATUSES = ["PENDING", "DISPATCHED", "IN_PROGRESS", "SCHEDULED", "RESOLVED"] as const;

type RequestStatusValue = (typeof STATUSES)[number];

function isRequestStatus(value: string): value is RequestStatusValue {
  return (STATUSES as readonly string[]).includes(value);
}

function coerceStatus(value: string): RequestStatusValue {
  return isRequestStatus(value) ? value : "PENDING";
}

function labelForStatus(status: string): string {
  return status.replace(/_/g, " ");
}

interface AdminRequestStatusActionProps {
  requestId: string;
  currentStatus: string;
}

export default function AdminRequestStatusAction({ requestId, currentStatus }: AdminRequestStatusActionProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState<RequestStatusValue>(() => coerceStatus(currentStatus));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSelected(coerceStatus(currentStatus));
  }, [currentStatus]);

  function applyUpdate(): void {
    setError(null);
    if (selected === coerceStatus(currentStatus)) {
      return;
    }

    startTransition(() => {
      void (async () => {
        try {
          const response = await fetch(`/api/requests/${encodeURIComponent(requestId)}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: selected }),
          });
          const data = (await response.json().catch(() => ({}))) as { message?: string };

          if (!response.ok) {
            setError(data.message ?? `Update failed (${response.status})`);
            return;
          }

          router.refresh();
        } catch {
          setError("Network error while updating status.");
        }
      })();
    });
  }

  return (
    <div className="admin-status-action">
      <div className="admin-status-action-row">
        <select
          className="admin-status-select"
          value={coerceStatus(selected)}
          onChange={(event) => setSelected(event.target.value)}
          disabled={isPending}
          aria-label="Request status"
        >
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {labelForStatus(status)}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="btn btn-outline"
          disabled={isPending || selected === coerceStatus(currentStatus)}
          onClick={applyUpdate}
        >
          {isPending ? "Saving…" : "Apply"}
        </button>
      </div>
      {error ? <p className="admin-status-error text-xs text-danger mt-1">{error}</p> : null}
    </div>
  );
}
