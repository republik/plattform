/**
 * The reader's font size, as a cookie.
 *
 * Deliberately free of React imports: `app/components/font-size-style.tsx` is a
 * server component and reads the cookie name from here. Importing it from
 * `@/lib/fontSize` instead would pull `usePersistedState` — and with it
 * `useState`/`useRef` — into a Server Component module.
 */

/** Storage key and cookie name — the same value on purpose. */
export const FONT_SIZE_KEY = 'republik-font-size'

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365

/**
 * Mirrors the size into a cookie so the server can apply it before first paint.
 * localStorage stays the source of truth; this is only its readable projection.
 */
export function writeFontSizeCookie(fontSize: number): void {
  if (typeof document === 'undefined') {
    return
  }
  const secure = window.location.protocol === 'https:' ? ';Secure' : ''
  document.cookie = `${FONT_SIZE_KEY}=${fontSize};path=/;max-age=${ONE_YEAR_SECONDS};SameSite=Lax${secure}`
}
