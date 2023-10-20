import Container from '@app/components/container'
import { PageHeader } from '@app/components/layout/header'
import { css } from '@app/styled-system/css'
import { stack } from '@app/styled-system/patterns'
import Link from 'next/link'
import React from 'react'

function NotFound() {
  return (
    <>
      <PageHeader />
      <Container>
        <div className={stack({ gap: '4', mt: '16' })}>
          <h1
            className={css({
              textStyle: 'h1Sans',
              mt: '8',
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
          <p>Root 404-Seite</p>
          <Link href='/' className={css({ textStyle: 'serifItalic' })}>
            Zum Magazin
          </Link>
        </div>
      </Container>
    </>
  )
}

export default NotFound
