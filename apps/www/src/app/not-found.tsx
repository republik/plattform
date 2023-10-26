import Container from '@app/components/container'
import Footer from '@app/components/layout/footer'
import { PageHeader } from '@app/components/layout/header'
import { css } from '@app/styled-system/css'
import { stack } from '@app/styled-system/patterns'
import Link from 'next/link'
import React from 'react'

function NotFound() {
  return (
    <div
      className={css({
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
      })}
    >
      <PageHeader />
      <div
        className={css({
          flexGrow: 1,
        })}
      >
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
      </div>
      <Footer />
    </div>
  )
}

export default NotFound
