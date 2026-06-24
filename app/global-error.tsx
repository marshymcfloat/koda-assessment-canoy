"use client"; // Error boundaries must be Client Components.

/**
 * Replaces the root layout when an error is thrown above the page boundary, so
 * it must render its own <html>/<body>.
 */
export default function GlobalError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          padding: "1.5rem",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: "28rem" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600 }}>
            Something went wrong
          </h2>
          <p style={{ color: "#6b7280", marginTop: "0.5rem" }}>
            An unexpected error occurred. Please try again.
          </p>
          <button
            onClick={() => unstable_retry()}
            style={{
              marginTop: "1.25rem",
              cursor: "pointer",
              borderRadius: "0.5rem",
              background: "#4f46e5",
              color: "white",
              padding: "0.5rem 1rem",
              border: "none",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
