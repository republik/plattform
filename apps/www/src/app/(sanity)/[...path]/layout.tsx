import { PreviewPageLayout } from '@/app/(sanity)/components/preview/preview-page-layout'
import { FontSizeStyle } from '@/app/components/font-size-style'
import { FontSizeSync } from '@/app/components/font-size-sync'
import { PageLayout } from '@/app/components/layout'
import { css } from '@republik/theme/css'

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <PageLayout>
      {/* Reader font size: applied server-side before paint, then kept in sync
          on the client. Scoped to the reading views, as in the Pages Router. */}
      <FontSizeStyle />
      <FontSizeSync />
      <div
        className={css({
          color: 'text',
          pb: '16-32',
        })}
      >
        {children}
      </div>
    </PageLayout>
  )
}
