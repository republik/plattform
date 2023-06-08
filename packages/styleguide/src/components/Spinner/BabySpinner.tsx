import React from 'react'
import { css, keyframes } from 'glamor'

const babySpinnerKeyframes = keyframes({
  '0%': { transform: 'rotate(0deg)' },
  '100%': { transform: 'rotate(360deg)' },
})

const babySpinnerStyles = css({
  display: 'inline-block',
  verticalAlign: 'middle',
  animation: `${babySpinnerKeyframes} 1s linear infinite`,
})

type BabySpinnerProps = {
  size?: number | string
}

/**
 * A tiny spinner for inline use.
 * Shamelessly stolen from https://tailwindcss.com/docs/animation
 * @param size The size of the spinner. Defaults to 0.75em.
 */
const BabySpinner = ({ size = '0.75em' }: BabySpinnerProps) => (
  <svg
    {...babySpinnerStyles}
    xmlns='http://www.w3.org/2000/svg'
    fill='none'
    width={size}
    height={size}
    viewBox='0 0 24 24'
  >
    <circle
      opacity={0.25}
      cx='12'
      cy='12'
      r='10'
      stroke='currentColor'
      strokeWidth='4'
    />
    <path
      fill='currentColor'
      opacity={0.75}
      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
    />
  </svg>
)

export default BabySpinner
