'use client'

import { useEffect, useState } from 'react'
import { getUserAgentPlatform } from '../util/useragent/shared'

export function useUserAgentPlatform(
  initialUserAgent?: string,
): ReturnType<typeof getUserAgentPlatform> {
  const [platformData, setPlatformData] = useState<
    ReturnType<typeof getUserAgentPlatform>
  >(
    initialUserAgent // to be used for initial render on server
      ? getUserAgentPlatform(initialUserAgent)
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
    const data = getUserAgentPlatform(userAgent)
    setPlatformData(data)
  }, [])

  return platformData
}
