import { FONT_SIZE_COOKIE, isValidFontSize } from '@/app/lib/font-size'
import { cookies } from 'next/headers'

/**
 * Applies the reader's font size before first paint, server-side.
 *
 * A `<style>` element rather than an inline script: the value is only ever a
 * number, CSS can't execute, and it needs no `dangerouslySetInnerHTML`.
 *
 * Only render this from layouts that are already dynamic — `cookies()` opts a
 * route out of static rendering, and several route groups depend on ISR
 * (`revalidate = 60`). The articles layout already calls `draftMode()`, so it
 * costs nothing there.
 */
export async function FontSizeStyle() {
  const raw = (await cookies()).get(FONT_SIZE_COOKIE)?.value
  const fontSize = Number(raw)

  if (!isValidFontSize(fontSize)) {
    return null
  }

  return <style>{`:root{font-size:${fontSize}px}`}</style>
}
