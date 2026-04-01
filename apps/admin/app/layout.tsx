import '@republik/theme/fonts.css'
import '@republik/theme/styles.css'

import { ToastContainer } from '@/components/ui/toast'
import { RootColorVariables } from '@project-r/styleguide'
import { GraphqlProvider } from 'lib/apollo/client-browser'
import { Metadata, Viewport } from 'next'
import { PropsWithChildren } from 'react'

export const metadata: Metadata = {
  title: 'Admin',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default async function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang='de'>
      <body>
        <GraphqlProvider>
          <RootColorVariables />
          <ToastContainer>{children}</ToastContainer>
        </GraphqlProvider>
      </body>
    </html>
  )
}
