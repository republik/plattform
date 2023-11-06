'use client'

import { useEffect, useState } from 'react'
import { parsePlatformInformation } from '../util/useragent/shared'

export function usePlatformInformation(
  initialUserAgent?: string,
): ReturnType<typeof parsePlatformInformation> {
  const [platformData, setPlatformData] = useState<
    ReturnType<typeof parsePlatformInformation>
  >(
    initialUserAgent // to be used for initial render on server
      ? parsePlatformInformation(initialUserAgent)
      : {
          userAgent: '',
          isIOS: false,
          isAndroid: false,
          isFirefox: false,
          nativeAppBuildId: undefined,
          nativeAppVersion: undefined,
          isNativeApp: false,
          isIOSApp: false,
          isAndroidApp: false,
        },
  )

  // on client, get useragent from navigator
  useEffect(() => {
    const userAgent = navigator.userAgent
    const data = parsePlatformInformation(userAgent)
    setPlatformData(data)
  }, [])

  return platformData
}
