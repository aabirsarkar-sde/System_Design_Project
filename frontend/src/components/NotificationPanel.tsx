"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import type { NotificationItem, NotificationsListResponse } from "@/lib/api/types";

interface NotificationPanelProps {
  initialUnreadCount: number;
}

function formatTime(iso: string): string {
  try {
    const date = new Date(iso);
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function NotificationPanel({ initialUnreadCount }: NotificationPanelProps) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void (async () => {
      try {
        const response = await fetch("/api/notifications");
        const data = (await response.json()) as NotificationsListResponse & { message?: string };

        if (!response.ok) {
          if (!cancelled) {
            setError(data.message ?? "Could not load notifications.");
            setItems([]);
          }
          return;
        }

        if (!cancelled) {
          setItems(data.notifications ?? []);
        }
      } catch {
        if (!cancelled) {
          setError("Network error.");
          setItems([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent): void {
      const node = wrapRef.current;
      if (!node || !(event.target instanceof Node)) {
        return;
      }

      if (!node.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  const showCount = initialUnreadCount > 0;

  return (
    <div className="notification-panel-wrap" ref={wrapRef}>
      <button
        type="button"
        className="header-icon-btn"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {showCount ? (
          <span className="header-notification-count">{initialUnreadCount}</span>
        ) : null}
      </button>

      {open ? (
        <div
          className="header-notification-dropdown"
          role="region"
          aria-label="Notification list"
        >
          <div className="notification-dropdown-header">
            <span className="font-semibold text-sm">Notifications</span>
          </div>
          <div className="notification-dropdown-body">
            {loading ? <p className="text-xs text-secondary p-3">Loading…</p> : null}
            {!loading && error ? <p className="text-xs text-danger p-3">{error}</p> : null}
            {!loading && !error && items && items.length === 0 ? (
              <p className="text-xs text-secondary p-3">No notifications yet. Updates appear when ticket status changes.</p>
            ) : null}
            {!loading && !error && items && items.length > 0 ? (
              <ul className="notification-list">
                {items.map((notification) => (
                  <li key={notification.notificationId} className="notification-list-item">
                    <p className="notification-list-message text-sm">{notification.message}</p>
                    <time className="notification-list-time text-xs text-secondary" dateTime={notification.sentAt}>
                      {formatTime(notification.sentAt)}
                    </time>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
