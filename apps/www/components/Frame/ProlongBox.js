import {
  Button,
  Center,
  Editorial,
  Interaction,
  mediaQueries,
  useColorContext,
} from '@project-r/styleguide'
import { timeDay } from 'd3-time'

import { css } from 'glamor'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Fragment } from 'react'
import { timeFormat } from '../../lib/utils/format'
import { useInNativeApp } from '../../lib/withInNativeApp'

import TokenPackageLink from '../Link/TokenPackage'

const styles = {
  box: css({
    padding: 15,
  }),
  singleLine: css({
    textAlign: 'center',
    fontSize: 13,
    [mediaQueries.mUp]: {
      fontSize: 16,
    },
  }),
}

const SingleLine = ({ children }) => (
  <div {...styles.singleLine}>{children}</div>
)

const dayFormat = timeFormat('%d. %B %Y')

const ProlongBox = ({ t, prolongBeforeDate, membership }) => {
  const [colorScheme] = useColorContext()
  const router = useRouter()
  const { inNativeApp } = useInNativeApp()

  // on iOS iframe to stripe were not possible before app v2.0.2
  // NOTE TO REVIEWER:
  // prolong BROKE when trying it on my device -> 3d secure redirect failed
  // kept all the useful stuff, but redirected to the website for app users (see link component below)
  if (
    router.pathname === '/angebote' ||
    router.pathname === '/abgang' ||
    router.pathname === '/cockpit'
  ) {
    return null
  }

  const date = new Date(prolongBeforeDate)
  const numberOfDays = timeDay.count(new Date(), date)

  if (
    (membership.type.name === 'ABO_GIVE_MONTHS' && numberOfDays <= 7) ||
    (membership.type.name !== 'ABO_GIVE_MONTHS' && numberOfDays <= 30)
  ) {
    const key =
      (numberOfDays < 0 && 'overdue') ||
      (numberOfDays <= 2 && 'due') ||
      'before'

    const prefixTranslationKeys = [
      `prolongNecessary/${membership.type.name}/${key}`,
      `prolongNecessary/${key}`,
    ]

    const endDate = new Date(membership.endDate)
    const graceEndDate = new Date(membership.graceEndDate)

    const styleTextColor = colorScheme.set('color', 'text')

    const explanation = t.first.elements(
      prefixTranslationKeys.map((k) => `${k}/explanation`),
      {
        cancelLink: (
          <Link
            key='cancelLink'
            href='/abgang'
            passHref
            prefetch={false}
            legacyBehavior
          >
            <Editorial.A {...styleTextColor}>
              {t.first(
                prefixTranslationKeys.map((k) => `${k}/explanation/cancelText`),
                undefined,
                '',
              )}
            </Editorial.A>
          </Link>
        ),
        daysAgo: t.pluralize('prolongNecessary/days', {
          count: Math.abs(numberOfDays),
        }),
        prolongBeforeDate: dayFormat(date),
        endDate: dayFormat(endDate),
        graceEndDate: dayFormat(graceEndDate),
      },
      '',
    )
    const hasExplanation = !!explanation.length
    const Title = hasExplanation ? Interaction.H2 : Fragment
    const Wrapper = hasExplanation ? Center : SingleLine

    const buttonText = t.first(
      prefixTranslationKeys.map((k) => `${k}/button`),
      undefined,
      '',
    )

    const link = (inNativeApp && t('prolongNecessary/native/info')) ||
      (membership.canProlong && (
        <TokenPackageLink key='link' params={{ package: 'PROLONG' }}>
          <Editorial.A {...styleTextColor}>
            {t.first(prefixTranslationKeys.map((k) => `${k}/linkText`))}
          </Editorial.A>
        </TokenPackageLink>
      )) || (
        <Link
          key='link'
          href={{ pathname: `/angebote`, query: { package: 'ABO' } }}
          passHref
          prefetch={false}
          legacyBehavior
        >
          <Editorial.A {...styleTextColor}>
            {t.first(prefixTranslationKeys.map((k) => `${k}/linkText`))}
          </Editorial.A>
        </Link>
      )

    return (
      <div
        {...styles.box}
        {...styleTextColor}
        {...colorScheme.set('backgroundColor', 'alert')}
      >
        <Wrapper>
          <Title>{t.first.elements(prefixTranslationKeys, { link })}</Title>
          {buttonText && membership.canProlong && (
            <TokenPackageLink key='link' params={{ package: 'PROLONG' }}>
              <Button style={{ marginTop: 10 }} primary>
                {buttonText}
              </Button>
            </TokenPackageLink>
          )}
          {buttonText && !membership.canProlong && (
            <Link
              key='link'
              href={{ pathname: `/angebote` }}
              passHref
              prefetch={false}
              legacyBehavior
            >
              <Button style={{ marginTop: 10 }} primary>
                {buttonText}
              </Button>
            </Link>
          )}
          {hasExplanation && (
            <Interaction.P style={{ marginTop: 10 }} {...styleTextColor}>
              {explanation}
            </Interaction.P>
          )}
        </Wrapper>
      </div>
    )
  }
  return null
}

export default ProlongBox
