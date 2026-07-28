import { PreviewStatus } from '@/app/(sanity)/components/preview/preview-status'
import { SanityLive } from '@/app/(sanity)/lib/live'
import { resolvePerspectiveFromCookies } from 'next-sanity/live'
import { VisualEditing } from 'next-sanity/visual-editing'
import { cookies as nextCookies } from 'next/headers'

export async function PreviewPageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookies = await nextCookies()
  const perspective = await resolvePerspectiveFromCookies({ cookies })
  // const variant = await resolveVariantFromCookies({ cookies })

  return (
    <>
      <SanityLive />
      <VisualEditing />
      <PreviewStatus perspective={perspective} />
      {children}
    </>
  )
}
