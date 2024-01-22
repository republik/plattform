import { Metadata } from 'next'

import './globals.css'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    noarchive: true,
  },
}

type RootLayoutProps = { children: React.ReactNode }

function RootLayout(props: RootLayoutProps) {
  const { children } = props

  return (
    <html suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}

export default RootLayout
