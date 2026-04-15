"use client";

import React, { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type FeedbackState =
  | { type: "error"; message: string }
  | null;

export default function LoginForm() {
  const router = useRouter();
  const [enrollmentNumber, setEnrollmentNumber] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          enrollmentNumber,
          password,
        }),
      });

      const body = (await response.json().catch(() => ({
        message: "Unable to sign in.",
      }))) as { message?: string };

      if (!response.ok) {
        setFeedback({
          type: "error",
          message:
            body.message ??
            "Sign in failed. Check your enrollment number and password.",
        });
        return;
      }

      router.replace("/");
      router.refresh();
    } catch {
      setFeedback({
        type: "error",
        message: "Network error while signing in.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="login-card" onSubmit={handleSubmit}>
      <div className="login-card-header">
        <div className="login-badge">STUDENT ACCESS</div>
        <h1 className="login-title">Sign in with your enrollment number</h1>
        <p className="login-subtitle">
          Use your enrollment number as the username. Your password is the first
          four characters of that enrollment number.
        </p>
      </div>

      {feedback ? (
        <div className="ticket-feedback error" role="alert">
          {feedback.message}
        </div>
      ) : null}

      <div className="form-group mb-6">
        <label>ENROLLMENT NUMBER</label>
        <input
          type="text"
          autoComplete="username"
          required
          minLength={4}
          value={enrollmentNumber}
          onChange={(event) => setEnrollmentNumber(event.target.value)}
          placeholder="2401010262"
        />
      </div>

      <div className="form-group mb-6">
        <label>PASSWORD</label>
        <input
          type="password"
          autoComplete="current-password"
          required
          minLength={4}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="First 4 characters"
        />
      </div>

      <div className="login-actions">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary login-submit"
        >
          {isSubmitting ? "Signing In..." : "Sign In"}
        </button>
      </div>
    </form>
  );
}
