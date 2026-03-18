import { RootColorVariables } from '@project-r/styleguide'
import '@republik/theme/fonts.css'
import '@republik/theme/styles.css'
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
          {children}
        </GraphqlProvider>
      </body>
    </html>
  )
}
