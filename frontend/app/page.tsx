"use client";

import { useEffect, useState } from "react";

/** Smoke test: same-origin fetch proxied by Next to FastAPI (see `rewrites` in next.config). */
export default function Home() {
  const [line, setLine] = useState<string>("…");

  useEffect(() => {
    const url = "/api/backend/health";
    fetch(url)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status} from ${url}`);
        }
        return res.json() as Promise<{ status?: string }>;
      })
      .then((data) => setLine(`backend: ${JSON.stringify(data)}`))
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : String(err);
        setLine(`error: ${message}`);
      });
  }, []);

  return (
    <main style={{ padding: "1.5rem" }}>
      <h1>MJC Chatbot</h1>
      <p>Frontend scaffold — API check:</p>
      <pre>{line}</pre>
    </main>
  );
}
