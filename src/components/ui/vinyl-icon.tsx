import type { JourneyKey } from "@/data/navigation";

// Miniature black vinyl record; only the centre label colour changes.
export function VinylIcon({ journey, size = 52 }: { journey: JourneyKey; size?: number }) {
  return (
    <svg className="vinyl-icon" width={size} height={size} viewBox="0 0 56 56" aria-hidden="true">
      <circle cx="28" cy="28" r="28" fill="#141414" />
      {[25, 22.5, 20, 17.5, 15, 12.5].map((r) => (
        <circle key={r} cx="28" cy="28" r={r} fill="none" stroke="#fff" strokeOpacity=".09" strokeWidth=".7" />
      ))}
      <path d="M28 28 L10 6 A28 28 0 0 1 22 1 Z" fill="#fff" fillOpacity=".1" />
      <path d="M28 28 L46 50 A28 28 0 0 1 34 55 Z" fill="#fff" fillOpacity=".1" />
      <circle cx="28" cy="28" r="9" fill={`var(--color-${journey})`} />
      <circle cx="28" cy="28" r="1.3" fill="#fff" fillOpacity=".85" />
    </svg>
  );
}
