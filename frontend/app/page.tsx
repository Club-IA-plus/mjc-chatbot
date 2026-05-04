"use client";

import { useEffect, useState } from "react";
import { Chat } from "@/components/Chat";
import styles from "./page.module.css";

/** Home: chat UI plus optional backend health indicator. */
export default function Home() {
  const [health, setHealth] = useState<string>("…");

  useEffect(() => {
    const url = "/api/backend/health";
    fetch(url)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json() as Promise<{ status?: string }>;
      })
      .then((data) => setHealth(data.status === "ok" ? "OK" : JSON.stringify(data)))
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : String(err);
        setHealth(`erreur: ${message}`);
      });
  }, []);

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.title}>MJC Chatbot</h1>
        <p className={styles.sub}>
          Assistant MJC Fécamp — API{" "}
          <span className={styles.badge} title="GET /health via proxy">
            {health}
          </span>
        </p>
      </header>
      <Chat />
    </main>
  );
}
