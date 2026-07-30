/** Carried over verbatim from the legacy FontSize/Overlay.js. */
export const DEFAULT_FONT_SIZE = 16
export const FONT_SIZE_STEP = 3.2
export const MIN_FONT_SIZE = 8
export const MAX_FONT_SIZE = 48

/**
 * Mirror of the `republik-font-size` localStorage value, so the server can
 * apply the size before first paint. localStorage stays the source of truth —
 * the Pages Router reads it directly and `usePersistedState` syncs instances
 * off it — this cookie only exists to make SSR aware of it.
 *
 * Same name as the storage key by design, so it is imported rather than
 * re-declared. Imported from `fontSizeCookie`, not `fontSize` — the latter
 * exports a hook, and this module is read by a server component.
 */
export { FONT_SIZE_KEY as FONT_SIZE_COOKIE } from '@/lib/fontSizeCookie'

/** Guards against a hand-edited cookie reaching the rendered stylesheet. */
export function isValidFontSize(value: number): boolean {
  return (
    Number.isFinite(value) && value >= MIN_FONT_SIZE && value <= MAX_FONT_SIZE
  )
}
