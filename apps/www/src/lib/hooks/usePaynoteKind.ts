import { useMe } from 'lib/context/MeContext'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

type PaynoteKindType =
  | null
  | 'DIALOG'
  | 'OVERLAY_CLOSED'
  | 'OVERLAY_OPEN'
  | 'REGWALL'
  | 'PAYWALL'
  | 'BANNER'

type TemplateType = 'ARTICLE' | 'DISCUSSION'

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

export const usePaynoteKind = (): PaynoteKindType => {
  const { meLoading, trialStatus } = useMe()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [template, setTemplate] = useState<TemplateType | null>()

  useEffect(() => {
    if (document.querySelector('[data-template="article"]') != null) {
      setTemplate('ARTICLE')
    } else if (document.querySelector('[data-template="discussion"]') != null) {
      setTemplate('DISCUSSION')
    }
  }, [])

  if (meLoading) return

  // Active membership: no paynote
  if (trialStatus === 'MEMBER') return

  // "special" page: no paynote
  if (isPaynoteOverlayHidden(pathname, searchParams)) return

  // dialog page: we show a special paynote
  if (isDialogPage(pathname, searchParams) || template === 'DISCUSSION')
    return 'DIALOG'

  // anything that's not an article: minimized paynote overlay
  if (template !== 'ARTICLE') return 'OVERLAY_CLOSED'

  // ARTICLES:
  // one trial group (group A) is shown a discrete banner
  if (trialStatus === 'TRIAL_GROUP_A') return 'BANNER'

  // the other group (group B) is shown the more prominent overlay
  if (trialStatus === 'TRIAL_GROUP_B') return 'OVERLAY_OPEN'

  // TODO: add metering for TRIAL_ELIGIBLE and NOT_TRIAL_ELIGIBLE users
  // TODO: add exception for marked articles

  // trial expired: show paywall
  if (trialStatus === 'NOT_TRIAL_ELIGIBLE') return 'PAYWALL'

  // trial eligible users see the regwall
  if (trialStatus === 'TRIAL_ELIGIBLE') return 'REGWALL'

  // catch-all: do nothing
  return
}
