'use client'

import { css } from '@republik/theme/css'
import { ChangeEventHandler, ReactNode, useId, useState } from 'react'

type OfferOptions = 'MONTHLY' | 'YEARLY'

export function Offers() {
  const [option, setOption] = useState<OfferOptions>('YEARLY')

  return (
    <form method='GET' action='https://shop.republik.love/angebot'>
      <div
        className={css({
          display: 'flex',
          gap: '4',
          flexDir: 'column',
          textStyle: 'body',
        })}
      >
        <Option
          value='MONTHLY'
          selected={option === 'MONTHLY'}
          onChange={(e) => setOption('MONTHLY')}
        >
          <span className={css({ display: 'block' })}>
            <del
              className={css({
                color: 'disabled',
                mr: '1',
              })}
            >
              24.–
            </del>
            <span className={css({ fontWeight: 'medium' })}>
              11.– für einen Monat
            </span>
          </span>
        </Option>
        <Option
          value='YEARLY'
          selected={option === 'YEARLY'}
          onChange={(e) => setOption('YEARLY')}
        >
          <span
            className={css({ display: 'flex', gap: '2', flexDir: 'column' })}
          >
            <span>
              <del
                className={css({
                  color: 'disabled',
                  mr: '1',
                })}
              >
                240.–
              </del>
              <span className={css({ fontWeight: 'medium' })}>
                222.– für ein Jahr
              </span>
            </span>
            <span
              className={css({
                backgroundColor: '#FDE047',
                color: 'text.black',
                px: '1',
                py: '0.5',
                borderRadius: '2px',
                fontSize: 's',
              })}
            >
              14% günstiger als ein Monatsabo
            </span>
          </span>
        </Option>

        <div
          className={css({
            fontSize: 'xs',
          })}
        >
          {option === 'YEARLY'
            ? 'Unlimitierter Zugang. 240.– jährlich nach dem ersten Jahr. Jederzeit kündbar.'
            : 'Unlimitierter Zugang. 24.– monatlich nach dem ersten Monat. Jederzeit kündbar.'}
        </div>

        <button
          type='submit'
          className={css({
            display: 'inline-flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '5px',
            fontSize: 'base',
            lineHeight: '1',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            px: '6',
            py: '3',
            background: 'text',
            color: 'text.inverted',
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
