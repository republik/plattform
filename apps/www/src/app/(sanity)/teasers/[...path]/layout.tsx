import { PreviewPageLayout } from '@/app/(sanity)/components/preview/preview-page-layout'
import { draftMode } from 'next/headers'

export default async function TeaserLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  if ((await draftMode()).isEnabled) {
    return <PreviewPageLayout>{children}</PreviewPageLayout>
  }
  return null
}
