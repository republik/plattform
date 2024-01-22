import { PageHeader } from '@app/components/layout/header'
import Footer from './footer'
import { css } from '@app/styled-system/css'
import { getPlatformInformation } from '@app/lib/util/useragent/platform-information'
import { CTABanner } from '../cta-banner'
import { getMe } from '@app/lib/auth/me'
import { PullToRefresh } from './pull-to-refresh'
import { draftMode } from 'next/headers'
import { DraftModeIndicator } from '@app/components/layout/header/draft-mode-indicator'

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
  const me = await getMe()
  const draftModeEnabled = draftMode().isEnabled

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
