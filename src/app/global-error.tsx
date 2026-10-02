"use client";

import { useEffect } from "react";

/**
 * Last-resort fallback when the root layout itself fails. Renders its own
 * document and doesn't get globals.css, so it's styled inline.
 */
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b0b0d",
          color: "#f0eee8",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: "0 20px",
        }}
      >
        <title>Just5Up! — temporarily unavailable</title>
        <div>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: 28, marginBottom: 12 }}>
            Just5Up! is taking a pit stop
          </h1>
          <p style={{ color: "#b7b5b0", marginBottom: 24 }}>
            Something went wrong on our side. Please try again in a moment.
          </p>
          <button
            type="button"
            onClick={() => retry()}
            style={{
              background: "#d4af37",
              color: "#141414",
              border: 0,
              borderRadius: 6,
              padding: "10px 20px",
              fontWeight: 700,
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
