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

const MAPBOX_VERSION = "3.21.0";
const MAPBOX_SCRIPT_ID = "mapbox-gl-js-script";
const MAPBOX_STYLE_ID = "mapbox-gl-js-style";
const FLY_ZOOM = 15;
const FLY_DURATION_MS = 1500;

type Props = {
  items: ItineraryItem[];
  focusedId?: string | null;
  onSelectPin?: (id: string | null) => void;
};

type MapboxMarker = {
  remove: () => void;
  setLngLat: (lngLat: [number, number]) => MapboxMarker;
  addTo: (map: MapboxMap) => MapboxMarker;
  getElement: () => HTMLElement;
};

type MapboxMap = {
  addControl: (control: unknown, position?: string) => void;
  remove: () => void;
  flyTo: (options: {
    center: [number, number];
    zoom: number;
    duration: number;
    essential: boolean;
  }) => void;
  isStyleLoaded: () => boolean;
  once: (event: "load", listener: () => void) => void;
};

type MapboxCtor = {
  accessToken: string;
  Map: new (options: {
    container: HTMLElement;
    style: string;
    center: [number, number];
    zoom: number;
    bearing: number;
    pitch: number;
  }) => MapboxMap;
  Marker: new (options: { element: HTMLElement; anchor: "bottom" }) => MapboxMarker;
  NavigationControl: new () => unknown;
};

declare global {
  interface Window {
    mapboxgl?: MapboxCtor;
  }
}

function ensureStyle(href: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.getElementById(MAPBOX_STYLE_ID) as HTMLLinkElement | null;
    if (existing) {
      resolve();
      return;
    }

    const link = document.createElement("link");
    link.id = MAPBOX_STYLE_ID;
    link.rel = "stylesheet";
    link.href = href;
    link.onload = () => resolve();
    link.onerror = () => reject(new Error("Could not load Mapbox styles"));
    document.head.appendChild(link);
  });
}

function ensureScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.mapboxgl) {
      resolve();
      return;
    }

    const existing = document.getElementById(MAPBOX_SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Could not load Mapbox script")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.id = MAPBOX_SCRIPT_ID;
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load Mapbox script"));
    document.head.appendChild(script);
  });
}

function initialView(items: ItineraryItem[]) {
  const valid = items.filter((i) => Number.isFinite(i.lat) && Number.isFinite(i.lng) && i.lat !== 0);
  if (!valid.length) {
    return { longitude: 0, latitude: 20, zoom: 2 };
  }
  let minLat = valid[0].lat;
  let maxLat = valid[0].lat;
  let minLng = valid[0].lng;
  let maxLng = valid[0].lng;
  for (const p of valid) {
    minLat = Math.min(minLat, p.lat);
    maxLat = Math.max(maxLat, p.lat);
    minLng = Math.min(minLng, p.lng);
    maxLng = Math.max(maxLng, p.lng);
  }
  const lat = (minLat + maxLat) / 2;
  const lng = (minLng + maxLng) / 2;
  const latPad = Math.max((maxLat - minLat) * 0.2, 0.02);
  const lngPad = Math.max((maxLng - minLng) * 0.2, 0.02);
  const zoomLat = Math.log2(360 / (maxLat - minLat + latPad * 2));
  const zoomLng = Math.log2(360 / (maxLng - minLng + lngPad * 2));
  const zoom = Math.min(14, Math.max(3, Math.min(zoomLat, zoomLng)));
  return { longitude: lng, latitude: lat, zoom };
}

export function ItineraryMap({ items, focusedId, onSelectPin }: Props) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const view = useMemo(() => initialView(items), [items]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const markersRef = useRef<Map<string, MapboxMarker>>(new Map());
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !containerRef.current || mapRef.current) return;

    let active = true;

    void (async () => {
      try {
        await ensureStyle(`https://api.mapbox.com/mapbox-gl-js/v${MAPBOX_VERSION}/mapbox-gl.css`);
        await ensureScript(`https://api.mapbox.com/mapbox-gl-js/v${MAPBOX_VERSION}/mapbox-gl.js`);
        if (!active || !containerRef.current || !window.mapboxgl) return;

        window.mapboxgl.accessToken = token;
        const map = new window.mapboxgl.Map({
          container: containerRef.current,
          style: "mapbox://styles/mapbox/dark-v11",
          center: [view.longitude, view.latitude],
          zoom: view.zoom,
          bearing: 0,
          pitch: 0,
        });

        map.addControl(new window.mapboxgl.NavigationControl(), "top-right");
        const markReady = () => {
          if (active) setMapReady(true);
        };
        if (map.isStyleLoaded()) {
          markReady();
        } else {
          map.once("load", markReady);
        }

        mapRef.current = map;
      } catch (error) {
        if (!active) return;
        setMapError(error instanceof Error ? error.message : "Could not load map");
      }
    })();

    return () => {
      active = false;
      for (const marker of markersRef.current.values()) {
        marker.remove();
      }
      markersRef.current.clear();
      mapRef.current?.remove();
      mapRef.current = null;
      setMapReady(false);
    };
  }, [token, view.latitude, view.longitude, view.zoom]);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !window.mapboxgl) return;

    const nextIds = new Set<string>();

    for (const it of items) {
      if (!Number.isFinite(it.lat) || !Number.isFinite(it.lng) || (it.lat === 0 && it.lng === 0)) {
        continue;
      }

      nextIds.add(it.id);
      const color = SLOT_COLORS[it.timeSlot] ?? "#94a3b8";
      const active = focusedId === it.id;
      const existing = markersRef.current.get(it.id);

      if (existing) {
        existing.setLngLat([it.lng, it.lat]);
        const el = existing.getElement();
        el.style.backgroundColor = color;
        el.style.boxShadow = active ? "0 0 0 3px rgba(56,189,248,0.6)" : "";
        el.style.transform = active ? "scale(1.15)" : "scale(1)";
        continue;
      }

      const el = document.createElement("button");
      el.type = "button";
      el.title = it.name;
      el.setAttribute("aria-label", it.name);
      el.style.width = "16px";
      el.style.height = "16px";
      el.style.borderRadius = "9999px";
      el.style.border = "2px solid white";
      el.style.boxShadow = active ? "0 0 0 3px rgba(56,189,248,0.6)" : "";
      el.style.backgroundColor = color;
      el.style.cursor = "pointer";
      el.style.transform = active ? "scale(1.15)" : "scale(1)";
      el.addEventListener("click", (event) => {
        event.stopPropagation();
        onSelectPin?.(it.id);
      });

      const marker = new window.mapboxgl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([it.lng, it.lat])
        .addTo(mapRef.current);

      markersRef.current.set(it.id, marker);
    }

    for (const [id, marker] of markersRef.current.entries()) {
      if (nextIds.has(id)) continue;
      marker.remove();
      markersRef.current.delete(id);
    }
  }, [focusedId, items, mapReady, onSelectPin]);

  useEffect(() => {
    if (!mapReady || !focusedId) return;
    const item = items.find((i) => i.id === focusedId);
    if (!item) return;
    if (!Number.isFinite(item.lat) || !Number.isFinite(item.lng) || (item.lat === 0 && item.lng === 0)) {
      return;
    }

    const map = mapRef.current;
    if (!map) return;

    const exec = () => {
      map.flyTo({
        center: [item.lng, item.lat],
        zoom: FLY_ZOOM,
        duration: FLY_DURATION_MS,
        essential: true,
      });
    };

    if (map.isStyleLoaded()) {
      exec();
    } else {
      map.once("load", exec);
    }
  }, [focusedId, items, mapReady]);

  if (!token) {
    return (
      <div className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-surface-muted bg-surface p-6 text-center">
        <p className="font-display text-base font-semibold text-ink">Map disabled</p>
        <p className="mt-2 max-w-sm text-sm text-ink-muted">
          Add <code className="rounded bg-surface-muted px-1">NEXT_PUBLIC_MAPBOX_TOKEN</code> to{" "}
          <code className="rounded bg-surface-muted px-1">.env.local</code> to show pins. Get a free
          token at{" "}
          <a
            href="https://mapbox.com/"
            className="text-accent underline"
            target="_blank"
            rel="noreferrer"
          >
            mapbox.com
          </a>
          .
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
