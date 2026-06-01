import { SanityLive } from '@/app/(sanity)/lib/live'
import { PageLayout } from '@/app/components/layout'
import { css } from '@republik/theme/css'
import { Metadata } from 'next'
import { VisualEditing } from 'next-sanity/visual-editing'
import { draftMode } from 'next/headers'
import { DisableDraftMode } from './components/disable-draft-mode'

export const metadata: Metadata = {
  title: {
    default: 'Republik',
    template: '%s – Republik',
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <PageLayout>
        <div
          className={css({
            color: 'text',
            pb: '16-32',
          })}
        >
          {children}
        </div>
      </PageLayout>
      <SanityLive />
      {(await draftMode()).isEnabled && (
        <>
          <VisualEditing />
          <DisableDraftMode />
        </>
      )}
    </>
  )
}
