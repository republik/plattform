'use client'

import { usePaynotes } from '@/app/(sanity)/components/paynotes/paynotes-context'
import Paywall from '@/app/(sanity)/components/paynotes/paywall'
import Regwall from '@/app/(sanity)/components/paynotes/regwall'
import { Article } from '@/sanity.types'
import { css } from '@republik/theme/css'
import { usePathname } from 'next/navigation'
import { ReactNode, useEffect } from 'react'

export function ContentWall({
  children,
  readingAccess,
}: {
  children: ReactNode
  readingAccess: Article['readingAccess']
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
      <div className='regwall'>{hasPaywall ? <p>TODO</p> : children}</div>
      <div className={css({ gridColumn: 'full' })}>
        <Regwall key={`regwall-${pathname}`} />
        <Paywall key={`paywall-${pathname}`} />
      </div>
    </>
  )
}
