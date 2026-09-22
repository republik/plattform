// SANITY_SYNC (transition period, removable — see ./index.ts).
//
// Ported verbatim from studio's import/publikator/src/transform.ts
// (hexToSanityColor) — converts a `#rrggbb` hex string into the full shape
// `sanity-plugin-color-input` (the `color` field type used by theme.
// accentColor and elsewhere) expects: hex plus HSL/HSV/RGB breakdowns, all
// pre-computed rather than derived client-side.
export function hexToSanityColor(hex: string): Record<string, unknown> | undefined {
  let h = hex.trim().toLowerCase().replace(/^#/, '')
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]
  if (h.length !== 6) return undefined

  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)

  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const d = max - min

  const l = (max + min) / 2
  const s_hsl = d === 0 ? 0 : d / (l > 0.5 ? 2 - max - min : max + min)
  let h_deg = 0
  if (d !== 0) {
    switch (max) {
      case rn:
        h_deg = ((gn - bn) / d + (gn < bn ? 6 : 0)) * 60
        break
      case gn:
        h_deg = ((bn - rn) / d + 2) * 60
        break
      case bn:
        h_deg = ((rn - gn) / d + 4) * 60
        break
    }
  }
  const s_hsv = max === 0 ? 0 : d / max

  const round2 = (n: number) => Math.round(n * 100) / 100

  return {
    _type: 'color',
    hex: `#${h.toUpperCase()}`,
    alpha: 1,
    hsl: { h: Math.round(h_deg), s: round2(s_hsl), l: round2(l), a: 1 },
    hsv: { h: Math.round(h_deg), s: round2(s_hsv), v: round2(max), a: 1 },
    rgb: { r, g, b, a: 1 },
  }
}
