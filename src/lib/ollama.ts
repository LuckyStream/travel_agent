const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://127.0.0.1:11434";
export const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "llama3.1:8b";

/** Ollama defaults to num_ctx=4096; our generate-plan prompt (verified list + wiki) often exceeds that and gets truncated → bad JSON. */
function resolvedNumCtx(override?: number): number {
  if (override != null && Number.isFinite(override) && override >= 2048) {
    return Math.min(131072, Math.floor(override));
  }
  const raw = process.env.OLLAMA_NUM_CTX?.trim();
  const n = raw ? Number.parseInt(raw, 10) : 8192;
  if (!Number.isFinite(n) || n < 2048) return 8192;
  return Math.min(131072, n);
}

type OllamaChatMessage = { role: "system" | "user" | "assistant"; content: string };

export async function ollamaChat(
  messages: OllamaChatMessage[],
  options?: { format?: "json"; temperature?: number; numCtx?: number; numPredict?: number }
): Promise<string> {
  const num_ctx = resolvedNumCtx(options?.numCtx);
  const ollamaOptions: Record<string, number> = {
    temperature: options?.temperature ?? 0.6,
    num_ctx,
  };
  if (options?.numPredict != null && Number.isFinite(options.numPredict) && options.numPredict > 0) {
    ollamaOptions.num_predict = Math.min(131072, Math.floor(options.numPredict));
  }

  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages,
      stream: false,
      options: ollamaOptions,
      ...(options?.format === "json" ? { format: "json" } : {}),
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Ollama error ${res.status}: ${text || res.statusText}`);
  }

  const data = (await res.json()) as { message?: { content?: string } };
  const content = data.message?.content;
  if (!content) throw new Error("Ollama returned empty response");
  return content.trim();
}
