import {
  mediaQueries,
  useColorContext,
  fontStyles,
  plainLinkRule,
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
import Link from 'next/link'

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
        <Link {...plainLinkRule} href='/challenge-accepted'>
          <Image
            src={
              resolvedTheme === 'dark'
                ? ChallengeAcceptedSVGDark
                : ChallengeAcceptedSVG
            }
            alt='Challenge Accepted'
            width={400}
            objectFit='contain'
            {...styles.image}
          />{' '}
        </Link>
      </div>
      <div>
        <h2 {...styles.title}>
          Die Klimakrise ist hier.
          <br />
          Die Lage ist ernst. <br />
          Challenge accepted.
        </h2>
        <p {...styles.text}>
          Der Newsletter für alle, die sich der Klimakrise stellen. Und
          gemeinsam Wege aus der Krise finden wollen. Neugierig, kritisch,
          konstruktiv.
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
    gap: '2rem',
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
  image: css({
    width: 300,
    maxWidth: '100%',
  }),
  title: css({
    ...fontStyles.sansSerifBold,
    fontSize: 32,
    marginBottom: '1.5rem',
  }),
  text: css({
    ...fontStyles.sansSerifRegular18,
    marginBlock: '1em',
  }),
  actions: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  }),
}
