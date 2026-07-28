import { PreviewPageLayout } from '@/app/(sanity)/components/preview/preview-page-layout'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'

export default async function PreviewLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Routes in /preview should only be accessible when draft mode is enabled
  if ((await draftMode()).isEnabled) {
    return <PreviewPageLayout>{children}</PreviewPageLayout>
  }

  notFound()
}
