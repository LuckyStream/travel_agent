"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import {
  filterDestinationSuggestions,
  type DestinationSuggestion,
} from "@/lib/destination-suggestions";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  onSelectSuggestion?: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
};

export function DestinationAutocomplete({
  value,
  onChange,
  onSubmit,
  onSelectSuggestion,
  placeholder = "Search destinations...",
  className = "",
  inputClassName = "",
}: Props) {
  const listId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const suggestions = useMemo(() => filterDestinationSuggestions(value), [value]);

  useEffect(() => {
    setActiveIndex(-1);
  }, [value]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const selectSuggestion = (suggestion: DestinationSuggestion) => {
    onChange(suggestion.value);
    setIsOpen(false);
    setActiveIndex(-1);
    onSelectSuggestion?.(suggestion.value);
  };

  return (
    <div
      ref={wrapperRef}
      className={`relative ${className}`}
      role="combobox"
      aria-expanded={isOpen && suggestions.length > 0}
      aria-controls={listId}
      aria-haspopup="listbox"
    >
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
        onKeyDown={(event) => {
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
        }}
        className={inputClassName}
      />

      {isOpen && suggestions.length > 0 ? (
        <div
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-30 max-h-72 overflow-y-auto rounded-2xl border border-stone-300 bg-stone-50 shadow-[0_16px_40px_rgba(0,0,0,0.22)]"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.value}
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
              <span>{suggestion.value}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
