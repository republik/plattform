import { PageHeader } from '@app/components/layout/header'
import Footer from './footer'
import { css } from '@app/styled-system/css'
import { getPlatformInformation } from '@app/lib/util/useragent/platform-information'
import { CTABanner } from '../cta-banner'
import { getMe } from '@app/lib/auth/me'

type LayoutProps = {
  children: React.ReactNode
}

/**
 * The page-layout component is used to wrap the entire page. It contains the
 * header, footer, and the main content of the page.
 */
export async function PageLayout({ children }: LayoutProps) {
  const { isNativeApp } = getPlatformInformation()
  const me = await getMe()

  return (
    <div
      className={css({
        backgroundColor: 'pageBackground',
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
      })}
    >
      <PageHeader me={me} />
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
