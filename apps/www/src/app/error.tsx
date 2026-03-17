'use client' // Error components must be Client Components

import { ErrorPage } from '@app/components/layout/error-page'
import { css } from '@republik/theme/css'
import * as Sentry from '@sentry/nextjs'
import { PUBLIC_BASE_URL } from 'lib/constants'
import Link from 'next/link'
import { useEffect, useState } from 'react'

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
  const [errorId, setErrorId] = useState<string | null>(null)

  useEffect(() => {
    // Log the error to an error reporting service
    const eventId = Sentry.captureException(error, {
      tags: {
        origin: 'ErrorBoundary',
        routing: 'app-dir',
      },
    })
    setErrorId(eventId)
  }, [error, setErrorId])

  return (
    <ErrorPage>
      <h1
        className={css({
          textStyle: 'h1Sans',
        })}
      >
        Es ist ein Fehler aufgetreten
      </h1>

      <p>
        Sollte dieser Fehler zum wiederholten Male aufgetreten sein, wenden Sie
        sich bitte an{' '}
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
                  errorId ? `Fehler ID: ${errorId}` : null,
                  `URL: ${PUBLIC_BASE_URL}${window.location.pathname}`,
                  error.stack,
                ]
                  .filter(Boolean)
                  .join('\n\n'),
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
          justifyContent: 'center',
          alignItems: 'center',
          gap: '2',
          md: {
            flexDirection: 'row',
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
          Seite neu laden
        </button>
        <p>oder</p>
        <Link href='/' className={linkClass}>
          zum Magazin
        </Link>
      </div>
      <div>
        {errorId && (
          <p
            className={css({
              color: 'textSoft',
              fontSize: 's',
              textAlign: 'center',
              pb: '4',
            })}
          >
            Fehler: {errorId}
          </p>
        )}
      </div>
    </ErrorPage>
  )
}
