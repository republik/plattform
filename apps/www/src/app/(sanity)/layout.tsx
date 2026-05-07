import { draftMode } from 'next/headers'
import { VisualEditing } from 'next-sanity/visual-editing'
import { SanityLive } from '@/app/(sanity)/lib/live'
// import {DisableDraftMode} from '@/app/(sanity)/components/disable-draft-mode'
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='de'>
      <body>
        {children}
        <SanityLive />
        {(await draftMode()).isEnabled && (
          <>
            <VisualEditing />
            {/*<DisableDraftMode />*/}
          </>
        )}
      </body>
    </html>
  )
}
