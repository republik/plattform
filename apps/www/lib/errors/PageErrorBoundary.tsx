import { ReactNode } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { reportError } from './reportError'
import { A, Interaction, Button } from '@project-r/styleguide'
import { PUBLIC_BASE_URL } from '../constants'
import { divide } from 'lodash'

type ErrorBoundaryProps = {
  children: ReactNode
}

function PageErrorBoundary({ children }: ErrorBoundaryProps) {
  return (
    <ErrorBoundary
      FallbackComponent={({ error, resetErrorBoundary }) => (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '80vh',
          }}
        >
          <div
            style={{
              margin: '0 auto',
              maxWidth: '60ch',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
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
Fehler:
${error.message}
${error.stack}
                  `,
                    ),
                ].join('')}
              >
                kontakt@republik.ch
              </A>
              .
            </Interaction.P>
          </div>
        </div>
      )}
      onError={(error, info) => {
        reportError(
          'componentDidCatch',
          `${error}${info.componentStack}\n${error && error.stack}`,
        )
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
