'use client'
import { PaynoteOverlay } from '@app/components/paynote-overlay/paynote-overlay'
import { usePathname } from 'next/navigation'

export function PaynoteOverlayWithKey() {
  const pathname = usePathname()
  return <PaynoteOverlay key={pathname} />
}
