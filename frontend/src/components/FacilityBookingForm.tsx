"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { CreateBookingResponse } from "@/lib/api/types";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function toDatetimeLocalValue(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function defaultBookingSlot(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() + 45);
  d.setSeconds(0, 0);
  d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15);
  return toDatetimeLocalValue(d);
}

interface FacilityBookingFormProps {
  facilityId: string;
  facilityName: string;
  available: boolean;
}

export default function FacilityBookingForm({
  facilityId,
  facilityName,
  available,
}: FacilityBookingFormProps) {
  const router = useRouter();
  const [when, setWhen] = useState(() => defaultBookingSlot());
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const minLocal = useMemo(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 1);
    return toDatetimeLocalValue(d);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setMessage(null);
    setError(null);

    if (!available) {
      return;
    }

    const bookingDate = new Date(when);
    if (Number.isNaN(bookingDate.getTime())) {
      setError("Pick a valid date and time.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          facilityId,
          bookingDate: bookingDate.toISOString(),
        }),
      });

      const data = (await response.json()) as CreateBookingResponse & { message?: string };

      if (!response.ok) {
        setError(data.message ?? "Booking failed.");
        return;
      }

      setMessage(`Booked ${facilityName} — ${bookingDate.toLocaleString()}`);
      router.refresh();
    } catch {
      setError("Network error while booking.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!available) {
    return (
      <p className="text-xs text-secondary mt-4 pt-4 border-t border-border">This space is not open for reservations.</p>
    );
  }

  return (
    <form className="fac-booking-form mt-4 pt-4 border-t border-border" onSubmit={(event) => void handleSubmit(event)}>
      <label className="fac-booking-label text-xs text-secondary block mb-1" htmlFor={`book-${facilityId}`}>
        Reserve
      </label>
      <div className="fac-booking-row">
        <input
          id={`book-${facilityId}`}
          type="datetime-local"
          className="fac-booking-input"
          value={when}
          min={minLocal}
          onChange={(event) => setWhen(event.target.value)}
          disabled={submitting}
          required
        />
        <button type="submit" className="btn btn-primary fac-booking-submit" disabled={submitting}>
          {submitting ? "Booking…" : "Book"}
        </button>
      </div>
      {message ? <p className="text-xs text-success mt-2 mb-0">{message}</p> : null}
      {error ? <p className="text-xs text-danger mt-2 mb-0">{error}</p> : null}
    </form>
  );
}
