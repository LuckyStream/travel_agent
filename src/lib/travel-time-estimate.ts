const EARTH_RADIUS_M = 6_371_000;

function toRad(d: number): number {
  return (d * Math.PI) / 180;
}

/** Great-circle distance in meters (WGS84 sphere). */
export function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lng2 - lng1);
  const a =
    Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a)));
  return EARTH_RADIUS_M * c;
}

/** Rough urban driving pace when Google routing is unavailable (m/s). */
const ESTIMATED_URBAN_DRIVING_MPS = 25_000 / 3600;
/** Mixed / longer legs — better than urban-only when Distance Matrix is unavailable. */
const ESTIMATED_MIXED_DRIVING_MPS = 45_000 / 3600;

export function estimateDriveDurationSeconds(distanceMeters: number): number {
  if (distanceMeters <= 0) return 0;
  return Math.max(60, Math.round(distanceMeters / ESTIMATED_URBAN_DRIVING_MPS));
}

/**
 * Road distance ~1.4× straight-line; speed blends urban vs faster mixed driving by crow distance.
 */
export function estimateDriveDurationFromStraightLineMeters(straightMeters: number): number {
  if (straightMeters <= 0) return 0;
  const roadMeters = straightMeters * 1.4;
  const speedMps = straightMeters > 15_000 ? ESTIMATED_MIXED_DRIVING_MPS : ESTIMATED_URBAN_DRIVING_MPS;
  return Math.max(60, Math.round(roadMeters / speedMps));
}

export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "—";
  const m = Math.round(seconds / 60);
  if (m < 1) return "< 1 min";
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rest = m % 60;
  return rest ? `${h} h ${rest} min` : `${h} h`;
}

export function formatDistanceKm(meters: number): string {
  if (!Number.isFinite(meters) || meters < 0) return "—";
  if (meters < 1000) return `${Math.round(meters / 10) * 10} m`;
  const km = meters / 1000;
  return km >= 10 ? `${Math.round(km)} km` : `${km.toFixed(1)} km`;
}
