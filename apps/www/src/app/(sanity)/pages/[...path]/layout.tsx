import { DisableDraftMode } from '@/app/(sanity)/components/disable-draft-mode'
import { SanityLive } from '@/app/(sanity)/lib/live'
import { PageLayout } from '@/app/components/layout'
import { css } from '@republik/theme/css'
import { VisualEditing } from 'next-sanity/visual-editing'
import { draftMode } from 'next/headers'

export default async function SanityPageLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <PageLayout showDraftModeIndicator={false}>
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
