import { css } from 'glamor'

export const AccessibilityStyles = {
  // Source: https://tailwindcss.com/docs/screen-readers
  srOnly: css({
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    borderWidth: 0,
  }),
}
