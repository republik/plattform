'use client' // Error components must be Client Components
import logo from '@republik/theme/logo.json'

import { useEffect } from 'react'
import { css } from '@republik/theme/css'
import Link from 'next/link'
import Container from '@app/components/container'
import { stack } from '@republik/theme/patterns'
import { PUBLIC_BASE_URL } from 'lib/constants'

const linkClass = css({
  color: 'primary',
  textDecoration: 'none',
  _hover: {
    textDecoration: 'underline',
  },
})

export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])
  return (
    <div
      className={css({
        minHeight: '100dvh',
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
        <svg
          viewBox={logo.LOGO_VIEWBOX}
          className={css({
            fill: 'text',
            height: 'header.logoHeight',
          })}
        >
          <path d={logo.LOGO_PATH}></path>
        </svg>
      </div>
      <div
        className={css({
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: '4',
        })}
      >
        <Container>
          <div className={stack({ gap: '4', mt: '16' })}>
            <h1
              className={css({
                textStyle: 'sansSerifBold',
                fontSize: '3xl',
                mt: '16',
                mb: '4',
                md: {
                  mt: '32',
                },
              })}
            >
              Es ist ein Fehler aufgetreten
            </h1>

            <p>
              Sollte dieser Fehler zum wiederholten Male aufgetreten sein,
              wenden Sie sich bitte an{' '}
              <a
                className={linkClass}
                href={[
                  'mailto:kontakt@republik.ch',
                  '?subject=Fehlermeldung%20auf%20' +
                    PUBLIC_BASE_URL +
                    window.location.pathname,
                  '&body=' +
                    encodeURIComponent(
                      [
                        'Hallo Republik-Team, ich bin auf folgenden Fehler in der Webseite gestossen:',
                        `URL: ${PUBLIC_BASE_URL}${window.location.pathname}`,
                        error.stack,
                      ].join('\n\n'),
                    ),
                ].join('')}
              >
                kontakt@republik.ch
              </a>
              .
            </p>

            <div
              className={css({
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4',
                mt: '4',
                md: {
                  flexDirection: 'row',
                  alignItems: 'center',
                },
                '& > *': {
                  alignSelf: 'stretch',
                  textAlign: 'center',
                  md: {
                    alignSelf: 'auto',
                    textAlign: 'start',
                  },
                },
              })}
            >
              <button
                className={css({
                  px: '5',
                  py: '3',
                  backgroundColor: 'primary',
                  color: 'white',
                  _hover: {
                    backgroundColor: 'primaryHover',
                  },
                })}
                onClick={() => reset()}
              >
                Erneut versuchen
              </button>
              <p>oder</p>
              <Link href='/' className={linkClass}>
                zum Magazin
              </Link>
            </div>
          </div>
        </Container>
      </div>
    </div>
  )
}
