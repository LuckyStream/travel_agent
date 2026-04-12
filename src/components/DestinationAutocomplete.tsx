"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { Loader2, MapPin, Search } from "lucide-react";
import {
  filterDestinationSuggestions,
  type DestinationSuggestion,
} from "@/lib/destination-suggestions";

type PlacesPrediction = { description: string; placeId: string };

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  onSelectSuggestion?: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  /** Rounded search control on the right — calls `onSubmit` (same as Enter). */
  showSearchButton?: boolean;
};

function mergeSuggestions(
  google: DestinationSuggestion[],
  local: DestinationSuggestion[],
  maxTotal: number
): DestinationSuggestion[] {
  const seen = new Set<string>();
  const out: DestinationSuggestion[] = [];
  const push = (s: DestinationSuggestion) => {
    const k = s.value.toLowerCase();
    if (seen.has(k)) return;
    seen.add(k);
    out.push(s);
  };
  for (const g of google) push(g);
  for (const l of local) {
    push(l);
    if (out.length >= maxTotal) break;
  }
  return out;
}

export function DestinationAutocomplete({
  value,
  onChange,
  onSubmit,
  onSelectSuggestion,
  placeholder = "Search destinations...",
  className = "",
  inputClassName = "",
  showSearchButton = false,
}: Props) {
  const listId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [googleSuggestions, setGoogleSuggestions] = useState<DestinationSuggestion[]>([]);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [placesConfigured, setPlacesConfigured] = useState<boolean | null>(null);

  const localSuggestions = useMemo(() => filterDestinationSuggestions(value), [value]);

  const suggestions = useMemo(
    () => mergeSuggestions(googleSuggestions, localSuggestions, 12),
    [googleSuggestions, localSuggestions]
  );

  useEffect(() => {
    setActiveIndex(-1);
  }, [value, suggestions.length]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  useEffect(() => {
    const q = value.trim();
    if (q.length < 2) {
      setGoogleSuggestions([]);
      setPlacesLoading(false);
      return;
    }

    const ac = new AbortController();
    const timer = window.setTimeout(async () => {
      setPlacesLoading(true);
      try {
        const res = await fetch(`/api/places-autocomplete?q=${encodeURIComponent(q)}`, {
          signal: ac.signal,
        });
        const data = (await res.json()) as {
          predictions?: PlacesPrediction[];
          configured?: boolean;
        };
        if (ac.signal.aborted) return;
        if (typeof data.configured === "boolean") setPlacesConfigured(data.configured);
        const preds = (data.predictions ?? []).map((p) => ({ value: p.description }));
        setGoogleSuggestions(preds);
      } catch {
        if (!ac.signal.aborted) setGoogleSuggestions([]);
      } finally {
        if (!ac.signal.aborted) setPlacesLoading(false);
      }
    }, 280);

    return () => {
      clearTimeout(timer);
      ac.abort();
    };
  }, [value]);

  const selectSuggestion = useCallback(
    (suggestion: DestinationSuggestion) => {
      onChange(suggestion.value);
      setIsOpen(false);
      setActiveIndex(-1);
      onSelectSuggestion?.(suggestion.value);
    },
    [onChange, onSelectSuggestion]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (!suggestions.length) {
        if (event.key === "Enter") onSubmit?.();
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setIsOpen(true);
        setActiveIndex((current) => (current + 1) % suggestions.length);
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setIsOpen(true);
        setActiveIndex((current) => (current <= 0 ? suggestions.length - 1 : current - 1));
        return;
      }

      if (event.key === "Escape") {
        setIsOpen(false);
        setActiveIndex(-1);
        return;
      }

      if (event.key === "Enter") {
        if (isOpen && activeIndex >= 0) {
          event.preventDefault();
          selectSuggestion(suggestions[activeIndex]);
          onSubmit?.();
          return;
        }
        onSubmit?.();
      }
    },
    [activeIndex, isOpen, onSubmit, suggestions, selectSuggestion]
  );

  const showList =
    isOpen &&
    (suggestions.length > 0 ||
      (placesLoading && value.trim().length >= 2 && placesConfigured !== false));

  const inputEl = (
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      autoComplete="off"
      aria-autocomplete="list"
      onFocus={() => setIsOpen(true)}
      onChange={(event) => {
        onChange(event.target.value);
        setIsOpen(true);
      }}
      onKeyDown={handleKeyDown}
      className={showSearchButton ? `${inputClassName} pr-14` : inputClassName}
    />
  );

  return (
    <div
      ref={wrapperRef}
      className={`relative ${className}`}
      role="combobox"
      aria-expanded={showList}
      aria-controls={listId}
      aria-haspopup="listbox"
    >
      {showSearchButton ? (
        <div className="relative w-full">
          {inputEl}
          <button
            type="button"
            aria-label="Search"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setIsOpen(false);
              onSubmit?.();
            }}
            className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition hover:bg-foreground/5 hover:text-foreground"
          >
            <Search className="h-5 w-5" strokeWidth={2.25} />
          </button>
        </div>
      ) : (
        inputEl
      )}

      {showList ? (
        <div
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-[100] max-h-72 overflow-y-auto rounded-2xl border border-stone-300 bg-stone-50 shadow-[0_16px_40px_rgba(0,0,0,0.22)]"
        >
          {placesLoading && suggestions.length === 0 ? (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
              Searching Google Places…
            </div>
          ) : null}
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.value}-${index}`}
              type="button"
              role="option"
              aria-selected={activeIndex === index}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => selectSuggestion(suggestion)}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors ${
                activeIndex === index
                  ? "bg-stone-200 text-stone-950"
                  : "text-stone-900 hover:bg-stone-100"
              }`}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-stone-200 text-primary">
                <MapPin className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">{suggestion.value}</span>
              {index < googleSuggestions.length ? (
                <span className="shrink-0 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  Google
                </span>
              ) : null}
            </button>
          ))}
          {placesConfigured === false && suggestions.length > 0 && value.trim().length >= 2 ? (
            <p className="border-t border-stone-200 px-4 py-2 text-[10px] text-muted-foreground">
              Add GOOGLE_PLACES_API_KEY for live place search; showing popular picks only.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
