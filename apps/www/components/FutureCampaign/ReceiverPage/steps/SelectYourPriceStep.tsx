import { css } from 'glamor'
import { useState } from 'react'
import { StepProps } from '../../../Stepper/Stepper'
import { getSliderStep, SliderStep } from '../price-slider-content-helpers'
import { PriceSlider } from '../PriceSlider'
import BottomPanel from './BottomPanel'
import { Interaction, fontStyles, mediaQueries } from '@project-r/styleguide'
import * as textStyles from '../styles'
import AssetImage from '../../../../lib/images/AssetImage'

const SelectYourPriceStep = ({
  stepperControls,
  onAdvance,
  initialPrice,
  onSubmit,
}: StepProps & {
  initialPrice: number
  onSubmit: (price: number) => void
}) => {
  const [step, setStep] = useState<SliderStep>(getSliderStep(3))

  return (
    <>
      <div {...styles.container}>
        <div {...styles.content}>
          <div {...styles.icon}>
            <AssetImage
              src={`/static/5-jahre-republik/receiver/slider-step-${step.step}.svg`}
              width={100}
              height={100}
            />
          </div>

          <p {...textStyles.text}>
            Ihr Preis:{' '}
            <strong {...textStyles.textBold}>CHF {step.value}</strong>
          </p>
          <h2 {...styles.heading}>{step.label}</h2>
          <div {...styles.main}>
            <p {...textStyles.text}>{step.text}</p>
          </div>
        </div>

        <div {...styles.slider}>
          <PriceSlider onChange={(step) => setStep(step)} step={step} />
        </div>
      </div>
      <BottomPanel
        steps={stepperControls}
        onAdvance={() => {
          onSubmit(step.value)
          onAdvance()
        }}
      >
        Für CHF {step?.value.toFixed()} abonnieren
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
