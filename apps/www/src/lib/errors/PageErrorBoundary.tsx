import { ReactNode, useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { reportError } from './reportError'
import { A, Interaction, Button, Logo } from '@project-r/styleguide'
import { PUBLIC_BASE_URL } from '../constants'
import Head from 'next/head'

type ErrorBoundaryProps = {
  children: ReactNode
}

function PageErrorBoundary({ children }: ErrorBoundaryProps) {
  const [errorId, setErrorId] = useState<string | null>(null)

  return (
    <ErrorBoundary
      FallbackComponent={({ error, resetErrorBoundary }) => (
        <>
          <Head>
            <title>Es ist ein Fehler aufgetreten</title>
            <meta name='robots' content='noindex' />
          </Head>
          <div
            style={{
              minHeight: '100dvh',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <a
              style={{
                width: '100%',
                height: '8vh',
                minHeight: 48,
                maxHeight: 64,
                padding: 16,
                marginTop: 32,
                margin: '0 auto',
                cursor: 'pointer',
              }}
              title='Zur Startseite'
            >
              <Logo fill='var(--color-primary)' height='100%' />
            </a>
            <div
              style={{
                margin: '0 auto',
                maxWidth: '60ch',
                padding: '1rem',
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'start',
                justifyContent: 'center',
                gap: '1rem',
              }}
            >
              <Interaction.H1>Es ist ein Fehler aufgetreten</Interaction.H1>
              <Button primary onClick={() => resetErrorBoundary()}>
                Seite neu laden
              </Button>

              <Interaction.P>
                Sollte dieser Fehler zum wiederholten Male aufgetreten sein,
                wenden Sie sich bitte an{' '}
                <A
                  href={[
                    'mailto:kontakt@republik.ch',
                    '?subject=Fehlermeldung%20auf%20' +
                      PUBLIC_BASE_URL +
                      window.location.pathname,
                    '&body=' +
                      encodeURIComponent(
                        `
Hallo Republik-Team, ich bin auf folgenden Fehler in der Webseite gestossen:

URL: ${PUBLIC_BASE_URL}${window.location.pathname}
${errorId ? `Fehler ID: ${errorId}` : ''}
Fehler:
${error.message}
${error.stack}
                  `,
                      ),
                  ].join('')}
                  style={{
                    textDecoration: 'underline',
                  }}
                >
                  kontakt@republik.ch
                </A>
                .
              </Interaction.P>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'flex-start',
                padding: 16,
              }}
            >
              {errorId && (
                <Interaction.P
                  style={{
                    fontSize: '1rem',
                  }}
                >
                  Fehler: {errorId}
                </Interaction.P>
              )}
            </div>
          </div>
        </>
      )}
      onError={(error) => {
        reportError('PageErrorBoundary', error).then((id) => setErrorId(id))
      }}
      onReset={() => {
        // reload after error
        location.reload()
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

export default PageErrorBoundary
