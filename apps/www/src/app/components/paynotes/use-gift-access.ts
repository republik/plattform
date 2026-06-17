'use client'

import { usePathname } from 'next/navigation'
import { useMemo } from 'react'
import { getGiftAccessForPath } from './gift-access'

type GiftAccessInfo = {
  granterName: string | null
  granterPortrait: string | null
  hasPublicProfile: boolean
}

export function useGiftAccess(): GiftAccessInfo {
  const pathname = usePathname()

  return useMemo(() => {
    if (typeof window === 'undefined') {
      return { granterName: null, granterPortrait: null, hasPublicProfile: false }
    }

    const access = getGiftAccessForPath(pathname)
    if (!access?.granter) {
      return { granterName: null, granterPortrait: null, hasPublicProfile: false }
    }

    return {
      granterName: access.granter.name,
      granterPortrait: access.granter.portrait,
      hasPublicProfile: access.granter.hasPublicProfile,
    }
  }, [pathname])
}
