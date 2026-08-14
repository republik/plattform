/**
 * The stretch of the page reading positions are measured against: the top of
 * the `<article>` down to the end of the editorial content, marked by
 * `ReadingPositionTracker`. Everything after that mark — bottom actions, follow
 * prompts, recommendations — stays outside, so a reader who finishes the text
 * arrives at 100% instead of stalling somewhere in the eighties.
 *
 * The writer (`ReadingPositionTracker`) and the reader
 * (`JumpToReadingPosition`) both measure through here: a stored percentage only
 * means anything against the box it was recorded against.
 */

const READING_END_SELECTOR = '[data-reading-end]'

/** Marks the end of the content. Spread onto the element, see the tracker. */
export const readingEndAttribute = { 'data-reading-end': '' }

export function readingRegion(container: Element) {
  const { top, bottom } = container.getBoundingClientRect()
  const end = container.querySelector(READING_END_SELECTOR)

  return {
    top,
    // Guards the division below, and a `scrollTo` against a collapsed article.
    height: Math.max((end?.getBoundingClientRect().top ?? bottom) - top, 1),
  }
}

/**
 * What the sticky header covers. `scroll-padding-top` applies to
 * scroll-into-view and snapping, but not to programmatic `scrollTo` or to
 * measurements — so read the same value rather than introducing a constant that
 * would drift from it.
 */
export function scrollPaddingTop() {
  return (
    parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0
  )
}

/**
 * How far the reader has got through the region, 0…1, mirroring the legacy
 * tracker (`src/components/Article/Progress/index.js`): the position is where
 * the reading line just below the header sits, and it snaps to 1 once the end of
 * the text is on screen — the last screenful can never be scrolled above the
 * reading line, so nothing would ever reach 100% otherwise.
 *
 * Where the legacy tracker leaned on `MIN_INDEX` to stay out of trouble, the
 * guards here are explicit: a text that fits on one screen has its end in view
 * from the start, and would otherwise report itself read on arrival.
 */
export function readingPercentage(container: Element) {
  const { top, height } = readingRegion(container)

  // Nothing to record: the reader can see the whole text without scrolling.
  if (height <= window.innerHeight - scrollPaddingTop()) {
    return 0
  }

  const read = Math.max(0, -top + scrollPaddingTop())
  if (read === 0) {
    return 0
  }
  if (-top + window.innerHeight > height) {
    return 1
  }
  return Math.min(read / height, 1)
}
