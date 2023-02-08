import {
  ExpandLessIcon,
  ExpandMoreIcon,
  fontStyles,
  mediaQueries,
} from '@project-r/styleguide'
import { css } from 'glamor'
import AssetImage from '../../../../lib/images/AssetImage'
import { useTranslation } from '../../../../lib/withT'
import { StepProps } from '../../../Stepper/Stepper'
import { InviteSenderProfileQueryData } from '../../graphql/useSenderProfileQuery'
import { Details } from '../Details'
import BottomPanel from './BottomPanel'

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
        <h1 {...styles.heading}>Journalismus hat eine Zukunft, mit Ihnen.</h1>
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
              Bestreiten Sie mit uns die Zukunft des unabhängigen Journalismus.
              Egal, wie viel Sie dafür zahlen können.
            </p>
          </div>
        )}
        <div>
          <p {...styles.text}>
            Geld ist nicht alles. Köpfe schon. Zahlen Sie für die Republik hier
            den Beitrag, der für Sie stimmt.
          </p>
          <p {...styles.text}>
            Möglich ist das, weil Sie von einem unserer Mitglieder eingeladen
            wurden:
          </p>
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
              {name} findet, dass Sie bei der Republik noch fehlen.
            </p>
          </div>
        </div>
        <div>
          <Details
            summary={
              <h2 {...styles.detailsHeading}>5 Gründe für die Republik</h2>
            }
            iconClose={<ExpandLessIcon size={24} />}
            iconOpen={<ExpandMoreIcon size={24} />}
          >
            <h3 {...styles.headingReasons}>1. Unabhängig</h3>
            <p {...styles.text}>
              Exzellenter Journalismus. Werbefrei und ohne Bullshit.
            </p>
            <h3 {...styles.headingReasons}>2. Transparent</h3>
            <p {...styles.text}>
              Wir legen alles offen: unsere Finanzen, Arbeitsweisen, Fehler.
            </p>
            <h3 {...styles.headingReasons}>3. Bewegend</h3>
            <p {...styles.text}>
              Wir liefern Ihnen die Grundlage für vernünftige Entscheidungen.
            </p>
            <h3 {...styles.headingReasons}>4. Für Augen und Ohren</h3>
            <p {...styles.text}>
              Alle unsere Beiträge werden von Profis eingelesen.
            </p>
            <h3 {...styles.headingReasons}>5. Im Austausch</h3>
            <p {...styles.text}>
              Wir diskutieren auf Augenhöhe, dank Ihnen und mit Ihnen.
            </p>
          </Details>
        </div>
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
    gap: 28,
    marginBottom: 28,
  }),
  heading: css({
    margin: 0,
    fontSize: 28,
    ...fontStyles.serifTitle,
    [mediaQueries.mUp]: {
      fontSize: 36,
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
