"use client";

import { type FormEvent, useState } from "react";
import { Eye, EyeOff, KeyRound, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";

type FeedbackState = { type: "error"; message: string } | null;

export default function LoginForm() {
  const router = useRouter();
  const [enrollmentNumber, setEnrollmentNumber] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
        <div className="login-badge">Student Sign In</div>
        <h1 className="login-title">Access your service workspace</h1>
        <p className="login-subtitle">
          Sign in with your enrollment number and your assigned password to
          review seating details, raise support issues, and track request
          progress.
        </p>
      </div>

      {feedback ? (
        <div className="ticket-feedback error" role="alert">
          {feedback.message}
        </div>
      ) : null}

      <div className="form-group mb-6">
        <label htmlFor="enrollment-number">Enrollment Number</label>
        <div className="login-input-shell">
          <UserRound size={18} className="login-input-icon" />
          <input
            id="enrollment-number"
            type="text"
            autoComplete="username"
            required
            minLength={4}
            value={enrollmentNumber}
            onChange={(event) => setEnrollmentNumber(event.target.value)}
            placeholder="Enter your enrollment number"
          />
        </div>
      </div>

      <div className="form-group mb-4">
        <label htmlFor="student-password">Password</label>
        <div className="login-input-shell">
          <KeyRound size={18} className="login-input-icon" />
          <input
            id="student-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            minLength={4}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
          />
          <button
            type="button"
            className="login-password-toggle"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div className="login-help">
        Credential issues are handled by the contest coordination desk. Contact
        the admin team if access does not work.
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
