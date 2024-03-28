'use client'

import { css } from '@republik/theme/css'
import { IconClose } from '@republik/icons'
import Link from 'next/link'

type RegularBannerProps = {
  id: string
  payload: {
    text: string
    linkHref: string
    linkLabel: string
  }
  handleAcknowledge: (id: string) => void
}

export function CTABasicBanner({
  id,
  payload,
  handleAcknowledge,
}: RegularBannerProps) {
  const { text, linkHref, linkLabel } = payload
  return (
    <div
      className={css({
        backgroundColor: 'text',
        color: 'pageBackground',
      })}
    >
      <div
        className={css({
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flexStart',
          gap: '1rem',
          margin: '0 auto',
          maxWidth: '60ch',
          padding: '2rem 1rem',
        })}
      >
        <div
          className={css({
            flexGrow: 1,
            '& > p': {
              margin: 0,
              marginBottom: '0.5em',
            },
            '& > a': {
              color: 'pageBackground',
              textDecoration: 'underline',
            },
          })}
        >
          <p>{text}</p>
          <Link href={linkHref} onClick={() => handleAcknowledge(id)}>
            {linkLabel}
          </Link>
        </div>
        <button
          className={css({
            height: '2rem',
            width: '2rem',
            cursor: 'pointer',
          })}
          onClick={() => handleAcknowledge(id)}
        >
          <IconClose
            size='1.5rem'
            className={css({ fill: 'pageBackground' })}
          />
        </button>
      </div>
    </div>
  )
}
