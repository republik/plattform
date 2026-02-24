import { useCampaign } from '@app/components/paynotes/campaign-paynote/use-campaign'

import { useMe } from 'lib/context/MeContext'
import { useUserAgent } from 'lib/context/UserAgentContext'

import { usePathname, useSearchParams } from 'next/navigation'
import { createContext, useContext, useEffect, useState } from 'react'
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
  | 'CAMPAIGN_OVERLAY_OPEN'
  | 'CAMPAIGN_OVERLAY_CLOSED'

type TemplateType =
  | null
  | 'article'
  | 'discussion'
  | 'editorialNewsletter'
  | 'editorial'
  | 'meta'
  | 'format'
  | 'section'
  | 'dossier'
  | 'page'
  | 'seriesOverview' // technically an article, but we want to handle this differently

type PaynotesContextValues = {
  paynoteKind: PaynoteKindType
  setTemplateForPaynotes: (template: TemplateType) => void
  setIsPaywallExcluded: (isExcluded: boolean) => void
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
    pathname === '/format/jobs' ||
    pathname ===
      '/2026/02/09/stellenausschreibung-junior-community-relationship-manager-support-und-moderation' ||
    pathname ===
      '/2026/02/09/stellenausschreibung-audience-development-manager-social' ||
    pathname ===
      '/2025/04/30/trainee-unternehmensmanagement-fokus-hr-und-finanzen' ||
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
  return pathname.startsWith('/dialog/')
}

export const PaynotesProvider = ({ children }) => {
  const { meLoading, trialStatus, hasAllowlistAccess } = useMe()
  const { campaign } = useCampaign()

  const pathname = usePathname()
  const searchParams = useSearchParams()

  const { isSearchBot } = useUserAgent()

  const [paynoteKind, setPaynoteKind] = useState<PaynoteKindType>(null)
  const [paynoteInlineHeight, setPaynoteInlineHeight] = useState<number>(0)

  // In an ideal world we would know based on the pathname what template
  // we are dealing with, but we don't live in an ideal world.
  const [template, setTemplateForPaynotes] = useState<TemplateType>(null)

  const [isPaywallExcluded, setIsPaywallExcluded] = useState<boolean>(false)

  useEffect(() => {})

  const isCampaignActive = campaign?.isActive

  useEffect(() => {
    if (meLoading) {
      return
    }
    // console.log({ template, trialStatus, pathname, searchParams })

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
    if (isPaynoteOverlayHidden(pathname, searchParams)) {
      return setPaynoteKind(null)
    }
    // dialog page: we show a special paynote
    if (isDialogPage(pathname, searchParams) || template === 'discussion') {
      return setPaynoteKind('DIALOG')
    }

    // Campaign active and *not* an article
    if (isCampaignActive && template !== 'article') {
      return setPaynoteKind('CAMPAIGN_OVERLAY_CLOSED')
    }

    // anything else that's not an article: minimized paynote overlay
    if (template !== 'article') {
      return setPaynoteKind('OVERLAY_CLOSED')
    }

    // ARTICLES:
    //
    // search bots: no paywall (we want texts to be indexed)
    // but we show the overlay (in case someone is
    // spoofing the user agent to read our content, we still
    // want to show these clever foxes the paywall)

    // When a campaign is active:
    if (isCampaignActive) {
      return setPaynoteKind('CAMPAIGN_OVERLAY_OPEN')
    }

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
    if (isPaywallExcluded) {
      return setPaynoteKind('OVERLAY_CLOSED')
    }

    // trial expired: show paywall
    if (trialStatus === 'NOT_TRIAL_ELIGIBLE') {
      return setPaynoteKind('PAYWALL')
    }

    // CAVEAT: we don't ever want the "template" state to be set to something
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
    template,
    isPaywallExcluded,
    isCampaignActive,
    hasAllowlistAccess,
  ])

  // console.log({ paynoteKind })

  return (
    <PaynotesContext.Provider
      value={{
        paynoteKind,
        setTemplateForPaynotes,
        setIsPaywallExcluded,
        paynoteInlineHeight,
        setPaynoteInlineHeight,
      }}
    >
      {children}
    </PaynotesContext.Provider>
  )
}
