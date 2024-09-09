'use client'

import { Paynote } from '@app/app/api/paynote/types'
import { Offers } from '@app/components/paynote-overlay/paynote-components'
import { css } from '@republik/theme/css'
import { useEffect, useState } from 'react'
import { StructuredText } from 'react-datocms'

const usePaynote = () => {
  const [paynote, setPaynote] = useState<Paynote | undefined>()

  useEffect(() => {
    if (!paynote) {
      fetch('/api/paynote')
        .then((res) => res.json())
        .then((pn: Paynote) => setPaynote(pn))
    }
  }, [paynote])

  return paynote
}

export function PaynoteArticle() {
  const paynote = usePaynote()

  if (!paynote) {
    return <div></div>
  }

  return (
    <div
      className={css({
        margin: '0 auto',
        maxW: '695px',
        px: '15px',
        py: '8',
        textStyle: 'serifRegular',
        lineHeight: 1.5,
        fontSize: 'l',
        display: 'flex',
        flexDir: 'column',
        gap: '6',
      })}
    >
      <h2
        className={css({
          textStyle: { base: 'h3Serif', sm: 'h1Serif' },
          lineHeight: 1.5,
        })}
      >
        <span
          className={css({
            boxDecorationBreak: 'clone',
            px: '1.5',
            backgroundColor: '#FDE047',
          })}
        >
          {paynote.title}
        </span>
      </h2>

      <StructuredText data={paynote.message.value}></StructuredText>

      <Offers />
    </div>
  )
}
