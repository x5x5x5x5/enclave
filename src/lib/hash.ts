/**
 * Deterministic short hashes. These stand in for franking tags, safety
 * numbers and device fingerprints: mono type, always visible, never real.
 */
const ALPHABET = '0123456789abcdef'

export function fnv1a(input: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h >>> 0
}

export function hexHash(seed: string, length = 8): string {
  let out = ''
  let h = fnv1a(seed)
  while (out.length < length) {
    out += ALPHABET[h & 15]
    h = (h >>> 4) ^ Math.imul(h, 0x9e3779b1)
    h = h >>> 0
    if (h === 0) h = fnv1a(out + seed)
  }
  return out.slice(0, length)
}

/** "9f2c a41d" style franking tag. */
export function frank(seed: string): string {
  const h = hexHash(seed, 8)
  return `${h.slice(0, 4)} ${h.slice(4)}`
}

/** Grouped fingerprint for device/session rows. */
export function fingerprint(seed: string, groups = 5, size = 4): string {
  const h = hexHash(seed, groups * size)
  const out: string[] = []
  for (let i = 0; i < groups; i++) out.push(h.slice(i * size, i * size + size))
  return out.join(' ')
}

/** Stable 0..1 float from a seed, for fixture-time jitter. */
export function seededFloat(seed: string): number {
  return (fnv1a(seed) % 100000) / 100000
}
