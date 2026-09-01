import { PreviewPageLayout } from '@/app/(sanity)/components/preview/preview-page-layout'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Vorschau',
  robots: {
    index: false,
    follow: false,
  },
}

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
