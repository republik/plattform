import { fontStyles, mediaQueries } from '@project-r/styleguide'
import { css } from 'glamor'
import { useMemo, useState } from 'react'
import { useResizeObserver } from '../../../../lib/hooks/useResizeObserver'
import AssetImage from '../../../../lib/images/AssetImage'
import { StepProps } from '../../../Stepper/Stepper'
import {
  getDefaultSliderStep,
  SliderStep,
} from '../price-slider-content-helpers'
import { PriceSlider } from '../PriceSlider'
import * as textStyles from '../styles'
import BottomPanel from './BottomPanel'

const SelectYourPriceStep = ({
  stepperControls,
  onSubmit,
}: StepProps & {
  onSubmit: (price: number) => Promise<any>
}) => {
  const initialSliderStep = useMemo(() => getDefaultSliderStep(), [])
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

          <div>
            <div {...textStyles.text}>
              Ihr Preis:{' '}
              <strong {...textStyles.textBold}>CHF {sliderStep.value}</strong>
            </div>
            <h2 {...styles.heading}>{sliderStep.label}</h2>
          </div>

          <p {...textStyles.text}>{sliderStep.text}</p>
          <div {...styles.goodie}>
            <div
              {...styles.goodieImage}
              style={{ opacity: sliderStep.goodie ? 1 : 0.5 }}
            >
              <AssetImage
                src={`/static/5-jahre-republik/receiver/visualisierung-5jahr-totebag-traeger-gefaltet.png`}
                width={60}
                height={60}
              />
            </div>
            <div>
              <p {...textStyles.textSmallMedium}>{sliderStep.goodieText}</p>
            </div>
          </div>
          <p {...textStyles.textSmallMedium}>{sliderStep.bonusHint}</p>
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
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
  }),
  container: css({
    display: 'flex',
    width: '100%',
    flexGrow: 1,
  }),
  content: css({
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
    overflowY: 'auto',
    paddingRight: 74,
  }),
  slider: css({
    flexShrink: 0,
    paddingTop: 32,
    paddingBottom: 32,
    minHeight: 200,
    position: 'fixed',
    top: '50%',
    transform: 'translateY(-50%)',
    right: `max(20px, calc(50vw - 300px + 20px))`,
    height: ['calc(100vh - 240px)', 'calc(100dvh - 240px)'],
    maxHeight: 550,
  }),

  heading: css({
    fontSize: 27,
    ...fontStyles.sansSerifBold,
    [mediaQueries.mUp]: {
      fontSize: 36,
    },
    margin: `8px 0 0 0`,
  }),

  icon: css({}),
  goodie: css({
    display: 'flex',
    gap: 16,
  }),
  goodieImage: css({
    flexShrink: 0,
    width: 60,
  }),
}
