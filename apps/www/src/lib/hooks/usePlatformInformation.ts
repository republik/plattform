'use client'

import { useEffect, useState } from 'react'
import { parsePlatformInformation } from '../util/useragent/shared'

/**
 * React-hook to get platform information based on the user-agent string.
 * The returned data contains information about the user-agent, the platform and the native app.
 * @param initialUserAgent that can be used for initial render on the server
 * @returns {@type ReturnType<typeof parsePlatformInformation>}
 */
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
