import { PreviewPageLayout } from '@/app/(sanity)/components/preview/preview-page-layout'
import { PageLayout } from '@/app/components/layout'
import { css } from '@republik/theme/css'
import { draftMode } from 'next/headers'

export default async function SanityFrontLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  if ((await draftMode()).isEnabled) {
    return <PreviewPageLayout>{children}</PreviewPageLayout>
  }

  return (
    <PageLayout>
      <div
        className={css({
          color: 'text',
          position: 'relative',
        })}
      >
        {children}
      </div>
    </PageLayout>
  )
}
