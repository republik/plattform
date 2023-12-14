import { gql, useQuery } from '@apollo/client'
import { useMe } from 'lib/context/MeContext'
import withLocalColorScheme from './withColorScheme'
import { challengeAcceptedColors } from './colors'
import { css } from 'glamor'
import {
  Button,
  Center,
  fontStyles,
  plainLinkRule,
  mediaQueries,
} from '@project-r/styleguide'
import NewsletterSignUp from 'components/Auth/NewsletterSignUp'
import Link from 'next/link'
import Image from 'next/image'
import ChallengeAcceptedSVG from '../../public/static/challenge-accepted/challenge-accepted.svg'
import ChallengeAcceptedSVGDark from '../../public/static/challenge-accepted/challenge-accepted_dark.svg'
import { useRouter } from 'next/router'
import { useTheme } from 'next-themes'
import { IconArrowRight } from '@republik/icons'

const styles = {
  p: css({
    ...fontStyles.sansSerifRegular18,
    '& em': {
      ...fontStyles.sansSerifItalic,
    },
  }),
  a: css({
    color: 'var(--color-primary)',
    ...fontStyles.sansSerifRegular23,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  }),
  actionWrapper: css({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
    '& *': {
      [mediaQueries.mUp]: {
        flexFlow: 'nowrap',
      },
    },
    '& button': {
      borderColor: 'var(--color-primary)',
    },
  }),
}

// TODO: ensure correct newslettername for challenge-accepted
const NEWSLETTER_NAME = 'CLIMATE'

const CAP = ({ children, ...props }) => (
  <p {...styles.p} {...props}>
    {children}
  </p>
)

export const CAOverViewLink = () => (
  <Link {...plainLinkRule} {...styles.a} href='/challenge-accepted'>
    Zur Übersicht <IconArrowRight />
  </Link>
)

export const CANewsLetterSignUp = () => (
  <div {...css({ width: '100%' })}>
    <h2 {...css({ ...fontStyles.sansSerifBold, fontSize: 19 })}>
      Für den Newsletter anmelden
    </h2>
    <NewsletterSignUp name={NEWSLETTER_NAME} free />
  </div>
)

type CAInlineTeaserProps = {
  isMember: boolean
  isNLSubscribed: boolean
}

function CATopInlineTeaser({ isMember, isNLSubscribed }: CAInlineTeaserProps) {
  if (isMember && isNLSubscribed) {
    return null
  }

  if (isMember) {
    return (
      <>
        <CAP>
          Die Klimakrise ist hier. Die Lage ist ernst.{' '}
          <em>Challenge accepted</em>. Wir richten den Blick auf Menschen, die
          in der Klimakrise einen Unterschied machen wollen. Und gehen gemeinsam
          der Frage nach: Wie kommen wir aus dieser Krise wieder raus?
          Neugierig, kritisch, konstruktiv. Mit Artikeln, Debatten,
          Veranstaltungen. Sind Sie dabei?
        </CAP>
        <div {...styles.actionWrapper}>
          <CANewsLetterSignUp />
          <CAOverViewLink />
        </div>
      </>
    )
  }

  return (
    <>
      <CAP>
        Die Klimakrise ist hier. Die Lage ist ernst. <em>Challenge accepted</em>
        . Wir richten den Blick auf Menschen, die in der Klimakrise einen
        Unterschied machen wollen. Und gehen gemeinsam der Frage nach: Wie
        kommen wir aus dieser Krise wieder raus? Neugierig, kritisch,
        konstruktiv. Mit Artikeln, Debatten, Veranstaltungen. Sind Sie dabei?
      </CAP>
      <div {...styles.actionWrapper}>
        <CANewsLetterSignUp />
        <CAOverViewLink />
      </div>
    </>
  )
}

function CABottomInlineTeaser({
  isMember,
  isNLSubscribed,
}: CAInlineTeaserProps) {
  const router = useRouter()
  if (isMember && isNLSubscribed) {
    return (
      <>
        <CAP>
          Die Klimakrise ist hier. Die Lage ist ernst. Wir richten den Blick auf
          Menschen, die in der Klimakrise einen Unterschied machen wollen.
        </CAP>
        <div {...styles.actionWrapper}>
          <CAOverViewLink />
        </div>
      </>
    )
  }

  if (isMember) {
    return (
      <>
        <div {...styles.actionWrapper}>
          <CAP>
            Die Klimakrise ist hier. Die Lage ist ernst.{' '}
            <em>Challenge accepted</em>. Wir richten den Blick auf Menschen, die
            in der Klimakrise einen Unterschied machen wollen.
          </CAP>
          <CANewsLetterSignUp />
          <CAOverViewLink />
        </div>
      </>
    )
  }

  return (
    <>
      <CAP>
        Dieser Artikel existiert, weil über 28&apos;000 Menschen die Republik
        mit einer Mitgliedschaft unterstützen. Wollen Sie mehr davon, und liegt
        Ihnen ein informierter, konstruktiver Austausch über die Klimakrise am
        Herzen?
      </CAP>
      <div {...styles.actionWrapper}>
        <Button
          primary
          onClick={() =>
            router.push({
              pathname: '/angebote',
              query: {
                utm_medium: 'website',
                utm_campaign: 'challenge-accepted',
                utm_source: 'republik',
                utm_content: 'artikel-bottom',
              },
            })
          }
        >
          Werden Sie jetzt Mitglied
        </Button>
      </div>
    </>
  )
}

function ChallengeAcceptedInlineTeaser(props: { position?: 'top' | 'bottom' }) {
  const { hasActiveMembership, meLoading } = useMe()
  const { resolvedTheme } = useTheme()

  const { data: challengeAcceptedNLData, loading: challengeAcceptedNLLoading } =
    useQuery<CANewsterQueryResult, CANewsletterQueryVariables>(
      CA_NEWSLETTER_QUERY,
      {
        variables: {
          name: NEWSLETTER_NAME,
        },
      },
    )

  if (meLoading || challengeAcceptedNLLoading) {
    return null
  }

  const isSubscribedToNL =
    challengeAcceptedNLData?.me?.newsletterSettings?.subscriptions?.[0]
      ?.subscribed

  if (props.position === 'top' && isSubscribedToNL && hasActiveMembership) {
    return null
  }

  return (
    <div
      {...css({
        backgroundColor: 'var(--color-default)',
      })}
    >
      <Center>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            margin: '1rem 0',
          }}
        >
          {!(
            props.position === 'bottom' &&
            hasActiveMembership &&
            !isSubscribedToNL
          ) && (
            <Link {...plainLinkRule} href='/challenge-accepted'>
              <Image
                src={
                  resolvedTheme === 'dark'
                    ? ChallengeAcceptedSVGDark
                    : ChallengeAcceptedSVG
                }
                alt='Challenge Accepted'
                width={150}
              />
            </Link>
          )}
          {props.position === 'top' && (
            <CATopInlineTeaser
              isMember={hasActiveMembership}
              isNLSubscribed={isSubscribedToNL}
            />
          )}
          {props.position === 'bottom' && (
            <CABottomInlineTeaser
              isMember={hasActiveMembership}
              isNLSubscribed={isSubscribedToNL}
            />
          )}
        </div>
      </Center>
    </div>
  )
}

export default withLocalColorScheme(
  ChallengeAcceptedInlineTeaser,
  challengeAcceptedColors,
)

export const CA_NEWSLETTER_QUERY = gql(`
  query CANewsletterQuery(
    $name: NewsletterName!
  ) {
    me {
      newsletterSettings {
        id
        status
        subscriptions(name: $name) {
          id
          name
          subscribed
        }
      }
    }
  }
`)

export type CANewsterQueryResult = {
  me: null | {
    newsletterSettings: {
      id: string
      status: string
      subscriptions:
        | null
        | ({
            id: string
            name: string
            subscribed: boolean
          } | null)[]
    }
  }
}

export type CANewsletterQueryVariables = {
  name: string
}
