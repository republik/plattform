import {
  getNativeAppBuildId,
  getNativeAppVersion,
  matchAndroidUserAgent,
  matchFirefoxUserAgent,
  matchIOSUserAgent,
} from 'lib/parse-useragent'

type PlatformInformation = {
  userAgent: string
  // Plattform info
  isIOS: boolean
  isAndroid: boolean
  isFirefox: boolean
  // App info
  nativeAppBuildId: string | undefined
  nativeAppVersion: string | undefined
  isNativeApp: boolean
  isIOSApp: boolean
  isAndroidApp: boolean
  isLegacyNativeApp: boolean
}

/**
 * Parse the user-agent string and return platform information.
 * @param userAgent
 * @returns {@type PlatformInformation}
 */
export function parsePlatformInformation(
  userAgent: string,
): PlatformInformation {
  // parse useragent header
  const isIOS = matchIOSUserAgent(userAgent)
  const isAndroid = matchAndroidUserAgent(userAgent)
  const isFirefox = matchFirefoxUserAgent(userAgent)
  const nativeAppVersion = getNativeAppVersion(userAgent)
  const nativeAppBuildId = getNativeAppBuildId(userAgent)

  return {
    userAgent,
    isIOS,
    isAndroid,
    isFirefox,
    nativeAppBuildId,
    nativeAppVersion,
    isNativeApp: !!nativeAppVersion,
    isIOSApp: isIOS && !!nativeAppVersion,
    isAndroidApp: isAndroid && !!nativeAppVersion,
    // version lower than v2
    isLegacyNativeApp: !!nativeAppVersion && Number(nativeAppVersion) < 2,
  }
}
