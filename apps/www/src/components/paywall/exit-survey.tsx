'use client'

import { ReactNode, useState } from 'react'

import { css } from '@republik/theme/css'

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
  return (
    <RegwallSection backgroundColor='#F2ECE6'>
      <p className={css({ textStyle: 'airy', fontWeight: 'medium' })}>
        Vielen Dank für Ihr Feedback, wir hoffen, Sie bald wiederzusehen! 👋
      </p>
      <p className={css({ textStyle: 'body' })}>
        PS: Wussten Sie, dass Sie unser wöchentliches Nachrichtenbriefing auch
        ohne Abo als Newsletter erhalten können?
      </p>
      <ArrowLink href='/format/was-diese-woche-wichtig-war'>
        Schauen Sie es Ihnen an
      </ArrowLink>
    </RegwallSection>
  )
}

export function ExitSurvey() {
  const [thankYou, showThankYou] = useState(false)

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
            Warum kommt ein Republik-Abo für Sie derzeit nicht in Frage?
          </p>
          <p
            className={css({
              textStyle: 'body',
              color: 'textSoft',
              fontWeight: 'medium',
            })}
          >
            Pick the answer that describe your situation:
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
