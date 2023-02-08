import { Fragment } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { timeDay } from 'd3-time'

import {
  Editorial,
  Interaction,
  mediaQueries,
  Button,
  Center,
  useColorContext,
} from '@project-r/styleguide'

import { css } from 'glamor'

import { useInNativeApp } from '../../lib/withInNativeApp'
import { useTranslation } from '../../lib/withT'
import { timeFormat } from '../../lib/utils/format'

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

const EndingBox = ({ membership }) => {
  const [colorScheme] = useColorContext()
  const { t } = useTranslation()
  const router = useRouter()
  const { isMinimalNativeAppVersion, inNativeIOSApp } = useInNativeApp()

  if (
    // on iOS iframe to stripe were not possible before app v2.0.2
    (inNativeIOSApp && !isMinimalNativeAppVersion('2.0.2')) ||
    router.pathname === '/angebote' ||
    router.pathname === '/abgang' ||
    router.pathname === '/cockpit'
  ) {
    return null
  }

  if (!['YEARLY_ABO'].includes(membership.type.name)) {
    return null
  }

  if (!membership.renew) {
    return null
  }

  const date = new Date(membership.endDate)
  const daysLeft = timeDay.count(new Date(), date)

  if (daysLeft >= 30) {
    return null
  }

  const key =
    (daysLeft < 0 && 'overdue') || (daysLeft <= 2 && 'due') || 'before'

  const prefixTranslationKeys = [`EndingBox/${membership.type.name}/${key}`]

  const endDate = new Date(membership.endDate)
  const graceEndDate = new Date(membership.graceEndDate)

  const styleTextColor = colorScheme.set('color', 'text')

  const explanation = t.first.elements(
    prefixTranslationKeys.map((k) => `${k}/explanation`),
    {
      cancelLink: (
        <Link key='cancelLink' href='/abgang' passHref prefetch={false}>
          <Editorial.A {...styleTextColor}>
            {t.first(
              prefixTranslationKeys.map((k) => `${k}/explanation/cancelText`),
              undefined,
              '',
            )}
          </Editorial.A>
        </Link>
      ),
      daysAgo: t.pluralize('EndingBox/days', {
        count: Math.abs(daysLeft),
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

  return (
    <div
      {...styles.box}
      {...styleTextColor}
      {...colorScheme.set('backgroundColor', 'alert')}
    >
      <Wrapper>
        <Title>
          {t.first.elements(prefixTranslationKeys, {
            link: (
              <Link key='link' href='/angebote' passHref prefetch={false}>
                <Editorial.A {...styleTextColor}>
                  {t.first(prefixTranslationKeys.map((k) => `${k}/linkText`))}
                </Editorial.A>
              </Link>
            ),
          })}
        </Title>
        {buttonText && (
          <Link key='link' href='/angebote' passHref prefetch={false}>
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

export default EndingBox
