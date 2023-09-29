'use client' // Error components must be Client Components

import { useEffect } from 'react'
import { css } from '@app/styled-system/css'

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
    <div>
      <h2
        className={css({
          textStyle: 'h1Sans',
        })}
      >
        So en chäs! Ds geit nöd!
      </h2>
      <pre>{JSON.stringify(error, null, 2)}</pre>
      <button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        Try again
      </button>
    </div>
  )
}
