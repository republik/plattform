import { css } from 'glamor'
import {
  fontStyles,
  mediaQueries,
  plainButtonRule,
  ChevronRightIcon,
  Loader,
} from '@project-r/styleguide'
import BottomPanel from './BottomPanel'
import AssetImage from '../../../../lib/images/AssetImage'
import { StepProps } from '../../../Stepper/Stepper'
import { useState } from 'react'
import { useCarouselQuery } from '../../graphql/useCarouselQuery'
import Carousel from '../../../Marketing/Carousel'
import { useTranslation } from '../../../../lib/withT'
import { InviteSenderProfileQueryData } from '../../graphql/useSenderProfileQuery'

const CAROUSEL_ELEMENT_ID = 'introductionary-step_carousel'

type IntroductionaryStepProps = StepProps & {
  senderProfile: InviteSenderProfileQueryData['sender']
  hasMonthlySubscription: boolean
}

const IntroductoryStep = ({
  senderProfile,
  hasMonthlySubscription,
  stepperControls,
  onAdvance,
}: IntroductionaryStepProps) => {
  const { t } = useTranslation()
  const [showCarousel, setShowCarousel] = useState(false)

  const { data: carouselData, loading: carouselLoading } = useCarouselQuery()

  const name = `${senderProfile?.firstName} ${senderProfile?.lastName}`

  return (
    <>
      <div {...styles.main}>
        <h1 {...styles.heading}>
          {t('FutureCampaign/receiver/introductoryStep/heading')}
        </h1>
        <div>
          {hasMonthlySubscription && (
            <div {...styles.monthlySubscription}>
              <p {...styles.text}>
                {t('FutureCampaign/receiver/monthlySubscription/1')}
              </p>
              <p {...styles.text}>
                {t.elements('FutureCampaign/receiver/monthlySubscription/2', {
                  senderName: name,
                })}
              </p>
              <p {...styles.text}>
                {t('FutureCampaign/receiver/monthlySubscription/3')}
              </p>
            </div>
          )}
          <button
            {...plainButtonRule}
            {...styles.carourelToggle}
            onClick={() => setShowCarousel(!showCarousel)}
            aria-expanded={showCarousel}
            aria-controls={CAROUSEL_ELEMENT_ID}
          >
            <span {...styles.tryIt}>
              {t('FutureCampaign/receiver/introductoryStep/tryItText')}
            </span>{' '}
            <span>
              <ChevronRightIcon
                size={24}
                style={{
                  transform: `rotate(${showCarousel ? '270deg' : '90deg'})`,
                }}
              />
            </span>
          </button>
          {showCarousel && (
            <div id={CAROUSEL_ELEMENT_ID} {...styles.carouselWrapper}>
              <Loader
                loading={carouselLoading}
                render={() => (
                  <Carousel
                    carouselData={carouselData.carousel}
                    onlyAudio
                    expandAudioPlayerOnPlayback={false}
                  />
                )}
              />
            </div>
          )}
        </div>
        <div {...styles.inviteSection}>
          {senderProfile.portrait && (
            <div
              style={{
                flexShrink: 0,
                position: 'relative',
              }}
            >
              <AssetImage
                src={senderProfile.portrait}
                width={96}
                height={96}
                unoptimized
              />
            </div>
          )}
          <div style={{ flex: '0 1 auto' }}>
            <p {...styles.text}>
              {t('FutureCampaign/receiver/introductoryStep/inviteText1', {
                name,
              })}
            </p>
          </div>
        </div>
        <p {...styles.text}>
          {t('FutureCampaign/receiver/introductoryStep/inviteText2', {
            name,
          })}
        </p>
      </div>
      <BottomPanel steps={stepperControls} onAdvance={onAdvance}>
        {t('FutureCampaign/receiver/introductoryStep/action')}
      </BottomPanel>
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
    gap: 32,
  }),
  heading: css({
    margin: 0,
    fontSize: 28,
    ...fontStyles.serifTitle,
    [mediaQueries.mUp]: {
      fontSize: 36,
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
    fontSize: 17,
    lineHeight: '1.4em',
    [mediaQueries.mUp]: {
      fontSize: 21,
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
