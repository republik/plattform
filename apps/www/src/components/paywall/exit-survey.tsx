'use client'

import { ReactNode, useState } from 'react'

import { css } from '@republik/theme/css'

import { useTranslation } from 'lib/withT'

import { RegwallSection } from '../regwall/containers'

import { Button } from '../ui/button'
import { ArrowLink } from '../ui/links'

function SurveyButton({ children }: { children: ReactNode }) {
  return (
    <Button variant='outline' size='large' className={css({ fontWeight: 400 })}>
      {children}
    </Button>
  )
}

function ThankYou() {
  const { t } = useTranslation()
  return (
    <RegwallSection backgroundColor='#F2ECE6'>
      <p className={css({ textStyle: 'airy', fontWeight: 'medium' })}>
        {t('paywall/survey/thanks/title')}
      </p>
      <p className={css({ textStyle: 'body' })}>
        {t('paywall/survey/thanks/description')}
      </p>
      <ArrowLink href='/format/was-diese-woche-wichtig-war'>
        {t('paywall/survey/thanks/link')}
      </ArrowLink>
    </RegwallSection>
  )
}

export function ExitSurvey() {
  const [thankYou, showThankYou] = useState(false)
  const { t } = useTranslation()

  return (
    <div
      className={css({
        borderTop: '2px solid',
        borderColor: 'text.black',
      })}
    >
      {' '}
      {thankYou ? (
        <ThankYou />
      ) : (
        <RegwallSection backgroundColor='#F2ECE6'>
          <p className={css({ textStyle: 'airy', fontWeight: 'medium' })}>
            {t('paywall/exit-survey/title')}
          </p>
          <p
            className={css({
              textStyle: 'body',
              color: 'textSoft',
              fontWeight: 'medium',
            })}
          >
            {t('paywall/exit-survey/description')}
          </p>
          <form
            method='POST'
            action={`${process.env.NEXT_PUBLIC_SHOP_BASE_URL}/angebot`}
            onSubmit={() => {
              showThankYou(true)
            }}
          >
            <div
              className={css({
                display: 'flex',
                flexDir: 'column',
                gap: '2',
              })}
            >
              <SurveyButton>Es ist mir zu teuer</SurveyButton>
              <SurveyButton>Ich sehe den Nutzen nicht</SurveyButton>
              <SurveyButton>Andere Gründe</SurveyButton>
            </div>
          </form>
        </RegwallSection>
      )}
    </div>
  )
}
