import './root.css'

import { ThemeProvider } from '@app/components/theme-provider'
import { ApolloWrapper } from '@app/lib/apollo/provider'
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
    <html
      lang='de'
      suppressHydrationWarning
      className={css({ scrollPaddingTop: '16-32' })}
    >
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
        <ThemeProvider>
          <ApolloWrapper>{children}</ApolloWrapper>
        </ThemeProvider>
      </body>
    </html>
  )
}
