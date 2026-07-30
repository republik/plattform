'use client'

import { useCampaign } from '@/app/components/paynotes/campaign/use-campaign'

import { useMe } from '@/lib/context/MeContext'
import { useUserAgent } from '@/lib/context/UserAgentContext'
import { Article } from '@/sanity.types'

import {
  usePathname,
  useSearchParams,
  type ReadonlyURLSearchParams,
} from 'next/navigation'
import { createContext, Suspense, useContext, useEffect, useState } from 'react'
import { updateArticleMetering } from './article-metering'

export type PaynoteKindType =
  | null
  | 'DIALOG'
  | 'OVERLAY_CLOSED'
  | 'OVERLAY_OPEN'
  | 'REGWALL'
  | 'PAYWALL'
  | 'BANNER'
  | 'PAYNOTE_INLINE'
  | 'WELCOME_BANNER'
  | 'CAMPAIGN_PAYNOTE'
  | 'CAMPAIGN_PAYWALL'
  | 'CAMPAIGN_BANNER' // not a paynote per se, but logic depends on the same params

const PAYWALL_KINDS: PaynoteKindType[] = [
  'REGWALL',
  'PAYWALL',
  'CAMPAIGN_PAYWALL',
]

type DocumentType = null | 'article' | 'discussion' | 'page'

type PaynotesContextValues = {
  paynoteKind: PaynoteKindType
  hasPaywall?: boolean
  setDocumentTypeForPaynotes: (documentType: DocumentType) => void
  setReadingAccess: (readingAccess: Article['readingAccess']) => void
  paynoteInlineHeight: number
  setPaynoteInlineHeight: (height: number) => void
}

const PaynotesContext = createContext<PaynotesContextValues>(
  {} as PaynotesContextValues,
)

export const usePaynotes = (): PaynotesContextValues =>
  useContext(PaynotesContext)

function isPaynoteOverlayHidden(
  pathname: string,
  searchParams: URLSearchParams,
): boolean {
  return (
    (pathname === '/angebote' && searchParams.has('package')) ||
    pathname === '/mitteilung' ||
    pathname === '/anmelden' ||
    pathname.startsWith('/konto') ||
    pathname === '/meine-republik' ||
    pathname === '/probelesen' ||
    pathname === '/community' ||
    searchParams.has('extract') ||
    searchParams.has('extractId') ||
    pathname.startsWith('/preview')
  )
}

// This hook combines the trial status, pathname
// and template type to decide which paynote to show.
// Instead of having bits of logic in multiple places,
// we centralize the logic here.
//
// See also: Figma, Registration experience, for a
// visual overview of the paynote flow.

function isDialogPage(pathname: string): boolean {
  return pathname.startsWith('/dialog/')
}

// Extra component for reading searchParams that must be wrapped in <Suspense> (see below)
function PaynotesSearchParams({
  setSearchParams,
}: {
  setSearchParams: (params: ReadonlyURLSearchParams | null) => void
}) {
  const searchParams = useSearchParams()
  useEffect(() => {
    setSearchParams(searchParams)
  }, [searchParams])
  return null
}

export const PaynotesProvider = ({ children }) => {
  const { meLoading, trialStatus, hasAllowlistAccess } = useMe()
  const { campaign } = useCampaign()

  const pathname = usePathname()
  const [searchParams, setSearchParams] = useState(null)

  const { isSearchBot } = useUserAgent()

  const [paynoteKind, setPaynoteKind] = useState<PaynoteKindType>(null)
  const [paynoteInlineHeight, setPaynoteInlineHeight] = useState<number>(0)

  // In an ideal world we would know based on the pathname what template
  // we are dealing with, but we don't live in an ideal world.
  const [documentType, setDocumentTypeForPaynotes] =
    useState<DocumentType>(null)

  const [readingAccess, setReadingAccess] =
    useState<Article['readingAccess']>('OPEN')

  const isCampaignActive = campaign?.isActive

  useEffect(() => {
    if (meLoading || !searchParams || !pathname) {
      return
    }

    // console.log({ template, trialStatus, pathname, searchParams })

    if (trialStatus === 'MEMBER' && isCampaignActive) {
      return setPaynoteKind('CAMPAIGN_BANNER')
    }

    // Active membership: no paynote
    if (trialStatus === 'MEMBER') {
      return setPaynoteKind(null)
    }
    // IP allowlist access: no paynote
    if (hasAllowlistAccess) {
      return setPaynoteKind(null)
    }
    // ANYTHING THAT'S NOT AN ARTICLE:
    //
    // special pages without any paynote
    if (
      readingAccess === 'OPEN' ||
      isPaynoteOverlayHidden(pathname, searchParams)
    ) {
      return setPaynoteKind(null)
    }
    // dialog page: we show a special paynote
    if (isDialogPage(pathname) || documentType === 'discussion') {
      return setPaynoteKind('DIALOG')
    }

    // CAMPAIGN active and *not* an article
    if (isCampaignActive && documentType !== 'article') {
      return setPaynoteKind('CAMPAIGN_PAYNOTE')
    }

    // anything else that's not an article: minimized paynote overlay
    if (documentType !== 'article') {
      return setPaynoteKind('OVERLAY_CLOSED')
    }

    // ARTICLES:
    //
    // search bots: no paywall (we want texts to be indexed)
    // but we show the overlay (in case someone is
    // spoofing the user agent to read our content, we still
    // want to show these clever foxes the paywall)

    if (isSearchBot) {
      return setPaynoteKind('OVERLAY_OPEN')
    }

    // just signed up for a trial: welcome banner
    if (
      trialStatus.includes('TRIAL_GROUP') &&
      searchParams.has('trialSignup')
    ) {
      return setPaynoteKind('WELCOME_BANNER')
    }

    // CAMPAIGN edge case: already in a trial during the campaign
    if (trialStatus.includes('TRIAL_GROUP') && isCampaignActive) {
      return setPaynoteKind('CAMPAIGN_PAYNOTE')
    }

    // one trial group (group A) is shown an inline paynote
    if (trialStatus === 'TRIAL_GROUP_A') {
      return setPaynoteKind('PAYNOTE_INLINE')
    }
    // the other group (group B) is shown the more prominent overlay
    if (trialStatus === 'TRIAL_GROUP_B') {
      return setPaynoteKind('OVERLAY_OPEN')
    }

    // abo teilen users are shown the inline paynote
    if (trialStatus === 'TRIAL_GROUP_TEILEN') {
      return setPaynoteKind('PAYNOTE_INLINE')
    }

    // exception for marked articles (via metadata)
    if (readingAccess === 'PAYNOTE' && isCampaignActive) {
      return setPaynoteKind('CAMPAIGN_PAYNOTE')
    }

    // exception for marked articles (via metadata)
    if (readingAccess === 'PAYNOTE') {
      return setPaynoteKind('OVERLAY_CLOSED')
    }

    // CAMPAIGN active
    if (isCampaignActive) {
      return setPaynoteKind('CAMPAIGN_PAYWALL')
    }

    // trial expired: show paywall
    if (trialStatus === 'NOT_TRIAL_ELIGIBLE') {
      return setPaynoteKind('PAYWALL')
    }

    // CAVEAT: we don't ever want the "documentType" state to be set to something
    // wrong (notably: "article") after the pathname has changed. Otherwise some funny
    // pages (eg "/feed") may count towards the metering.
    const { meteringStatus } = updateArticleMetering(pathname)
    if (meteringStatus === 'READING_GRANTED') {
      return setPaynoteKind('OVERLAY_OPEN')
    }
    // trial eligible users see the regwall
    if (trialStatus === 'TRIAL_ELIGIBLE') {
      return setPaynoteKind('REGWALL')
    }

    // catch-all: do nothing
    return setPaynoteKind(null)
  }, [
    meLoading,
    trialStatus,
    pathname,
    searchParams,
    isSearchBot,
    documentType,
    setReadingAccess,
    isCampaignActive,
    hasAllowlistAccess,
  ])

  return (
    <PaynotesContext.Provider
      value={{
        paynoteKind,
        hasPaywall: PAYWALL_KINDS.includes(paynoteKind),
        setDocumentTypeForPaynotes,
        setReadingAccess,
        paynoteInlineHeight,
        setPaynoteInlineHeight,
      }}
    >
      <Suspense>
        <PaynotesSearchParams setSearchParams={setSearchParams} />
      </Suspense>
      {children}
    </PaynotesContext.Provider>
  )
}
