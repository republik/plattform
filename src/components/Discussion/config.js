/**
 * The size of each indent. Note that this is the total size including
 * the width of the vertical line.
 */
export const indentSize = 16

/**
 * The width of the vertical line.
 */
export const verticalLineWidth = 2

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
