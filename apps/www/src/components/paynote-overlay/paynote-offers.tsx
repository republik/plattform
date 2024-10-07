'use client'

import { useTrackEvent } from '@app/lib/analytics/event-tracking'
import { getUTMSessionStorage } from '@app/lib/analytics/utm-session-storage'
import { css } from '@republik/theme/css'
import { ChangeEventHandler, ReactNode, useId, useState } from 'react'

type OfferOptions = 'MONTHLY' | 'YEARLY'

export function Offers({
  additionalShopParams = {},
}: {
  additionalShopParams?: Record<string, string>
}) {
  const [option, setOption] = useState<OfferOptions>('YEARLY')

  const utmParams = getUTMSessionStorage()

  const trackEvent = useTrackEvent()

  return (
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
        <Option
          value='MONTHLY'
          selected={option === 'MONTHLY'}
          onChange={() => setOption('MONTHLY')}
        >
          <span className={css({ display: 'block' })}>
            <del
              className={css({
                color: 'textSoft',
                fontWeight: 'medium',
                mr: '1',
              })}
            >
              22.–
            </del>
            <span className={css({ fontWeight: 'bold' })}>
              11.– für einen Monat
            </span>
          </span>
        </Option>
        <Option
          value='YEARLY'
          selected={option === 'YEARLY'}
          onChange={() => setOption('YEARLY')}
        >
          <span
            className={css({ display: 'flex', gap: '2', flexDir: 'column' })}
          >
            <span>
              <del
                className={css({
                  color: 'textSoft',
                  fontWeight: 'medium',
                  mr: '1',
                })}
              >
                240.–
              </del>
              <span className={css({ fontWeight: 'bold' })}>
                222.– für ein Jahr
              </span>
            </span>
            <span
              className={css({
                backgroundColor: '#FDE047',
                color: 'text.black',
                px: '1',
                borderRadius: '2px',
                fontSize: 's',
              })}
            >
              12&thinsp;% günstiger als ein Monats-Abo
            </span>
          </span>
        </Option>

        <div
          className={css({
            fontSize: 's',
          })}
        >
          {option === 'YEARLY'
            ? 'Unlimitierter Zugang. 240.– jährlich nach dem ersten Jahr. Jederzeit kündbar.'
            : 'Unlimitierter Zugang. 22.– monatlich nach dem ersten Monat. Jederzeit kündbar.'}
        </div>

        <button
          type='submit'
          className={css({
            display: 'inline-flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '5px',
            fontSize: 'l',
            lineHeight: '1',
            fontWeight: 'medium',
            whiteSpace: 'nowrap',
            px: '6',
            py: '3',
            background: 'text',
            color: 'text.inverted',
            mt: '2',
            cursor: 'pointer',
          })}
        >
          Jetzt abonnieren
        </button>
      </div>
    </form>
  )
}

function Option({
  value,
  selected,
  children,
  onChange,
}: {
  value: string
  selected: boolean
  children: ReactNode
  onChange: ChangeEventHandler<HTMLInputElement>
}) {
  const id = useId()
  return (
    <label
      className={css({
        borderWidth: 2,
        borderStyle: 'solid',
        borderRadius: '5px',
        borderColor: 'disabled',
        w: 'full',
        p: '4',
        display: 'flex',
        gap: '4',
        alignItems: 'center',
        '&:has(:checked)': {
          borderColor: 'text',
        },
      })}
    >
      <input
        id={id}
        value={value}
        name='product'
        type='radio'
        checked={selected}
        onChange={onChange}
        className={css({
          flexShrink: 0,
          // Custom checkbox style, see https://moderncss.dev/pure-css-custom-styled-radio-buttons/
          appearance: 'none',
          backgroundColor: 'text.inverted',
          margin: 0,
          color: 'currentColor',
          width: '1.15em',
          height: '1.15em',
          borderWidth: 2,
          borderStyle: 'solid',
          borderColor: 'disabled',
          borderRadius: 'full',
          display: 'grid',
          placeContent: 'center',
          outline: 'none',
          _before: {
            content: '""',
            width: '0.35em',
            height: '0.35em',
            borderRadius: 'full',
            backgroundColor: 'text.inverted',
          },
          _checked: {
            backgroundColor: 'text',
            borderColor: 'text',
          },
        })}
      />

      {children}
    </label>
  )
}
