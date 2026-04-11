"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ItineraryItem } from "@/lib/types";

const SLOT_COLORS: Record<string, string> = {
  morning_destination: "#38bdf8",
  lunch: "#fbbf24",
  afternoon_destination: "#4ade80",
  dinner: "#f97316",
  evening_activity: "#fb7185",
  morning: "#38bdf8",
  afternoon: "#4ade80",
  evening: "#fb7185",
};

const GOOGLE_MAPS_SCRIPT_ID = "google-maps-js-script";
const DEFAULT_CENTER = { lat: 20, lng: 0 };
const DEFAULT_ZOOM = 2;
const FOCUS_ZOOM = 15;

type Props = {
  items: ItineraryItem[];
  focusedId?: string | null;
  onSelectPin?: (id: string | null) => void;
};

type LatLng = { lat: number; lng: number };
type GoogleMap = {
  fitBounds: (bounds: GoogleLatLngBounds, padding?: number | GooglePadding) => void;
  panTo: (latLng: LatLng) => void;
  setCenter: (latLng: LatLng) => void;
  setZoom: (zoom: number) => void;
};
type GoogleMarker = {
  addListener?: (event: string, listener: () => void) => void;
  setMap: (map: GoogleMap | null) => void;
};
type GoogleLatLngBounds = {
  extend: (latLng: LatLng) => void;
};
type GooglePadding = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};
type GoogleMapsNamespace = {
  Map: new (
    element: HTMLElement,
    options: Record<string, unknown>
  ) => GoogleMap;
  Marker: new (options: Record<string, unknown>) => GoogleMarker;
  LatLngBounds: new () => GoogleLatLngBounds;
  SymbolPath: {
    CIRCLE: number;
  };
  Animation: {
    DROP: number;
  };
};

declare global {
  interface Window {
    google?: {
      maps?: GoogleMapsNamespace;
    };
  }
}

function validCoords(item: ItineraryItem): boolean {
  return (
    Number.isFinite(item.lat) &&
    Number.isFinite(item.lng) &&
    !(item.lat === 0 && item.lng === 0)
  );
}

function markerIcon(color: string, active: boolean): Record<string, unknown> {
  return {
    path: window.google?.maps?.SymbolPath.CIRCLE ?? 0,
    fillColor: color,
    fillOpacity: 1,
    strokeColor: "#ffffff",
    strokeOpacity: 1,
    strokeWeight: 2,
    scale: active ? 10 : 7,
  };
}

function ensureGoogleMapsScript(apiKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.maps) {
      resolve();
      return;
    }

    const existing = document.getElementById(GOOGLE_MAPS_SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Could not load Google Maps")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load Google Maps"));
    document.head.appendChild(script);
  });
}

export function ItineraryMap({ items, focusedId, onSelectPin }: Props) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<GoogleMap | null>(null);
  const markersRef = useRef<GoogleMarker[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const validItems = useMemo(() => items.filter(validCoords), [items]);

  useEffect(() => {
    if (!apiKey || !containerRef.current || mapRef.current) return;

    let active = true;

    void (async () => {
      try {
        await ensureGoogleMapsScript(apiKey);
        if (!active || !containerRef.current || !window.google?.maps) return;

        const map = new window.google.maps.Map(containerRef.current, {
          center: DEFAULT_CENTER,
          zoom: DEFAULT_ZOOM,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          clickableIcons: false,
          gestureHandling: "cooperative",
        });

        mapRef.current = map;
        setMapReady(true);
      } catch (error) {
        if (!active) return;
        setMapError(error instanceof Error ? error.message : "Could not load map");
      }
    })();

    return () => {
      active = false;
      for (const marker of markersRef.current) {
        marker.setMap(null);
      }
      markersRef.current = [];
      mapRef.current = null;
      setMapReady(false);
    };
  }, [apiKey]);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !window.google?.maps) return;

    for (const marker of markersRef.current) {
      marker.setMap(null);
    }
    markersRef.current = [];

    for (const item of validItems) {
      const active = focusedId === item.id;
      const color = SLOT_COLORS[item.timeSlot] ?? "#94a3b8";
      const marker = new window.google.maps.Marker({
        map: mapRef.current,
        position: { lat: item.lat, lng: item.lng },
        title: item.name,
        animation: active ? window.google.maps.Animation.DROP : undefined,
        icon: markerIcon(color, active),
      });

      marker.addListener?.("click", () => {
        onSelectPin?.(item.id);
      });

      markersRef.current.push(marker);
    }

    if (validItems.length === 0) {
      mapRef.current.setCenter(DEFAULT_CENTER);
      mapRef.current.setZoom(DEFAULT_ZOOM);
      return;
    }

    if (validItems.length === 1) {
      mapRef.current.setCenter({ lat: validItems[0].lat, lng: validItems[0].lng });
      mapRef.current.setZoom(focusedId ? FOCUS_ZOOM : 12);
      return;
    }

    const bounds = new window.google.maps.LatLngBounds();
    for (const item of validItems) {
      bounds.extend({ lat: item.lat, lng: item.lng });
    }
    mapRef.current.fitBounds(bounds, { top: 48, right: 48, bottom: 48, left: 48 });
  }, [focusedId, mapReady, onSelectPin, validItems]);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !focusedId) return;

    const item = validItems.find((entry) => entry.id === focusedId);
    if (!item) return;

    mapRef.current.panTo({ lat: item.lat, lng: item.lng });
    mapRef.current.setZoom(FOCUS_ZOOM);
  }, [focusedId, mapReady, validItems]);

  if (!apiKey) {
    return (
      <div className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-surface-muted bg-surface p-6 text-center">
        <p className="font-display text-base font-semibold text-ink">Map disabled</p>
        <p className="mt-2 max-w-sm text-sm text-ink-muted">
          Add <code className="rounded bg-surface-muted px-1">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code>{" "}
          to <code className="rounded bg-surface-muted px-1">.env.local</code> to show itinerary
          pins.
        </p>
      </div>
    );
  }

  if (mapError) {
    return (
      <div className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-coral/40 bg-surface p-6 text-center">
        <p className="font-display text-base font-semibold text-ink">Map unavailable</p>
        <p className="mt-2 max-w-sm text-sm text-ink-muted">{mapError}</p>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[320px] overflow-hidden rounded-2xl border border-surface-muted">
      {!mapReady && <div className="absolute inset-0 animate-pulse bg-surface-muted" />}
      <div ref={containerRef} className="h-full min-h-[320px] w-full" />
    </div>
  );
}
