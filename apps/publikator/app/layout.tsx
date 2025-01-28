import { ReactNode } from 'react'

export default async function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang='de'>
      <body>{children}</body>
    </html>
  )
}
