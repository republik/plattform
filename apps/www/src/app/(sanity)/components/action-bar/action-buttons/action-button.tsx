import { css } from '@republik/theme/css'

/** Every icon in the action bar and its overflow menu renders at this size. */
export const ACTION_ICON_SIZE = 18

/**
 * Shared look of an action-bar entry: an 18px icon next to a 14px label.
 * Applied via `className` rather than exported as a component, because the
 * entries render as very different elements — a plain button, an anchor, a
 * Radix trigger, a Radix menu item.
 */
export const actionButtonStyle = css({
  alignItems: 'center',
  color: 'text',
  cursor: 'pointer',
  // `flex`, not `inline-flex`: Share and the membership gate each wrap their
  // button in a block-level element, and an inline-level box there sits on a
  // text baseline, leaving descender space that pushes the content off centre.
  display: 'flex',
  // Token, not `14px`: the reader's font-size setting scales `:root`, so an
  // absolute size would leave these labels behind while the article grows.
  fontSize: 's',
  fontWeight: 'regular',
  gap: '2',
  lineHeight: 1,
  textDecoration: 'none',
  textStyle: 'sans',
  // A block-level flex box would otherwise stretch to fill its wrapper.
  width: 'fit-content',
  whiteSpace: 'nowrap',
  _hover: { color: 'textSoft' },
  '&[data-active="true"]': { color: 'text' },
  '&:disabled, &[aria-disabled="true"]': {
    color: 'disabled',
    cursor: 'default',
  },
  '& > svg': { flexShrink: 0 },
})
