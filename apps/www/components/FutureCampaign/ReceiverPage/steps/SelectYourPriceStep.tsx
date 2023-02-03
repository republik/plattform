import { fontStyles, mediaQueries } from '@project-r/styleguide'
import { css } from 'glamor'
import { useMemo, useState } from 'react'
import { useResizeObserver } from '../../../../lib/hooks/useResizeObserver'
import AssetImage from '../../../../lib/images/AssetImage'
import { StepProps } from '../../../Stepper/Stepper'
import { getSliderStep, SliderStep } from '../price-slider-content-helpers'
import { PriceSlider } from '../PriceSlider'
import * as textStyles from '../styles'
import BottomPanel from './BottomPanel'

const SelectYourPriceStep = ({
  stepperControls,
  onSubmit,
}: StepProps & {
  onSubmit: (price: number) => void
}) => {
  const initialSliderStep = useMemo(() => getSliderStep(3), [])
  const [sliderStep, setSliderStep] = useState<SliderStep>(initialSliderStep)
  const [resizeRef, , height] = useResizeObserver()

  return (
    <>
      <div {...styles.container}>
        <div {...styles.content}>
          <div {...styles.icon}>
            <AssetImage
              src={`/static/5-jahre-republik/receiver/slider-step-${sliderStep.step}.svg`}
              width={100}
              height={100}
            />
          </div>

          <p {...textStyles.text}>
            Ihr Preis:{' '}
            <strong {...textStyles.textBold}>CHF {sliderStep.value}</strong>
          </p>
          <h2 {...styles.heading}>{sliderStep.label}</h2>
          <div {...styles.main}>
            <p {...textStyles.text}>{sliderStep.text}</p>
          </div>
        </div>

        <div {...styles.slider} ref={resizeRef}>
          {height > 50 && (
            <PriceSlider
              initialStep={initialSliderStep}
              onChange={(sliderStep) => setSliderStep(sliderStep)}
              step={sliderStep}
              height={height}
            />
          )}
        </div>
      </div>
      <BottomPanel
        steps={stepperControls}
        onClick={() => onSubmit(sliderStep.value)}
      >
        Für CHF {sliderStep.value.toFixed()} abonnieren
      </BottomPanel>
    </>
  )
}

export default SelectYourPriceStep

const styles = {
  main: css({
    flexGrow: 1,
    selfAlign: 'stretch',
  }),
  container: css({
    display: 'flex',
    width: '100%',
  }),
  content: css({
    flexGrow: 1,
  }),
  slider: css({
    flexShrink: 0,
    paddingTop: 32,
    paddingBottom: 32,
    minHeight: 400,
  }),

  heading: css({
    fontSize: 27,
    ...fontStyles.sansSerifBold,
    [mediaQueries.mUp]: {
      fontSize: 36,
    },
    margin: `8px 0 32px 0`,
  }),

  icon: css({
    marginBottom: 32,
  }),
}
