/**
 * The size of each indent. Note that this is the total size including
 * the width of the vertical line.
 */
export const indentSizeS = 10
export const indentSizeM = 16

/**
 * The width of the vertical line.
 */
export const verticalLineWidth = 2

/**
 * Limit how deep we nest comments using the standard layout/visual style.
 * Comments nested deeper than that are displayed differently.
 */
export const nestLimit = 4

/**
 * If the comment body is taller than this, it will be collapsed. Subject to
 * the 'collapsable' option taht can be set per-Discussion.
 */
export const COLLAPSED_HEIGHT = {
  mobile: 180,
  desktop: 240,
  // We won't collapse a comment if it just slightly exceeds the heights above.
  threshold: 50
}
