import { RootLayout } from '@app/layouts/root'
import { ReactNode } from 'react'

export default async function Layout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}: {
  children: ReactNode
}) {
  return <RootLayout pageTheme='challenge-accepted'>{children}</RootLayout>
}
