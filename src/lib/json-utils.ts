/**
 * Strip markdown fences and parse JSON (some models still wrap output in ```json ... ```).
 */
export function parseJsonLoose(raw: string): unknown {
  let t = raw.trim();
  const fence = /^```(?:json)?\s*([\s\S]*?)```$/im.exec(t);
  if (fence) t = fence[1].trim();

  const parsedDirect = tryParseJsonCandidates(t);
  if (parsedDirect.ok) return parsedDirect.value;

  const extracted = extractFirstJsonBlock(t);
  if (extracted) {
    const parsedExtracted = tryParseJsonCandidates(extracted);
    if (parsedExtracted.ok) return parsedExtracted.value;
  }

  throw parsedDirect.error ?? new Error("Could not parse JSON");
}

function tryParseJsonCandidates(input: string): { ok: true; value: unknown } | { ok: false; error: Error | null } {
  const candidates = [input, stripTrailingCommas(input)];
  let lastError: Error | null = null;

  for (const candidate of candidates) {
    try {
      return { ok: true, value: JSON.parse(candidate) };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Invalid JSON");
    }
  }

  return { ok: false, error: lastError };
}

function stripTrailingCommas(input: string): string {
  return input.replace(/,\s*([}\]])/g, "$1");
}

function extractFirstJsonBlock(input: string): string | null {
  const objectStart = input.indexOf("{");
  const arrayStart = input.indexOf("[");
  let start = -1;

  if (objectStart === -1) start = arrayStart;
  else if (arrayStart === -1) start = objectStart;
  else start = Math.min(objectStart, arrayStart);

  if (start === -1) return null;

  const openChar = input[start];
  const closeChar = openChar === "[" ? "]" : "}";
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < input.length; i++) {
    const ch = input[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
      continue;
    }

    if (ch === openChar) depth++;
    if (ch === closeChar) depth--;

    if (depth === 0) {
      return input.slice(start, i + 1);
    }
  }

  return input.slice(start);
}
