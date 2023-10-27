import {
  mediaQueries,
  useColorContext,
  fontStyles,
} from '@project-r/styleguide'
import withLocalColorScheme from './withColorScheme'
import { challengeAcceptedColors } from './colors'
import { css } from 'glamor'
import {
  CANewsLetterSignUp,
  CAOverViewLink,
} from './ChallengeAcceptedInlineTeaser'
import ChallengeAcceptedSVG from '../../public/static/challenge-accepted/challenge-accepted.svg'
import ChallengeAcceptedSVGDark from '../../public/static/challenge-accepted/challenge-accepted_dark.svg'
import { useTheme } from 'next-themes'
import Image from 'next/image'

function ChallengeAcceptedMarketingTeaser() {
  const [colorScheme] = useColorContext()
  const { resolvedTheme } = useTheme()
  return (
    <div
      id='challenge-accepted-marketing-teaser'
      {...css({
        backgroundColor: colorScheme.getCSSColor('default'),
      })}
      {...styles.container}
    >
      <div {...styles.imageWrapper}>
        <Image
          src={
            resolvedTheme === 'dark'
              ? ChallengeAcceptedSVGDark
              : ChallengeAcceptedSVG
          }
          alt='Challenge Accepted'
          width={400}
          objectFit='contain'
          style={{
            maxWidth: '100%',
          }}
        />
      </div>
      <div>
        <h2 {...styles.title}>
          Die Klimakrise ist hier.
          <br />
          Die Lage ist ernst. <br />
          <em>Challenge accepted.</em>
        </h2>
        <p {...styles.text}>
          Wir richten den Blick auf Menschen, die die Herausforderung annehmen.
          Von der Anwältin zum Autohändler. Vom Bergbauern zur Bürgermeisterin.
          Von der Schriftstellerin zum Skirennfahrer. Gemeinsam gehen wir der
          Frage nach: Wie kommen wir aus dieser Krise wieder raus? Neugierig,
          kritisch, konstruktiv. Mit Artikeln, Debatten, Veranstaltungen. Sind
          Sie dabei?
        </p>
        <div {...styles.actions}>
          <CANewsLetterSignUp />
          <CAOverViewLink />
        </div>
      </div>
    </div>
  )
}

export default withLocalColorScheme(
  ChallengeAcceptedMarketingTeaser,
  challengeAcceptedColors,
)

const styles = {
  container: css({
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '1rem',
    padding: '2rem',
    gridAutoRows: 'auto',
    [mediaQueries.mUp]: {
      gridTemplateColumns: '1fr 1fr',
    },
  }),
  imageWrapper: css({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }),
  image: css({}),
  title: css({
    ...fontStyles.sansSerifMedium,
    fontSize: 32,
    [mediaQueries.mUp]: {
      fontSize: 48,
    },
  }),
  text: css({
    ...fontStyles.sansSerifRegular18,
  }),
  actions: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  }),
}
