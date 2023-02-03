import { css } from 'glamor'
import { fontStyles, mediaQueries } from '@project-r/styleguide'
import BottomPanel from './BottomPanel'
import AssetImage from '../../../../lib/images/AssetImage'
import { StepProps } from '../../../Stepper/Stepper'
import { useTranslation } from '../../../../lib/withT'
import { InviteSenderProfileQueryData } from '../../graphql/useSenderProfileQuery'

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

  const name = `${senderProfile?.firstName} ${senderProfile?.lastName}`

  return (
    <>
      <div {...styles.main}>
        <h1 {...styles.heading}>
          Unabhängiger Journalismus hat Zukunft, mit Ihnen.
        </h1>
        <div>
          {hasMonthlySubscription && (
            <div {...styles.monthlySubscription}>
              <p {...styles.text}>
                Wie wunderbar, dass Sie bereits ein Monatsabo haben!
              </p>
              <p {...styles.text}>
                Nun findet {name}, Sie sollten auch längerfristig Teil der
                Republik-Community werden.
              </p>
              <p {...styles.text}>
                Bestreiten Sie mit uns die Zukunft des unabhängigen
                Journalismus. Egal, wie viel Sie dafür zahlen können.
              </p>
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
              Als Teil der Republik- Community, macht {name} unabhängigen
              Journalismus in der Schweiz möglich.
            </p>
          </div>
        </div>
        <p {...styles.text}>
          Geld ist nicht alles. Köpfe schon. Zahlen Sie für die Republik hier
          den Beitrag, der für Sie stimmt. Möglich ist das, weil Sie von einem
          unserer Mitglieder eingeladen wurden: {name} findet, dass Sie bei der
          Republik noch fehlen.
        </p>
      </div>
      <BottomPanel steps={stepperControls} onClick={onAdvance}>
        Wählen Sie Ihren Preis
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
