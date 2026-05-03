"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          padding: "2rem",
          fontFamily: "system-ui, sans-serif",
          maxWidth: "42rem",
          margin: "0 auto",
        }}
      >
        <h1 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>
          Application error
        </h1>
        <pre
          style={{
            fontSize: "0.875rem",
            overflow: "auto",
            padding: "1rem",
            background: "#f5f5f5",
            borderRadius: "8px",
          }}
        >
          {error.message}
        </pre>
        <button
          type="button"
          onClick={() => reset()}
          style={{
            marginTop: "1rem",
            padding: "0.5rem 1rem",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
