import { css } from 'glamor'
import {
  useColorContext,
  fontStyles,
  mediaQueries,
  useMediaQuery,
} from '@project-r/styleguide'
import BottomPanel from './BottomPanel'
import AssetImage from '../../../../lib/images/AssetImage'
import { StepProps } from '../../../Stepper/Stepper'

const IntroductoryStep = ({ stepperControls, onAdvance }: StepProps) => {
  const [colorScheme] = useColorContext()
  const isDesktop = useMediaQuery(mediaQueries.mUp)

  const testInvite = {
    inviterName: 'Grogu (Baby Yoda)',
    inviterImage:
      'https://media.gq.com/photos/5ddd59ff5bb28e00087a9df6/1:1/w_250,h_250,c_limit/baby-yoda-explainer-gq-november-2019-112619.jpg',
  }

  return (
    <>
      <div {...styles.main}>
        <h1 {...styles.heading}>
          Unabhängiger Journalismus hat Zukunft, mit Ihnen.
        </h1>
        <p {...styles.tryIt} {...colorScheme.set('color', 'textSoft')}>
          Eine Kostprobe unserer Inhalte
        </p>
        {/*
          TODO:
          Carousel with articles similiar to marketing-page
          Only allow playing article, don't link to it.
          When playing don't expand player when starting to play.
          (Will need adaption of the carousel component)
        */}
        <i>TODO: Carousel verstekt</i>
        <div {...styles.inviteSection}>
          <div
            style={{
              flexShrink: 0,
              position: 'relative',
            }}
          >
            <AssetImage
              src={testInvite.inviterImage}
              width={96}
              height={96}
              unoptimized
            />
          </div>
          <div style={{ flex: '0 1 auto' }}>
            <p {...styles.text}>
              Als Teil der Republik- Community, macht{' '}
              <i>{testInvite.inviterName}</i> unabhängigen Journalismus in der
              Schweiz möglich.
            </p>
          </div>
        </div>
        <p {...styles.text}>
          <i>{testInvite.inviterName}</i> findet, dass Sie bei der Republik noch
          fehlen. Weshalb Sie eingeladen sind, für ein Republik Jahresabonnement
          den Beitrag zu zahlen, der für Sie stimmt.
        </p>
      </div>
      <BottomPanel steps={stepperControls} onAdvance={onAdvance}>
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
    [mediaQueries.mUp]: {
      fontSize: 21,
    },
  }),
  inviteSection: css({
    display: 'flex',
    flexDirection: 'row',
    gap: 16,
  }),
}
