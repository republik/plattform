import { fontStyles, mediaQueries } from '@project-r/styleguide'
import { css } from 'glamor'
import { useMemo, useState } from 'react'
import { useResizeObserver } from '../../../../lib/hooks/useResizeObserver'
import AssetImage from '../../../../lib/images/AssetImage'
import { StepProps } from '../../../Stepper/Stepper'
import { getDefaultSliderStep, SliderValue } from '../PriceSlider/helpers'
import { PriceSlider } from '../PriceSlider/PriceSlider'
import BottomPanel from './BottomPanel'

const SelectYourPriceStep = ({
  stepperControls,
  onSubmit,
}: StepProps & {
  onSubmit: (price: number) => Promise<any>
}) => {
  const initialSliderStep = useMemo(() => getDefaultSliderStep(), [])
  const [sliderValue, setSliderValue] = useState<SliderValue>(initialSliderStep)
  const [resizeRef, , height] = useResizeObserver()

  const sliderStep = sliderValue.step

  return (
    <>
      <div {...styles.container}>
        <div {...styles.content}>
          <AssetImage
            alt=''
            src={sliderStep.iconSrc}
            width={100}
            height={100}
          />
          <div {...styles.priceSection}>
            <div {...styles.text}>
              Ihr Preis:{' '}
              <strong {...styles.textBold}>CHF {sliderValue.value}</strong>
            </div>
            <h2 {...styles.heading}>{sliderStep.label}</h2>
            <p {...styles.text}>{sliderStep.text}</p>
          </div>
          <div {...styles.goodieSection}>
            <div {...styles.goodie}>
              <div
                {...styles.goodieImage}
                style={{ opacity: sliderStep.goodie ? 1 : 0.5 }}
              >
                <AssetImage
                  alt='Totebag'
                  src={`/static/5-jahre-republik/receiver/visualisierung-5jahr-totebag-traeger-gefaltet.png`}
                  width={60}
                  height={60}
                />
              </div>
              <div>
                <p {...styles.textHint}>{sliderStep.goodieText}</p>
              </div>
            </div>
            <p {...styles.textHint} style={{ marginBottom: 24, opacity: 0.8 }}>
              {sliderStep.bonusHint}
            </p>
          </div>
        </div>
      </div>
      <div {...styles.slider} ref={resizeRef}>
        {height > 50 && (
          <PriceSlider
            initialStep={initialSliderStep}
            onChange={(sliderStep) => setSliderValue(sliderStep)}
            step={sliderValue}
            height={height}
          />
        )}
      </div>
      <BottomPanel
        steps={stepperControls}
        onClick={() => onSubmit(sliderValue.value)}
      >
        Für CHF {sliderValue.value.toFixed()} abonnieren
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
    alignItems: 'start',
    gap: 32,
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
    ...fontStyles.sansSerifMedium26,
    margin: 0,
    [mediaQueries.mUp]: {
      ...fontStyles.sansSerifMedium32,
    },
  }),
  priceSection: css({
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    [mediaQueries.mUp]: {
      gap: 16,
    },
  }),
  goodieSection: css({
    display: 'flex',
    alignItems: 'start',
    flexDirection: 'column',
    gap: 16,
    [mediaQueries.mUp]: {
      gap: 24,
    },
  }),
  goodie: css({
    display: 'flex',
    gap: 16,
  }),
  goodieImage: css({
    flexShrink: 0,
    width: 60,
  }),
  text: css({
    ...fontStyles.sansSerifRegular15,
    margin: 0,
    [mediaQueries.mUp]: {
      ...fontStyles.sansSerifRegular21,
    },
  }),
  textHint: css({
    ...fontStyles.sansSerifRegular14,
    margin: 0,
    [mediaQueries.mUp]: {
      ...fontStyles.sansSerifRegular16,
    },
  }),
  textBold: css({
    ...fontStyles.sansSerifMedium15,
    margin: 0,
    [mediaQueries.mUp]: {
      ...fontStyles.sansSerifMedium21,
    },
  }),
}
