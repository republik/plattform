'use client'
import { usePlatformInformation } from '@app/lib/hooks/usePlatformInformation'
import { ReactNode } from 'react'
import { ShareNative } from './share-native'
import { ShareOverlay } from './share-overlay'
import { ShareProps } from './types'

export function Share({
  children,
  ...props
}: ShareProps & { children: ReactNode }) {
  const { isNativeApp } = usePlatformInformation()

  return isNativeApp ? (
    <ShareNative {...props} triggerLabel={children} />
  ) : (
    <ShareOverlay {...props} triggerLabel={children} />
  )
}
