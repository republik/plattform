import { css } from '@republik/theme/css'

export const ACTION_ICON_SIZE = 18

export const actionButtonStyle = css({
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
