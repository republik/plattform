import { createContext, useContext, useEffect, useState } from 'react'

import { usePathname, useSearchParams } from 'next/navigation'

import { useMe } from 'lib/context/MeContext'
import { useUserAgent } from 'lib/context/UserAgentContext'
import { updateArticleMetering } from './article-metering'

type PaynoteKindType =
  | null
  | 'DIALOG'
  | 'OVERLAY_CLOSED'
  | 'OVERLAY_OPEN'
  | 'REGWALL'
  | 'PAYWALL'
  | 'BANNER'

type TemplateType =
  | null
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

type PaynotesContextValues = {
  paynoteKind: PaynoteKindType
  setTemplateForPaynotes: (template: TemplateType) => void
  setIsPaywallExcluded: (isExcluded: boolean) => void
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
    searchParams.has('extractId')
  )
}

// This hook combines the trial status, pathname
// and template type to decide which paynote to show.
// Instead of having bits of logic in multiple places,
// we centralize the logic here.
//
// See also: Figma, Registration experience, for a
// visual overview of the paynote flow.
//
// TODO: add metering for TRIAL_ELIGIBLE users
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

  // In an ideal world we would know based on the pathname what template
  // we are dealing with, but we don't live in an ideal world.
  const [template, setTemplateForPaynotes] = useState<TemplateType>(null)

  const [isPaywallExcluded, setIsPaywallExcluded] = useState<boolean>(false)

  useEffect(() => {
    if (meLoading) return
    console.log({ template, trialStatus, pathname, searchParams })

    // Active membership: no paynote
    if (trialStatus === 'MEMBER') return setPaynoteKind(null)

    // ANYTHING THAT'S NOT AN ARTICLE:
    //
    // special pages without any paynote
    if (isPaynoteOverlayHidden(pathname, searchParams))
      return setPaynoteKind(null)

    // dialog page: we show a special paynote
    if (isDialogPage(pathname, searchParams) || template === 'discussion')
      return setPaynoteKind('DIALOG')

    // anything else that's not an article: minimized paynote overlay
    if (template !== 'article') return setPaynoteKind('OVERLAY_CLOSED')

    // ARTICLES:
    //
    // search bots: no paywall (we want texts to be indexed)
    // but we show the overlay (in case someone is
    // spoofing the user agent to read our content, we still
    // want to show these clever foxes the paywall)
    if (isSearchBot) return setPaynoteKind('OVERLAY_OPEN')

    // just signed up for a trial: no paynote
    if (searchParams.has('trialSignup')) return setPaynoteKind(null)

    // one trial group (group A) is shown a discrete banner
    if (trialStatus === 'TRIAL_GROUP_A') return setPaynoteKind('BANNER')

    // the other group (group B) is shown the more prominent overlay
    if (trialStatus === 'TRIAL_GROUP_B') return setPaynoteKind('OVERLAY_OPEN')

    // exception for marked articles (via metadata)
    if (isPaywallExcluded) return setPaynoteKind('OVERLAY_OPEN')

    // CAVEAT: we don't ever want the "template" state to be set to something
    // wrong (notably: "article") after the pathname has changed. Otherwise some funny
    // pages (eg "/feed") may count towards the metering.
    const { meteringStatus } = updateArticleMetering(pathname)
    if (meteringStatus === 'READING_GRANTED')
      return setPaynoteKind('OVERLAY_OPEN')

    // trial expired: show paywall
    if (trialStatus === 'NOT_TRIAL_ELIGIBLE') return setPaynoteKind('PAYWALL')

    // trial eligible users see the regwall
    if (trialStatus === 'TRIAL_ELIGIBLE') return setPaynoteKind('PAYWALL')

    // catch-all: do nothing
    return setPaynoteKind(null)
  }, [
    meLoading,
    trialStatus,
    pathname,
    searchParams,
    isSearchBot,
    template,
    isPaywallExcluded,
  ])

  console.log({ paynoteKind })

  return (
    <PaynotesContext.Provider
      value={{
        paynoteKind,
        setTemplateForPaynotes,
        setIsPaywallExcluded,
      }}
    >
      {children}
    </PaynotesContext.Provider>
  )
}
