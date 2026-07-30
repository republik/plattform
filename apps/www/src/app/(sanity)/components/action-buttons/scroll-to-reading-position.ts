/**
 * Scrolls back to a stored reading position.
 *
 * Two strategies, in order of precision:
 *
 * 1. `nodeId` names a `[data-pos]` anchor to scroll to exactly. The Sanity
 *    article renderer does not emit those anchors yet, so this only fires for
 *    positions stored by the Pages Router — and only when the ids still match.
 * 2. Otherwise fall back to `percentage` of the article's height.
 *
 * No header-offset arithmetic here: `<html>` carries `scrollPaddingTop`
 * (see `app/layout.tsx`), which `scrollIntoView` honours on its own. The
 * Pages-Router version offset by a hardcoded legacy header height instead,
 * which was wrong for this layout — the header sizes from a token and collapses
 * on scroll — and disagreed with the offset the rest of the app already uses.
 */
export function scrollToReadingPosition({
  container,
  nodeId,
  percentage,
}: {
  container: Element
  nodeId?: string | null
  percentage?: number | null
}) {
  const behavior: ScrollBehavior = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches
    ? 'auto'
    : 'smooth'

  const anchor = nodeId
    ? container.querySelector(`[data-pos="${CSS.escape(nodeId)}"]`)
    : null

  if (anchor) {
    // Already fully in view — a reader who asked to jump here is already here.
    const { top, bottom } = anchor.getBoundingClientRect()
    if (top >= 0 && bottom <= window.innerHeight) {
      return
    }
    anchor.scrollIntoView({ behavior, block: 'start' })
    return
  }

  if (percentage) {
    const { top, height } = container.getBoundingClientRect()
    // `scroll-padding-top` applies to scroll-into-view and snapping, not to
    // programmatic scrollTo — so read the same value rather than reintroducing
    // a constant that would drift from it.
    const offset =
      parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) ||
      0
    window.scrollTo({
      top: window.scrollY + top + percentage * height - offset,
      behavior,
    })
  }
}
