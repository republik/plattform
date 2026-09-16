import { PageHeader } from '@/app/components/layout/header'
import { getPlatformInformation } from '@/app/lib/util/useragent/platform-information'
import { css } from '@republik/theme/css'
import { CTABanner } from '../cta-banner'
import Footer from './footer'
import { PullToRefresh } from './pull-to-refresh'

type LayoutProps = {
  showHeader?: boolean
  showFooter?: boolean
  showDraftModeIndicator?: boolean
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
  const { isNativeApp } = await getPlatformInformation()

  return (
    <div
      className={css({
        backgroundColor: 'pageBackground',
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
      })}
    >
      {showHeader && <PageHeader />}

      <CTABanner />

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
