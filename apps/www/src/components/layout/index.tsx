import { PageHeader } from '@app/components/layout/header'
import Footer from './footer'
import { css } from '@app/styled-system/css'
import { getPlatformInformation } from '@app/lib/util/useragent/platform-information'
import { CTABanner } from '../cta-banner'

type LayoutProps = {
  children: React.ReactNode
}

/**
 * The page-layout component is used to wrap the entire page. It contains the
 * header, footer, and the main content of the page.
 */
export async function PageLayout({ children }: LayoutProps) {
  const { isNativeApp } = getPlatformInformation()

  return (
    <div
      className={css({
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
      })}
    >
      <PageHeader />
      <CTABanner />
      <div
        className={css({ flexGrow: '1', backgroundColor: 'pageBackground' })}
      >
        {children}
      </div>
      {!isNativeApp && <Footer />}
    </div>
  )
}
