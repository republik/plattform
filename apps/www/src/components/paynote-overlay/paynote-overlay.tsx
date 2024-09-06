'use client'

import { IconExpandLess, IconExpandMore } from '@republik/icons'
import { css } from '@republik/theme/css'
import { token } from '@republik/theme/tokens'
import { ChangeEventHandler, ReactNode, useId, useState } from 'react'

import * as Collapsible from '@radix-ui/react-collapsible'
import { useMe } from 'lib/context/MeContext'

export function PaynoteOverlay() {
  const [expanded, setExpanded] = useState<boolean>(true)
  const { hasActiveMembership, meLoading } = useMe()

  if (meLoading || hasActiveMembership) {
    return null
  }

  return (
    <Collapsible.Root
      open={expanded}
      onOpenChange={setExpanded}
      className={css({
        position: 'fixed',
        zIndex: 9999,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'pageBackground',
        p: '8',
        boxShadow: 'sm',
        // transition: 'all 0.3s ease-in-out',
      })}
      style={{
        backgroundColor: !expanded
          ? token('colors.text')
          : token('colors.text.inverted'),
        color: !expanded ? token('colors.text.inverted') : token('colors.text'),
      }}
      onClick={() => {
        if (!expanded) {
          setExpanded(true)
        }
      }}
    >
      <Collapsible.Trigger asChild>
        <button
          className={css({
            position: 'absolute',
            top: '4',
            right: '4',
          })}
        >
          {!expanded ? (
            <IconExpandLess size={24} />
          ) : (
            <IconExpandMore size={24} />
          )}
        </button>
      </Collapsible.Trigger>

      <div
        className={css({
          margin: '0 auto',
          maxW: '30rem',
          textStyle: 'serifRegular',
        })}
      >
        <h2
          className={css({
            textStyle: { base: 'h3Serif', sm: 'h2Serif' },
            lineHeight: 1.5,
            textAlign: 'center',
          })}
        >
          <span
            className={css({
              boxDecorationBreak: 'clone',
              px: '1.5',
            })}
            style={{
              backgroundColor: expanded ? '#FDE047' : null,
              color: expanded ? token('colors.text.black') : null,
            }}
          >
            Unterstützen Sie unabhängigen Journalismus
          </span>
        </h2>

        <Collapsible.Content>
          <div className={css({ mt: '4' })}>
            <Offers />
          </div>
        </Collapsible.Content>
      </div>
    </Collapsible.Root>
  )
}

type OfferOptions = 'MONTHLY' | 'YEARLY'

function Offers() {
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
                color: '#ccc',
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
                  color: '#ccc',
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
        p: '4',
        display: 'flex',
        gap: '4',
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
          border: '2px solid black',
        })}
      />

      {children}
    </label>
  )
}
