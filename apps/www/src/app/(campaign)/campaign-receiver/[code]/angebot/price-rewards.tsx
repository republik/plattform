'use client'

import { getSliderStepForValue } from '@app/app/(campaign)/campaign-receiver/[code]/angebot/price-slider/helpers'
import { css } from '@app/styled-system/css'
import { useSearchParams } from 'next/navigation'

export const PriceRewards = () => {
  const searchParams = useSearchParams()

  const step = getSliderStepForValue(+searchParams.get('price'))

  return (
    <>
      <h2
        className={css({
          fontWeight: 'bold',
          fontSize: '2xl',
        })}
      >
        {step.step.label}
      </h2>
      <p>{step.step.text}</p>
      {step.step.goodie && (
        <p className={css({ fontSize: 'base' })}>{step.step.goodieText}</p>
      )}
      <p className={css({ fontSize: 'base' })}>{step.step.bonusHint}</p>
    </>
  )
}
