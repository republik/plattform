'use client'

import { useState } from 'react'

import { useTrackEvent } from '@app/lib/analytics/event-tracking'
import { getUTMSessionStorage } from '@app/lib/analytics/utm-session-storage'

import { css } from '@republik/theme/css'

import { Button } from '../ui/button'
import { RadioOption } from '../ui/form'
import { ArrowLink } from '../ui/links'

import { RegwallSection } from '../regwall/containers'

import { ExitSurvey } from './exit-survey'

type OfferOptions = 'MONTHLY' | 'YEARLY'

export function Offers({
  additionalShopParams = {},
}: {
  additionalShopParams?: Record<string, string>
}) {
  const [option, setOption] = useState<OfferOptions>('YEARLY')
  const [survey, showSurvey] = useState(false)

  const utmParams = getUTMSessionStorage()

  const trackEvent = useTrackEvent()

  return (
    <>
      <RegwallSection backgroundColor='#DAFF8D'>
        <h3>Einstiegsangebot</h3>
        <h2>
          <span className={css({ fontWeight: 'normal' })}>
            Ihre kostenlose Gastwoche ist zu Ende.
          </span>{' '}
          Doch unsere gemeinsame Reise muss hier nicht enden.
        </h2>
        <form
          method='GET'
          action={`${process.env.NEXT_PUBLIC_SHOP_BASE_URL}/angebot`}
          onSubmit={() => {
            trackEvent({
              action: `Go to ${option} shop`,
            })
          }}
        >
          {Object.entries(utmParams).map(([k, v]) => {
            return <input type='hidden' hidden key={k} name={k} value={v} />
          })}
          {Object.entries(additionalShopParams).map(([k, v]) => {
            return <input type='hidden' hidden key={k} name={k} value={v} />
          })}
          <div
            className={css({
              display: 'flex',
              gap: '4',
              flexDir: 'column',
              textStyle: 'body',
              alignItems: 'center',
            })}
          >
            <div
              className={css({
                borderTop: '1px solid',
                width: 'full',
                py: '4',
                mt: '6',
                position: 'relative',
              })}
            >
              <span
                className={css({
                  position: 'absolute',
                  top: '-12px',
                  right: '2',
                  backgroundColor: '#C398D5',
                  color: 'white',
                  textTransform: 'uppercase',
                  fontSize: 'xs',
                  fontWeight: 500,
                  px: '4',
                  py: '1',
                  borderRadius: 16,
                })}
              >
                Sie sparen 14&thinsp;%
              </span>
              <RadioOption
                name='YEARLY'
                value='YEARLY'
                checked={option === 'YEARLY'}
                onChange={() => setOption('YEARLY')}
              >
                <span
                  className={css({
                    display: 'flex',
                    flexDir: 'column',
                    gap: '1',
                  })}
                >
                  <span className={css({ fontSize: 'xl' })}>
                    <del
                      className={css({
                        color: 'textSoft',
                        mr: '2',
                      })}
                    >
                      <span className={css({ fontSize: 'l' })}>CHF </span>
                      240
                    </del>
                    222.–&thinsp;/&thinsp;erste Jahr
                  </span>
                  <span>Danach 240.- jährlich. Jederzeit kündbar.</span>
                </span>
              </RadioOption>
            </div>

            <div
              className={css({
                borderTop: '1px solid',
                width: 'full',
                py: '4',
                mb: '6',
              })}
            >
              <RadioOption
                name='MONTHLY'
                value='MONTHLY'
                checked={option === 'MONTHLY'}
                onChange={() => setOption('MONTHLY')}
              >
                <span
                  className={css({
                    display: 'flex',
                    flexDir: 'column',
                    gap: '1',
                  })}
                >
                  <span className={css({ fontSize: 'xl' })}>
                    <del
                      className={css({
                        color: 'textSoft',
                        mr: '2',
                      })}
                    >
                      <span className={css({ fontSize: 'l' })}>CHF </span>
                      22
                    </del>
                    11.–&thinsp;/&thinsp;erste Monat
                  </span>
                  <span>Danach 22.- monatlich. Jederzeit kündbar.</span>
                </span>
              </RadioOption>
            </div>

            <Button type='submit' size='large'>
              Jetzt abonnieren
            </Button>
            {!survey && (
              <Button
                type='button'
                variant='outline'
                size='large'
                onClick={() => showSurvey(true)}
              >
                Nein Danke, weil…
              </Button>
            )}
            {!survey && (
              <ArrowLink
                href={`${process.env.NEXT_PUBLIC_SHOP_BASE_URL}/angebot`}
              >
                Alle Mitgliedschafte ansehen
              </ArrowLink>
            )}
          </div>
        </form>
      </RegwallSection>
      {survey && <ExitSurvey />}
    </>
  )
}
