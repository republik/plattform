import { css, cva, type RecipeVariantProps } from '@republik/theme/css'

const spinnerVariants = cva({
  base: {
    ml: '2',
    mr: '-1',
    animation: '[spin 1s ease-in-out infinite]',
  },
  variants: {
    size: {
      default: {
        h: '4',
        w: '4',
      },
      large: {
        h: '6',
        w: '6',
      },
    },
  },
  defaultVariants: { size: 'default' },
})

export type SpinnerVariants = RecipeVariantProps<typeof spinnerVariants>

export function Spinner({ size }: {} & SpinnerVariants) {
  return (
    <svg
      className={spinnerVariants({ size })}
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
    >
      <circle
        className={css({
          opacity: '0.25',
        })}
        cx='12'
        cy='12'
        r='10'
        stroke='currentColor'
        strokeWidth='4'
      ></circle>
      <path
        className={css({
          opacity: '0.75',
        })}
        fill='currentColor'
        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
      ></path>
    </svg>
  )
}
