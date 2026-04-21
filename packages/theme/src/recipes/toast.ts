import { defineSlotRecipe } from '@pandacss/dev'

export const toastRecipe = defineSlotRecipe({
  className: 'toast',
  description: 'Styles for the Toast component',
  slots: [
    'root',
    'viewport',
    'content',
    'action',
    'close',
    'title',
    'description',
  ],
  base: {
    root: {
      pointerEvents: 'auto',
      position: 'absolute',
      inset: 'auto 0 0 auto',
      w: 'full',
      background: 'background',
      borderRadius: 'md',
      border: '1px solid',
      borderColor: 'divider',
      p: '4',
      pr: '8',
      shadow: 'sm',
      transition: 'all',

      zIndex: 'calc(1000 - var(--toast-index))',
      translate: '0 calc(var(--toast-index) * token(spacing.4) * -1)',
      scale: 'calc(1 - var(--toast-index) * 0.1)',
      opacity: 'calc(1 - var(--toast-index) * 0.1)',

      '&[data-expanded]': {
        translate:
          '0 calc(var(--toast-offset-y) * -1 - var(--toast-index) * token(spacing.4))',
        scale: '1',
        height: 'var(--toast-height)',
        opacity: '1',
      },

      '&[data-limited]': {
        opacity: '0',
      },

      '&[data-type="error"]': {
        borderColor: 'error',
        background: 'error',
        color: 'white',
      },

      _after: {
        content: '',
        display: 'block',
        bg: 'hotpink',
        position: 'absolute',
        top: '100%',
        width: '100%',
        left: '0',
        height: 'calc(0.75rem + 1px)',
      },
    },
    viewport: {
      position: 'fixed',
      inset: 'auto 1rem 1rem auto',
      background: 'transparent',
      width: '300px',
      zIndex: 51,
    },
    content: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1',
    },
    close: {
      position: 'absolute',
      right: '2',
      top: '2',
      rounded: 'sm',
      p: '1',
      _hover: {
        bg: 'rgba(0, 0, 0, 0.1)',
      },
    },
    title: {
      textStyle: 'body',
      fontWeight: 'medium',
      fontSize: 's',
    },
    description: {
      textStyle: 'body',
      fontSize: 's',
    },
  },
  variants: {
    variant: {
      info: {
        root: {},
      },
    },
  },
  defaultVariants: {
    variant: 'info',
  },
})
