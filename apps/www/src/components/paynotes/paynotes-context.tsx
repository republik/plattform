import { createContext, useContext, useEffect, useState } from 'react'

import { usePathname, useSearchParams } from 'next/navigation'

import { useMe } from 'lib/context/MeContext'
import { useUserAgent } from 'lib/context/UserAgentContext'

type PaynoteKindType =
  | null
  | 'DIALOG'
  | 'OVERLAY_CLOSED'
  | 'OVERLAY_OPEN'
  | 'REGWALL'
  | 'PAYWALL'
  | 'BANNER'

type TemplateType =
  | 'article'
  | 'discussion'
  | 'editorialNewsletter'
  | 'editorial'
  | 'meta'
  | 'format'
  | 'section'
  | 'dossie'
  | 'page'
  | 'flyer'
  | 'seriesOverview' // technically an article, but we want to handle this differently
  | null

type PaynotesContextValues = {
  paynoteKind: PaynoteKindType
  setTemplate: (template: TemplateType) => void
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
    pathname === '/community' ||
    searchParams.has('extract') ||
    searchParams.has('extractId')
  )
}

// Metering
// 1. remove stale articles from reads array
// 2. check if the user has the article in reads array
// 3. check if the user has any avilable reads left
// 4. add the article to the reads array
function updateArticleReads(): { hasAccess: boolean } {
  return {
    hasAccess: false,
  }
}

// This hook combines the trial status & location
// to decide which paynote to show.
// Instead of having bits of logic in multiple places,
// we centralize the logic here.
//
// See also: Figma, Registration experience, for a
// visual overview of the paynote flow.
//
// TODO: add metering for TRIAL_ELIGIBLE users
// TODO: add exception for marked articles
function isDialogPage(
  pathname: string,
  searchParams: URLSearchParams,
): boolean {
  return pathname === '/dialog' && searchParams.has('t')
}

export const PaynotesProvider = ({ children }) => {
  const { meLoading, trialStatus } = useMe()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { isSearchBot } = useUserAgent()
  const [paynoteKind, setPaynoteKind] = useState<PaynoteKindType>(null)
  const [template, setTemplate] = useState<TemplateType>(null)

  useEffect(() => {
    if (meLoading) return setPaynoteKind(null)

    // Active membership: no paynote
    if (trialStatus === 'MEMBER') return setPaynoteKind(null)

    // ANYTHING THAT'S NOT AN ARTICLE:
    //
    // "special" pages: no paynote
    if (isPaynoteOverlayHidden(pathname, searchParams))
      return setPaynoteKind(null)

    // dialog page: we show a special paynote
    if (isDialogPage(pathname, searchParams) || template === 'discussion')
      return setPaynoteKind('DIALOG')

    // anything that's not an article: minimized paynote overlay
    if (template !== 'article') return setPaynoteKind('OVERLAY_CLOSED')

    // ARTICLES:
    //
    // search bots: no paywall (we want texts to be indexed)
    // but we show the overlay (in case someone is
    // spoofing the user agent to read our content, we still
    // want to show those clever fish the paywall)
    if (isSearchBot) return setPaynoteKind('OVERLAY_OPEN')

    // one trial group (group A) is shown a discrete banner
    if (trialStatus === 'TRIAL_GROUP_A') return setPaynoteKind('BANNER')

    // the other group (group B) is shown the more prominent overlay
    if (trialStatus === 'TRIAL_GROUP_B') return setPaynoteKind('OVERLAY_OPEN')

    // TODO: add exception for marked articles
    // if (isExcludedArticle()) return 'OVERLAY_OPEN'

    const { hasAccess } = updateArticleReads()
    if (hasAccess) return setPaynoteKind('OVERLAY_OPEN')

    // trial expired: show paywall
    if (trialStatus === 'NOT_TRIAL_ELIGIBLE') return setPaynoteKind('PAYWALL')

    // trial eligible users see the regwall
    if (trialStatus === 'TRIAL_ELIGIBLE') return setPaynoteKind('REGWALL')

    // catch-all: do nothing
    return setPaynoteKind(null)
  }, [meLoading, trialStatus, pathname, searchParams, isSearchBot, template])

  return (
    <PaynotesContext.Provider
      value={{
        paynoteKind,
        setTemplate,
      }}
    >
      {children}
    </PaynotesContext.Provider>
  )
}
