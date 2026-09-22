'use client'

import CampaignPaywall from '@/app/(sanity)/components/paynotes/campaign/campaign-paywall'
import { GiftExpiredPaynote } from '@/app/(sanity)/components/paynotes/gift-paynote'
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
  documentId,
  excerpt,
  fullContent,
}: {
  readingAccess: Article['readingAccess']
  /** Sanity document ref, so the paynote logic can match a gift link to it. */
  documentId: string
  excerpt: ReactNode
  fullContent: ReactNode
}) {
  const {
    setDocumentTypeForPaynotes,
    setReadingAccess,
    setGiftDocumentId,
    hasPaywall,
  } = usePaynotes()
  const pathname = usePathname()

  useEffect(() => {
    setDocumentTypeForPaynotes('article')
    setReadingAccess(readingAccess)
    setGiftDocumentId(documentId)
    // reset when navigating away
    return () => {
      setDocumentTypeForPaynotes(null)
      setReadingAccess('REGWALL')
      setGiftDocumentId(null)
    }
  }, [
    readingAccess,
    documentId,
    pathname,
    setDocumentTypeForPaynotes,
    setReadingAccess,
    setGiftDocumentId,
  ])

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
              bgGradient: 'simple',
            })}
          />
        </>
      ) : (
        <>{fullContent}</>
      )}

      <div className={css({ gridColumn: 'full' })}>
        <Regwall key={`regwall-${pathname}`} />
        <Paywall key={`paywall-${pathname}`} />
        <CampaignPaywall key={`campaign-paywall-${pathname}`} />
        <GiftExpiredPaynote key={`gift-expired-${pathname}`} />
      </div>
    </>
  )
}
