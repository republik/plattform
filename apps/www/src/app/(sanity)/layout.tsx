import { PaynotesProvider } from '@/app/(sanity)/components/paynotes/paynotes-context'

// Route-group layout: wraps every route under (sanity) so the paynotes
// context is available across all sanity routes (articles, pages, front, …).
export default function SanityGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <PaynotesProvider>{children}</PaynotesProvider>
}
