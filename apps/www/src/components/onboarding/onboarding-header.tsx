import { usePlatformInformation } from '@app/lib/hooks/usePlatformInformation'
import { css } from '@republik/theme/css'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { ReactNode } from 'react'

export function OnboardingBackButton({ href }: { href: string }) {
  const { isNativeApp } = usePlatformInformation()

  if (!href || !isNativeApp) return null

  return (
    <Link href={href} className={css({ p: 2 })}>
      <ChevronLeft />
    </Link>
  )
}

function OnboardingHeader({ children }: { children: ReactNode }) {
  return (
    <div
      className={css({
        textAlign: 'center',
        pb: 8,
        '& h1': {
          mt: 0,
          mb: 2,
          fontFamily: 'rubis',
          fontWeight: 500,
          fontSize: '2xl',
          lineHeight: '1.2',
        },
        '& h2': {
          fontFamily: 'rubis',
          fontWeight: 500,
          fontSize: 'l',
          color: 'textSoft',
        },
        '& p': {
          color: 'textSoft',
        },
      })}
    >
      {children}
    </div>
  )
}

export default OnboardingHeader
