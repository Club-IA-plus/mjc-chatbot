"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./Chat.module.css";

type Role = "user" | "assistant";

export type UiMessage = { id: string; role: Role; content: string };

/** Stable id without `crypto.randomUUID()` (insecure HTTP blocks it on some browsers). */
function createMessageId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/** Renders the chat thread and posts turns to `POST /api/v1/chat` via the Next.js rewrite. */
export function Chat() {
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    const el = listRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const send = async () => {
    if (sending) {
      return;
    }
    const text = draft.trim();
    if (!text) {
      return;
    }
    setError(null);
    const userMsg: UiMessage = {
      id: createMessageId(),
      role: "user",
      content: text,
    };
    const nextThread = [...messages, userMsg];
    setMessages(nextThread);
    setDraft("");
    setSending(true);
    const url = "/api/backend/api/v1/chat";
    const payload = {
      messages: nextThread.map((m) => ({ role: m.role, content: m.content })),
    };
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        let detail = res.statusText;
        try {
          const errBody = (await res.json()) as { detail?: unknown };
          if (errBody.detail !== undefined) {
            detail = JSON.stringify(errBody.detail);
          }
        } catch {
          /* ignore non-JSON error bodies */
        }
        throw new Error(`HTTP ${res.status}: ${detail}`);
      }
      const data = (await res.json()) as { reply: string };
      if (typeof data.reply !== "string" || !data.reply) {
        throw new Error("Invalid response: missing reply string");
      }
      setMessages((prev) => [
        ...prev,
        { id: createMessageId(), role: "assistant", content: data.reply },
      ]);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      setError(message);
      setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
      setDraft(text);
    } finally {
      setSending(false);
    }
  };

  return (
    <section className={styles.wrap} aria-label="Conversation avec le chatbot">
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
      <div ref={listRef} className={styles.messages}>
        {messages.length === 0 ? (
          <p className={styles.hint}>
            Posez une question sur la MJC. Les réponses s&apos;appuient sur les fichiers
            indexés (`make dev-data`).
          </p>
        ) : null}
        {messages.map((m) => (
          <div
            key={m.id}
            className={m.role === "user" ? styles.bubbleUser : styles.bubbleBot}
          >
            <span className={styles.meta}>{m.role === "user" ? "Vous" : "Assistant"}</span>
            <p className={styles.text}>{m.content}</p>
          </div>
        ))}
      </div>
      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
      >
        <label className={styles.srOnly} htmlFor="chat-input">
          Votre message
        </label>
        <textarea
          id="chat-input"
          className={styles.input}
          rows={2}
          value={draft}
          disabled={sending}
          placeholder="Écrivez votre message…"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
        />
        <button type="submit" className={styles.send} disabled={sending || !draft.trim()}>
          {sending ? "Envoi…" : "Envoyer"}
        </button>
      </form>
    </section>
  );
}
