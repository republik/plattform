import { ReactNode } from 'react'
import '@radix-ui/themes/styles.css'
import './global.css'
import { Theme } from '@radix-ui/themes'
import { Providers } from './providers'

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang='de'>
      <body>
        <Theme accentColor='indigo' radius='small'>
          <Providers>
            {children}
          </Providers>
        </Theme>
      </body>
    </html>
  )
}