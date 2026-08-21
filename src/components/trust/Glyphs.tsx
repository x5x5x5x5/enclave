/* ============================================================================
   Micro-glyphs. Built once, used everywhere. Neutral by default: encryption is
   silent, so none of these are green, and none of them are a padlock.
   ========================================================================== */

interface GlyphProps {
  size?: number
  className?: string
  strokeWidth?: number
}

/** Sealed room. A stamped circle, the way a wax seal reads at 16px. */
export function SealGlyph({ size = 16, className, strokeWidth = 1.5 }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className} aria-hidden="true">
      <circle
        cx="8"
        cy="8"
        r="5.4"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        opacity="0.9"
      />
      <path
        d="M8 3.4 9.2 5.9l2.7.35-2 1.85.5 2.7L8 9.5l-2.4 1.3.5-2.7-2-1.85 2.7-.35z"
        fill="currentColor"
        opacity="0.5"
      />
    </svg>
  )
}

/** No history: you only see what was said after you arrived. */
export function GhostGlyph({ size = 16, className, strokeWidth = 1.5 }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className} aria-hidden="true">
      <path
        d="M3.6 12.6V6.9a4.4 4.4 0 0 1 8.8 0v5.7l-1.5-1.1-1.4 1.1-1.5-1.1-1.4 1.1-1.5-1.1z"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <circle cx="6.4" cy="7.2" r="0.85" fill="currentColor" />
      <circle cx="9.6" cy="7.2" r="0.85" fill="currentColor" />
    </svg>
  )
}

/** Temporary room. The room itself is on a timer, not just the messages. */
export function HourglassGlyph({ size = 16, className, strokeWidth = 1.5 }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className} aria-hidden="true">
      <path
        d="M4.5 2.6h7M4.5 13.4h7M5.4 2.6v2.1L8 7.4l2.6-2.7V2.6M5.4 13.4v-2.1L8 8.6l2.6 2.7v2.1"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Zero-knowledge proof: a checkmark inside brackets. */
export function ZkGlyph({ size = 16, className, strokeWidth = 1.5 }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className} aria-hidden="true">
      <path
        d="M4.6 2.8H3v10.4h1.6M11.4 2.8H13v10.4h-1.6"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.75"
      />
      <path
        d="m5.9 8.2 1.6 1.7 2.9-3.4"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Relay hop diagram: you, a relay, the room. One line, three nodes. */
export function RelayGlyph({ size = 16, className }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className} aria-hidden="true">
      <path d="M2.5 8h11" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
      <circle cx="2.6" cy="8" r="1.6" fill="currentColor" />
      <circle cx="8" cy="8" r="2" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="13.4" cy="8" r="1.6" fill="currentColor" />
    </svg>
  )
}
