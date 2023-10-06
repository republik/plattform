import Container from '@app/components/container'
import { css } from '@app/styled-system/css'
import { stack } from '@app/styled-system/patterns'
import Link from 'next/link'
import React from 'react'

function NotFound() {
  return (
    <Container>
      <div className={stack({ gap: '4', mt: '16' })}>
        <h1
          className={css({
            textStyle: 'h1Sans',
          })}
        >
          404 - Seite nicht gefunden
        </h1>
        <p
          className={css({
            textStyle: 'sans',
          })}
        >
          Die Seite, die du suchst, existiert nicht.
        </p>
        <Link
          href='/challenge-accepted'
          className={css({ textStyle: 'serifItalic' })}
        >
          Zum Challenge Accepted Hub
        </Link>
      </div>
    </Container>
  )
}

export default NotFound
