import { PageHeader } from '@app/components/layout/header'
import Footer from './footer'
import { css } from '@app/styled-system/css'
import { getPlatformInformation } from '@app/lib/util/useragent/platform-information'
import { CTABanner } from '../cta-banner'
import { getMe } from '@app/lib/auth/me'
import { PullToRefresh } from './pull-to-refresh'
import { draftMode } from 'next/headers'
import { DraftModeIndicator } from '@app/components/layout/header/draft-mode-indicator'
import { CampaignBanner } from '@app/app/(campaign)/components/banner'
import { getCampaignReferralsData } from '@app/app/(campaign)/campaign-data'
import { CAMPAIGN_REFERRALS_GOAL } from '@app/app/(campaign)/constants'

type LayoutProps = {
  showHeader?: boolean
  showFooter?: boolean
  children: React.ReactNode
}

/**
 * The page-layout component is used to wrap the entire page. It contains the
 * header, footer, and the main content of the page.
 */
export async function PageLayout({
  showHeader = true,
  showFooter = true,
  children,
}: LayoutProps) {
  const { isNativeApp } = getPlatformInformation()
  const draftModeEnabled = draftMode().isEnabled
  const [me, campaignData] = await Promise.all([
    getMe(),
    getCampaignReferralsData(),
  ])

  return (
    <div
      className={css({
        backgroundColor: 'pageBackground',
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
      })}
    >
      {showHeader && (
        <PageHeader
          isLoggedIn={!!me}
          hasActiveMembership={!!me?.activeMembership?.id}
          portrait={{
            portrait: me?.portrait,
            name: me?.name,
            email: me?.email,
          }}
        />
      )}
      {/*
        The campaign banner is only shown on pages that are not the campaign-sender page.
        In order to check that, we use the usePathname hook from next/navigation in the campaign banner.
        That's why the data-fetching for the banner takes place in the layout component.
        */}
      {me?.activeMembership && (
        <CampaignBanner
          currentReferrals={campaignData?.campaign?.referrals?.count}
          referralsGoal={CAMPAIGN_REFERRALS_GOAL}
        />
      )}
      <CTABanner />
      {draftModeEnabled && <DraftModeIndicator />}
      {isNativeApp ? (
        <PullToRefresh
          className={css({
            position: 'relative',
            flexGrow: '1',
            backgroundColor: 'pageBackground',
          })}
        >
          {children}
        </PullToRefresh>
      ) : (
        <div
          className={css({ flexGrow: '1', backgroundColor: 'pageBackground' })}
        >
          {children}
        </div>
      )}

      {!isNativeApp && showFooter && <Footer />}
    </div>
  )
}
