import { defineSlotRecipe } from '@pandacss/dev'

export const dialogRecipe = defineSlotRecipe({
  className: 'dialog',
  description: 'Styles for the Dialog component',
  slots: ['backdrop', 'popup', 'viewport', 'title', 'description', 'close'],
  base: {
    backdrop: {
      position: 'fixed',
      inset: '0',
      bg: 'overlay',
      transition: 'opacity 200ms ease-in-out',
      '&[data-starting-style], &[data-ending-style]': {
        opacity: '0',
      },
    },
    viewport: {
      position: 'fixed',
      inset: '0',
      display: 'grid',
      placeContent: 'center',
    },
    popup: {
      position: 'relative',
      bg: 'background',
      borderRadius: '5px',
      shadow: 'sm',
      p: '6',
      maxW: 'narrow',
      w: 'full',
      overflow: 'auto',
      outline: 'none',
      transition: 'opacity 200ms ease-in-out, translate 200ms ease-in-out',
      '&[data-starting-style], &[data-ending-style]': {
        opacity: '0',
        translate: '0px -8px',
      },
    },
    title: {
      fontSize: 'xl',
      fontWeight: 'medium',
      mb: '2',
    },
    description: {
      color: 'text.soft',
      mb: '4',
    },
    close: {
      position: 'absolute',
      top: '2',
      right: '2',
    },
  },
  staticCss: [{}],
})
