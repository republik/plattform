import { css } from '@republik/theme/css'

/**
 * Gap between a menu and its trigger. Wide enough that the menu reads as its own
 * surface next to the floating action bar, which shares its background.
 */
export const MENU_SIDE_OFFSET = 16

export const menuTriggerStyle = css({
  cursor: 'pointer',
  display: 'inline-flex',
})

export const menuPanelStyle = css({
  backgroundColor: 'background.overlay',
  borderRadius: 'md',
  boxShadow: 'sm',
  color: 'text',
  minWidth: '12rem',
  paddingY: '2',
  // Radix portals menu content to <body> without a z-index of its own, so it
  // would paint below anything that establishes a stacking context — the
  // floating action bar (20) and the sticky header (100) among them.
  zIndex: 101,
  _stateOpen: { animation: 'fadeIn' },
  _stateClosed: { animation: 'fadeOut' },
})

export const menuItemStyle = css({
  alignItems: 'center',
  color: 'text',
  cursor: 'pointer',
  display: 'flex',
  gap: '3',
  fontSize: 's',
  fontWeight: 'regular',
  outline: 'none',
  paddingX: '5',
  paddingY: '3',
  textAlign: 'left',
  textDecoration: 'none',
  textStyle: 'sans',
  width: 'full',
  '&[data-highlighted], &:hover': {
    backgroundColor: 'hover',
  },
  '&[data-disabled], &:disabled': {
    color: 'disabled',
    cursor: 'not-allowed',
  },
  '& > svg': {
    flexShrink: 0,
  },
})
