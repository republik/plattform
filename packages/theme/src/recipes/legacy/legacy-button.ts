import { defineRecipe } from '@pandacss/dev'

export const legacyButtonRecipe = defineRecipe({
  className: 'legacy-button',
  description: 'Styles for the legacy Button component',

  base: {
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '2xl',
    lineHeight: '1',
    whiteSpace: 'nowrap',
    minWidth: 160,
    height: '[60px]',

    borderWidth: '1px',
    borderStyle: 'solid',
    borderRadius: 0,

    cursor: 'pointer',
    '&:disabled:not([data-loading], [aria-busy="true"])': {
      backgroundColor: 'transparent',
      cursor: 'default',
      color: 'disabled',
    },
    _loading: {
      cursor: 'default',
    },
  },
  variants: {
    variant: {
      default: {
        bg: 'transparent',
        color: 'text',
        borderColor: 'text',
        _hover: {
          bg: 'primaryHover',
          color: 'text.primaryForeground',
          borderColor: 'primaryHover',
        },
      },
      primary: {
        bg: 'primary',
        color: 'text.primaryForeground',
        borderColor: 'primary',
        _hover: {
          bg: 'primaryHover',
        },
      },
      block: {
        width: 'full',
      },
      naked: {
        bg: 'transparent',
        borderColor: 'current',
        borderStyle: 'none',
        borderWidth: '0',
        _hover: {
          color: 'textSoft',
        },
      },
      nakedPrimary: {
        bg: 'transparent',
        color: 'primary',
        borderColor: 'current',
        borderStyle: 'none',
        borderWidth: '0',
        _hover: {
          color: 'primaryHover',
        },
      },
    },
    size: {
      default: {
        px: '[20px]',
        py: '[10px]',
      },
      small: {
        fontSize: 'base',
        height: '[32px]',
        py: '0',
        px: '4',
      },
    },
  },
  compoundVariants: [],
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
  staticCss: [{ variant: ['*'], size: ['*'] }],
})
