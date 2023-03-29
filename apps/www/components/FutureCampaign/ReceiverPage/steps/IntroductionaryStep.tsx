import { fontStyles, mediaQueries } from '@project-r/styleguide'
import { css } from 'glamor'
import { useState } from 'react'
import { StepProps } from '../../../Stepper/Stepper'
import CountDownTime from '../CountdownTime'
import BottomPanel from './BottomPanel'

export const FUTURE_CAMPAIGN_END_DATE = new Date('5 April, 2023 18:00:00 GMT+2')

type IntroductionaryStepProps = StepProps

const IntroductoryStep = ({
  stepperControls,
  onAdvance,
}: IntroductionaryStepProps) => {
  const [countDownReached, setCountDownReached] = useState(false)

  const onCountDownReached = () => {
    setCountDownReached(true)
  }

  return (
    <>
      <div {...styles.main}>
        <h1 {...styles.heading}>Journalismus hat eine Zukunft – mit Ihnen.</h1>
        <div>
          <p {...styles.text}>
            Für die Zukunft der Republik wünschen wir uns eine Vielfalt an
            Perspektiven.
          </p>
          <p {...styles.text}>
            Bereichern Sie unsere Verlagsetage mit Ihrer Stimme und abonnieren
            Sie die Republik für ein Jahr zum Preis, der Ihnen fair erscheint.
          </p>
        </div>
        <div>
          <p {...styles.textBig}>
            {!countDownReached ? (
              <>
                Dieses Angebot gilt noch: <br />
                <CountDownTime
                  endDate={new Date(FUTURE_CAMPAIGN_END_DATE)}
                  onCountDownReached={onCountDownReached}
                  reachedContent='Das Angebot ist leider nicht mehr verfügbar.'
                />
              </>
            ) : (
              <>Das Angebot ist leider nicht mehr verfügbar.</>
            )}
          </p>
        </div>
      </div>
      {!countDownReached && (
        <BottomPanel steps={stepperControls} onClick={onAdvance}>
          Wählen Sie Ihren Preis
        </BottomPanel>
      )}
    </>
  )
}

export default IntroductoryStep

const styles = {
  main: css({
    flexGrow: 1,
    selfAlign: 'stretch',
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
    marginBottom: 24,
  }),
  heading: css({
    margin: 0,
    fontSize: 32,
    lineHeight: 1.2,
    ...fontStyles.serifTitle,
    [mediaQueries.mUp]: {
      fontSize: 40,
    },
  }),
  headingReasons: css({
    margin: `16px 0 0 0`,
    fontSize: 22,
    ...fontStyles.sansSerifMedium,
    [mediaQueries.mUp]: {
      fontSize: 26,
    },
  }),
  tryIt: css({
    ...fontStyles.sansSerifRegular,
    fontSize: 17,
    [mediaQueries.mUp]: {
      fontSize: 21,
    },
  }),
  text: css({
    ...fontStyles.sansSerifRegular,
    margin: 0,
    fontSize: 19,
    lineHeight: '1.4em',
    [mediaQueries.mUp]: {
      fontSize: 21,
    },
    '& + p': {
      margin: `16px 0 0 0`,
    },
  }),
  textBig: css({
    ...fontStyles.sansSerifRegular,
    margin: 0,
    fontSize: 21,
    fontWeight: '500',
    lineHeight: '1.4em',
    [mediaQueries.mUp]: {
      fontSize: 24,
    },
    '& + p': {
      margin: `16px 0 0 0`,
    },
  }),
  detailsHeading: css({
    ...fontStyles.sansSerifMedium,
    margin: 0,
    fontSize: 16,
    lineHeight: '1.4em',
    display: 'inline',
    [mediaQueries.mUp]: {
      fontSize: 19,
    },
  }),
  monthlySubscription: css({
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    marginBottom: 16,
  }),
  inviteSection: css({
    display: 'flex',
    flexDirection: 'row',
    gap: 16,
  }),
  carouselWrapper: css({
    maxWidth: '100%',
    paddingTop: 23,
    [mediaQueries.mUp]: {
      paddingTop: 32,
    },
  }),
  carourelToggle: css({
    color: 'rgba(255, 255, 255, 0.8)',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  }),
}
