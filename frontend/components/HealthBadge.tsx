"use client";

import { useEffect, useState } from "react";
import styles from "./HealthBadge.module.css";

type Status = "loading" | "ok" | "error";

export function HealthBadge() {
  const [status, setStatus] = useState<Status>("loading");
  const [label, setLabel] = useState("…");

  useEffect(() => {
    fetch("/api/backend/health")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<{ status?: string }>;
      })
      .then((data) => {
        setStatus("ok");
        setLabel(data.status === "ok" ? "OK" : JSON.stringify(data));
      })
      .catch((err: unknown) => {
        setStatus("error");
        setLabel(err instanceof Error ? err.message : String(err));
      });
  }, []);

  return (
    <span
      className={status === "error" ? styles.badgeError : styles.badge}
      title="GET /health via proxy"
    >
      API {label}
    </span>
  );
}
