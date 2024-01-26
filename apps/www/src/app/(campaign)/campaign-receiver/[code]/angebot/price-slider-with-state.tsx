'use client'

import { css } from '@app/styled-system/css'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import useResizeObserver from 'use-resize-observer'
import { getDefaultSliderStep } from './price-slider/helpers'
import { PriceSlider } from './price-slider/price-slider-horizontal'

export const PriceSliderWithState = () => {
  const router = useRouter()
  const pathname = usePathname()
  // const searchParams = useSearchParams()
  const [step, setStep] = useState(getDefaultSliderStep())
  const { ref, width } = useResizeObserver()

  // const step = searchParams.has('price')
  //   ? getSliderStepForValue(+searchParams.get('price'))
  //   : getDefaultSliderStep()

  return (
    <div ref={ref} className={css({ width: '100%' })}>
      {width && (
        <PriceSlider
          onChange={(sliderStep) => {
            setStep(sliderStep)
            router.replace(`${pathname}?price=${sliderStep.value}`)
          }}
          step={step}
          width={width}
        />
      )}
    </div>
  )
}
