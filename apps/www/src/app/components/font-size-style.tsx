import {
  FONT_SIZE_COOKIE,
  fontSizeScale,
  isValidFontSize,
} from '@/app/lib/font-size'
import { cookies } from 'next/headers'

/**
 * Publishes the reader's font size before first paint, server-side.
 *
 * `--reader-font-scale` on `:root` is inert on its own — only the
 * `editorialContent` recipe picks it up (as `--article-font-scale`), which is
 * what confines the setting to article body text instead of scaling the whole
 * rem-based app.
 *
 * A `<style>` element rather than an inline script: the value is only ever a
 * number, CSS can't execute, and it needs no `dangerouslySetInnerHTML`.
 *
 * Only render this from layouts that are already dynamic — `cookies()` opts a
 * route out of static rendering, and several route groups depend on ISR
 * (`revalidate = 60`). The articles layout is already dynamic, so it costs
 * nothing there.
 */
export async function FontSizeStyle() {
  const raw = (await cookies()).get(FONT_SIZE_COOKIE)?.value
  const fontSize = Number(raw)

  if (!isValidFontSize(fontSize)) {
    return null
  }

  return (
    <style>{`:root{--reader-font-scale:${fontSizeScale(fontSize)}}`}</style>
  )
}
