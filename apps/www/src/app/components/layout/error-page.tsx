import logo from '@republik/theme/logo.json'
import { PropsWithChildren } from 'react'

import Container from '@/app/components/container'
import { css } from '@republik/theme/css'
import { stack } from '@republik/theme/patterns'
import Link from 'next/link'

export function ErrorPage({ children }: PropsWithChildren) {
  return (
    <div
      className={css({
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
      })}
    >
      <div
        className={css({
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          p: '4',
        })}
      >
        <Link href='/'>
          <svg
            viewBox={logo.LOGO_VIEWBOX}
            className={css({
              fill: 'text',
              height: 'header.logoHeight',
            })}
          >
            <path d={logo.LOGO_PATH}></path>
          </svg>
        </Link>
      </div>
      <div
        className={css({
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: '4',
          fontSize: 'l',
        })}
      >
        <Container>
          <div className={stack({ gap: '4', textAlign: 'center' })}>
            {children}
          </div>
        </Container>
      </div>
    </div>
  )
}
