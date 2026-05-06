import { defineSlotRecipe } from '@pandacss/dev'

export const switchRecipe = defineSlotRecipe({
  className: 'switch',
  description: 'Styles for the Switch component',
  slots: ['root', 'thumb'],
  base: {
    root: {
      display: 'inline-flex',
      h: '24px',
      w: '44px',
      flexShrink: 0,
      cursor: 'pointer',
      alignItems: 'center',
      rounded: 'full',
      border: '1px solid',
      borderColor: 'divider',

      _focusVisible: {
        outline: '2px solid transparent',
        outlineOffset: '2px',
        focusRingWidth: '2',
        focusRingColor: 'ring',
        focusRingOffsetWidth: '2',
      },

      _disabled: {
        cursor: 'not-allowed',
        opacity: '0.5',
      },
      _checked: {
        bg: 'text',
      },

      _unchecked: {
        bg: 'hover',
      },
    },
    thumb: {
      pointerEvents: 'none',
      display: 'block',
      h: '20px',
      w: '20px',
      rounded: 'full',
      bg: 'background',
      shadow: 'lg',
      focusRingWidth: '0',
      transition: 'translate 150ms ease-in-out',

      _checked: {
        translate: '21px',
      },

      _unchecked: {
        translate: '1px',
      },
    },
  },
  staticCss: [{}],
})
