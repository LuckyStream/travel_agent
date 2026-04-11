"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { DEFAULT_TRIP_DAYS, type ChatMessage } from "@/lib/types";

type Props = {
  open?: boolean;
  onClose?: () => void;
  /** Carried to preferences when the user continues from chat. */
  tripDays?: number;
  variant?: "modal" | "inline";
  className?: string;
  onConfirmDestination?: (destination: string) => void;
};

const INTRO_TEXT =
  "Tell me what kind of trip you want and I will suggest destinations.";

export function DestinationChat({
  open = true,
  onClose,
  tripDays = DEFAULT_TRIP_DAYS,
  variant = "modal",
  className = "",
  onConfirmDestination,
}: Props) {
  const router = useRouter();
  const [thread, setThread] = useState<ChatMessage[]>([
    { role: "assistant", content: INTRO_TEXT },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setThread([{ role: "assistant", content: INTRO_TEXT }]);
    setError(null);
    setInput("");
    setLoading(false);
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread, open, loading, error]);

  const lastConfirmed = [...thread]
    .reverse()
    .find((m) => m.role === "assistant" && m.confirmedDestination)?.confirmedDestination;
  const destinationLocked = Boolean(lastConfirmed);
  const continueLabel = lastConfirmed ? `Continue with ${lastConfirmed}` : null;

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading || destinationLocked) return;
    setError(null);
    setInput("");
    const nextThread: ChatMessage[] = [...thread, { role: "user", content: text }];
    setThread(nextThread);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextThread }),
      });
      const data = (await res.json()) as {
        message?: string;
        confirmedDestination?: string | null;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      const reply = data.message?.trim();
      if (!reply) throw new Error("Empty reply");
      const confirmed =
        typeof data.confirmedDestination === "string" && data.confirmedDestination.trim()
          ? data.confirmedDestination.trim()
          : null;
      setThread((t) => [
        ...t,
        { role: "assistant", content: reply, confirmedDestination: confirmed },
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setThread((t) => t.slice(0, -1));
      setInput(text);
    } finally {
      setLoading(false);
    }
  }, [input, loading, thread, destinationLocked]);

  const onContinue = () => {
    if (!lastConfirmed) return;
    if (onConfirmDestination) {
      onConfirmDestination(lastConfirmed);
      onClose?.();
      return;
    }
    router.push(
      `/preferences?destination=${encodeURIComponent(lastConfirmed)}&days=${tripDays}`
    );
    onClose?.();
  };

  const startOver = () => {
    setThread([]);
    setError(null);
    setInput("");
  };

  if (variant === "modal" && !open) return null;

  const title = "Ask AI Suggestions";
  const shellClasses =
    variant === "modal"
      ? "flex max-h-[min(620px,88vh)] w-full max-w-3xl flex-col rounded-2xl border border-border bg-card shadow-xl"
      : "flex min-h-[320px] w-full flex-col rounded-[32px] border border-primary-foreground/10 bg-card/75 shadow-[0_18px_50px_rgba(0,0,0,0.16)] backdrop-blur-xl";
  const body = (
    <div className={`${shellClasses} ${className}`.trim()}>
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h2 id="chat-title" className="font-display text-3xl font-bold italic text-foreground">
            {title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Chat to discover your destination.
          </p>
        </div>
        {variant === "modal" && onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            Close
          </button>
        ) : null}
      </div>

      <div
        className={`min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3 ${
          variant === "inline" ? "max-h-[360px]" : "h-[420px]"
        }`}
      >
        {thread.map((msg, i) => (
          <div
            key={`${msg.role}-${i}-${msg.content.slice(0, 12)}`}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {destinationLocked && continueLabel && (
          <div className="flex justify-center pt-1">
            <button
              type="button"
              onClick={onContinue}
              className="flex items-center justify-center gap-2 rounded-md bg-foreground px-5 py-3 text-sm font-semibold text-background hover:opacity-90"
            >
              <Sparkles className="h-4 w-4" />
              {continueLabel}
            </button>
          </div>
        )}

        {destinationLocked && (
          <p className="text-center">
            <button
              type="button"
              onClick={startOver}
              className="text-xs text-muted-foreground underline hover:text-primary"
            >
              Start over with a different place
            </button>
          </p>
        )}

        {loading && <p className="text-center text-sm text-muted-foreground">Sending...</p>}
        {error && (
          <p className="text-center text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        <div ref={bottomRef} />
      </div>

      <div
        className={`flex gap-2 border-t border-border p-4 ${
          destinationLocked ? "opacity-50" : ""
        }`}
      >
        <input
          className="flex-1 rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring disabled:cursor-not-allowed"
          placeholder={
            destinationLocked ? "Destination confirmed - use Continue above" : "Describe your ideal trip..."
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), void send())}
          disabled={loading || destinationLocked}
          aria-label="Chat message"
        />
        <button
          type="button"
          onClick={() => void send()}
          disabled={loading || !input.trim() || destinationLocked}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-40"
        >
          Send
        </button>
      </div>
    </div>
  );

  if (variant === "inline") {
    return body;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div role="dialog" aria-labelledby="chat-title">
        {body}
      </div>
    </div>
  );
}
