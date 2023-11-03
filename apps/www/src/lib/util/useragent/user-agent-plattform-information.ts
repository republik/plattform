import {
  getNativeAppBuildId,
  getNativeAppVersion,
  matchAndroidUserAgent,
  matchFirefoxUserAgent,
  matchIOSUserAgent,
} from 'lib/parse-useragent'
import { headers } from 'next/headers'

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
}

/**
 * This method allows to get the useragent information from the request headers
 * to be used in a server-component.
 * @returns {@type PlatformInformation}
 */
export function getUserAgentPlatformInfo(): PlatformInformation {
  // get useragent header from headers
  const userAgent = headers().get('user-agent')
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
  }
}
