import { css } from '@republik/theme/css'

export const ACTION_ICON_SIZE = 18

export const actionStyle = css({
  alignItems: 'center',
  color: 'text',
  cursor: 'pointer',
  display: 'flex',
  fontSize: 's',
  fontWeight: 'regular',
  gap: '2',
  lineHeight: 1,
  textDecoration: 'none',
  textStyle: 'sans',
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

// Icon-only on mobile; the label only renders from the `md` breakpoint up.
export const actionLabelStyle = css({
  display: 'none',
  md: { display: 'inline' },
})
