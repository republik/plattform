'use client'

import { usePaynotes } from '@/app/(sanity)/components/paynotes/paynotes-context'
import Paywall from '@/app/(sanity)/components/paynotes/paywall'
import Regwall from '@/app/(sanity)/components/paynotes/regwall'
import { Article } from '@/sanity.types'
import { css } from '@republik/theme/css'
import { usePathname } from 'next/navigation'
import { ReactNode, useEffect } from 'react'

// both excerpt and fullContent should be rendered in the parent component, (server-side)
export function ContentWall({
  readingAccess,
  excerpt,
  fullContent,
}: {
  readingAccess: Article['readingAccess']
  excerpt: ReactNode
  fullContent: ReactNode
}) {
  const { setDocumentTypeForPaynotes, setReadingAccess, hasPaywall } =
    usePaynotes()
  const pathname = usePathname()

  useEffect(() => {
    setDocumentTypeForPaynotes('article')
    setReadingAccess(readingAccess)
    // reset when navigating away
    return () => {
      setDocumentTypeForPaynotes(null)
      setReadingAccess('OPEN')
    }
  }, [readingAccess, pathname, setDocumentTypeForPaynotes, setReadingAccess])

  return (
    <>
      {hasPaywall ? (
        <>
          {excerpt}
          <div
            className={css({
              width: '100%',
              height: '200px',
              mt: '-200px',
              background:
                'linear-gradient(0deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
            })}
          />
        </>
      ) : (
        { fullContent }
      )}

      <div className={css({ gridColumn: 'full' })}>
        <Regwall key={`regwall-${pathname}`} />
        <Paywall key={`paywall-${pathname}`} />
      </div>
    </>
  )
}
