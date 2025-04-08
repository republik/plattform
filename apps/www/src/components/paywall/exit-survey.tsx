'use client'

import { ReactNode, useState } from 'react'

import { css } from '@republik/theme/css'

import { useTranslation } from 'lib/withT'

import { PaynoteSection } from '../ui/containers'

import { Button } from '../ui/button'
import { ArrowLink } from '../ui/links'

function SurveyButton({ children }: { children: ReactNode }) {
  return (
    <Button variant='outline' size='full' className={css({ fontWeight: 400 })}>
      {children}
    </Button>
  )
}

function ThankYou() {
  const { t } = useTranslation()
  return (
    <PaynoteSection backgroundColor='#F2ECE6'>
      <p className={css({ textStyle: 'airy', fontWeight: 'medium' })}>
        {t('paywall/survey/thanks/title')}
      </p>
      <p className={css({ textStyle: 'body' })}>
        {t('paywall/survey/thanks/description')}
      </p>
      <ArrowLink href='/format/was-diese-woche-wichtig-war'>
        {t('paywall/survey/thanks/link')}
      </ArrowLink>
    </PaynoteSection>
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
        <PaynoteSection backgroundColor='#F2ECE6'>
          <p className={css({ textStyle: 'airy', fontWeight: 'medium' })}>
            {t('paywall/survey/title')}
          </p>
          <p
            className={css({
              textStyle: 'body',
              color: 'textSoft',
              fontWeight: 'medium',
            })}
          >
            {t('paywall/survey/description')}
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
        </PaynoteSection>
      )}
    </div>
  )
}
