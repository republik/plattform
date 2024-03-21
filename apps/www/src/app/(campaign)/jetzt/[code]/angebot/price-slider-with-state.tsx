'use client'

import { css } from '@app/styled-system/css'
import { Dispatch, SetStateAction } from 'react'
import useResizeObserver from 'use-resize-observer'
import { getSliderStepForValue } from './price-slider/helpers'
import { PriceSlider } from './price-slider/price-slider-horizontal'

type PriceSliderWithStateProps = {
  price: number
  setPrice: Dispatch<SetStateAction<number>>
}

export const PriceSliderWithState = ({
  price,
  setPrice,
}: PriceSliderWithStateProps) => {
  const { ref, width } = useResizeObserver()

  return (
    <div ref={ref} className={css({ width: '100%', minHeight: 110 })}>
      {width && (
        <PriceSlider
          onChange={(sliderStep) => setPrice(sliderStep.value)}
          step={getSliderStepForValue(price)}
          width={width}
        />
      )}
    </div>
  )
}
