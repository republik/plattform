import './root.css'

import { ThemeProvider } from '@app/components/theme-provider'
import { css } from '@app/styled-system/css'
import { ReactNode } from 'react'

export default async function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang='de' suppressHydrationWarning>
      <body
        className={css({
          color: 'text',
          textStyle: 'body',
          bg: 'pageBackground',
          '& :where(a)': {
            color: 'link',
            textDecoration: 'underline',
          },
        })}
        style={{
          height: '100dvh',
        }}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
