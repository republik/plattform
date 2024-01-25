'use client'

import { css } from '@app/styled-system/css'
import { SliderValue, getDefaultSliderStep } from './price-slider/helpers'
import { PriceSlider } from './price-slider/price-slider-horizontal'
import { usePathname, useRouter } from 'next/navigation'
import { Ref, RefObject, useMemo, useState } from 'react'
import useResizeObserver from 'use-resize-observer'

export const PriceSliderWithState = () => {
  const initialSliderStep = useMemo(() => getDefaultSliderStep(), [])
  const [sliderValue, setSliderValue] = useState<SliderValue>(initialSliderStep)
  const sliderStep = sliderValue.step
  const router = useRouter()
  const pathname = usePathname()
  const { ref, height, width } = useResizeObserver()

  return (
    <div ref={ref} className={css({ width: '100%' })}>
      {width && (
        <PriceSlider
          initialStep={initialSliderStep}
          onChange={(sliderStep) => {
            setSliderValue(sliderStep)

            router.replace(`${pathname}?price=${sliderStep.value}`)
          }}
          step={sliderValue}
          width={width}
        />
      )}
    </div>
  )
}
