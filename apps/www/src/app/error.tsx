'use client' // Error components must be Client Components

import { useEffect } from 'react'
import { css } from '@app/styled-system/css'
import Link from 'next/link'
import Container from '@app/components/container'
import { stack } from '@app/styled-system/patterns'

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
    <Container>
      <div className={stack({ gap: '4', mt: '16' })}>
        <h1
          className={css({
            textStyle: 'sansSerifBold',
            fontSize: '3xl',
          })}
        >
          Fehler, etwas ist schiefgelaufen
        </h1>
        <details className={css({ mt: '6' })}>
          <summary>Fehlermeldung</summary>
          <pre>
            <code>{error.message}</code>
          </pre>
        </details>
        <button
          className={css({
            px: '5',
            py: '3',
          })}
          style={{ border: '1px solid black' }}
          onClick={() => reset()}
        >
          Erneut versuchen
        </button>
        <p>oder</p>
        <Link href='/'>Zum Magazin</Link>
      </div>
    </Container>
  )
}
