import Container from '@app/components/container'
import { PageLayout } from '@app/components/layout'
import { css } from '@republik/theme/css'
import { stack } from '@republik/theme/patterns'
import Link from 'next/link'
import React from 'react'

function NotFound() {
  return (
    <PageLayout>
      <Container>
        <div className={stack({ gap: '4', mt: '4', mb: '16' })}>
          <h1
            className={css({
              textStyle: 'h1Sans',
              mt: '8',
              fontSize: '8xl',
              marginY: '16',
              textAlign: 'center',
              md: {
                fontSize: '300px',
                marginY: '60px',
              },
            })}
          >
            404
          </h1>
          <p
            className={css({
              textStyle: 'sans',
              fontSize: '1.3125rem',
              lineHeight: '2rem',
            })}
          >
            Seite nicht gefunden
          </p>
          <Link
            href='/'
            className={css({
              color: 'primary',
              textDecoration: 'none',
              _hover: {
                color: 'primaryHover',
              },
            })}
          >
            Zum Magazin
          </Link>
        </div>
      </Container>
    </PageLayout>
  )
}

export default NotFound
