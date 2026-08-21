export type ClassValue = string | false | null | undefined | ClassValue[]

/** Tiny classnames joiner. No dependency needed for what we do here. */
export function cx(...parts: ClassValue[]): string {
  const out: string[] = []
  const walk = (v: ClassValue) => {
    if (!v) return
    if (Array.isArray(v)) v.forEach(walk)
    else out.push(v)
  }
  parts.forEach(walk)
  return out.join(' ')
}
