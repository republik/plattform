import { gql, useQuery } from '@apollo/client'
import { EventTrackingContext } from '@app/lib/analytics/event-tracking'
import {
  Center,
  fontStyles,
  mediaQueries,
  plainLinkRule,
} from '@project-r/styleguide'
import { IconArrowRight } from '@republik/icons'
import NewsletterSignUp from 'components/Auth/NewsletterSignUp'
import { css } from 'glamor'
import { useMe } from 'lib/context/MeContext'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import ChallengeAcceptedSVG from '../../public/static/challenge-accepted/challenge-accepted.svg'
import ChallengeAcceptedSVGDark from '../../public/static/challenge-accepted/challenge-accepted_dark.svg'
import { challengeAcceptedColors } from './colors'
import withLocalColorScheme from './withColorScheme'

const styles = {
  p: css({
    ...fontStyles.sansSerifRegular18,
    '& em': {
      ...fontStyles.sansSerifItalic,
    },
  }),
  a: css({
    color: 'var(--color-primary)',
    ...fontStyles.sansSerifRegular18,
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

export const CANewsLetterSignUp = () => {
  const { asPath } = useRouter()
  return (
    <div {...css({ width: '100%' })}>
      <h2
        {...css({
          ...fontStyles.sansSerifBold,
          fontSize: 19,
          marginBottom: '1rem',
        })}
      >
        20’000 sind schon dabei. Jetzt für den Newsletter anmelden.
      </h2>
      <EventTrackingContext category='ChallengeAcceptedPayNote' name={asPath}>
        <NewsletterSignUp name={NEWSLETTER_NAME} free />
      </EventTrackingContext>
    </div>
  )
}

type CAInlineTeaserProps = {
  isMember: boolean
  isNLSubscribed: boolean
}

function CATopInlineTeaser({ isMember, isNLSubscribed }: CAInlineTeaserProps) {
  if (isMember && isNLSubscribed) {
    return null
  }

  return (
    <>
      <CAP>
        Der Newsletter für alle, die sich der Klimakrise stellen. Und gemeinsam
        Wege aus der Krise finden wollen. Neugierig, kritisch, konstruktiv.
      </CAP>
      <div {...styles.actionWrapper}>
        <CANewsLetterSignUp />
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
          Die Klimakrise ist hier. Die Lage ist ernst.{' '}
          <em>Challenge accepted.</em> Alle Artikel, alle Veranstaltungen, alle
          Newsletter auf einen Blick.
        </CAP>
        <div {...styles.actionWrapper}>
          <CAOverViewLink />
        </div>
      </>
    )
  }

  return (
    <>
      <CAP>
        Inspirierende Menschen, die in der Klimakrise einen Unterschied machen.
        Denkanstösse und konkrete Ideen zur grossen Frage: Wie kommen wir aus
        dieser Krise wieder raus? Veranstaltungen für den persönlichen Austausch
        und neue Begegnungen.
      </CAP>
      <div {...styles.actionWrapper}>
        <CANewsLetterSignUp />
        <CAOverViewLink />
      </div>
    </>
  )
}

function ChallengeAcceptedInlineTeaser(props: { position?: 'top' | 'bottom' }) {
  const { hasActiveMembership, meLoading } = useMe()

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
        '& [data-logo-dark]': {
          display: 'var(--color-displayDark)',
        },
        '& [data-logo-light]': {
          display: 'var(--color-displayLight)',
        },
      })}
    >
      <Center>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            margin: '1rem 0',
          }}
        >
          {!(
            props.position === 'bottom' &&
            hasActiveMembership &&
            !isSubscribedToNL
          ) && (
            <>
              <Image
                data-logo-light
                src={ChallengeAcceptedSVG}
                alt='Challenge Accepted'
                width={150}
              />
              <Image
                data-logo-dark
                src={ChallengeAcceptedSVGDark}
                alt='Challenge Accepted'
                width={150}
              />
            </>
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
