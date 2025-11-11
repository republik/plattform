import { matchIOSUserAgent, useUserAgent } from './context/UserAgentContext'
import { getNativeAppBuildId, getNativeAppVersion } from './parse-useragent'

export { getNativeAppVersion, getNativeAppBuildId }

export const inNativeAppBrowserAppVersion = process.browser
  ? getNativeAppVersion(navigator.userAgent)
  : undefined

const isNewerVersion = (oldVer, newVer) => {
  if (!oldVer || !newVer) return true
  const oldParts = oldVer.split('.')
  const newParts = newVer.split('.')
  for (var i = 0; i < newParts.length; i++) {
    const a = ~~newParts[i] // parse int
    const b = ~~oldParts[i] // parse int
    if (a > b) return true
    if (a < b) return false
  }
  // if versions are equal, the loop above never returns
  // so we return true. equals to "same version or above"
  return true
}

export const inNativeAppBrowser = !!inNativeAppBrowserAppVersion
export const inNativeIOSAppBrowser =
  inNativeAppBrowser && matchIOSUserAgent(navigator.userAgent)

// Modern native app (v2.0+) uses ReactNativeWebView.postMessage
export const postMessage = !inNativeAppBrowser
  ? // eslint-disable-next-line @typescript-eslint/no-empty-function
    () => {} // does nothing outside of app, e.g. gallery full screen message
  : window.ReactNativeWebView && window.ReactNativeWebView.postMessage
  ? (msg) =>
      window.ReactNativeWebView.postMessage(
        typeof msg === 'string' ? msg : JSON.stringify(msg),
      )
  : (msg) => console.warn('postMessage unavailable', msg)

const getIOSVersion = (userAgent) => {
  const matches = userAgent.match(/ OS ([\d_]+) /)
  return matches ? parseFloat(matches[1]) : undefined
}

export const NativeAppHelpers = {
  getNativeAppVersion,
  getIOSVersion,
  isNewerVersion,
}

export const useInNativeApp = () => {
  const { userAgent, isIOS, isAndroid } = useUserAgent() ?? {}

  const inNativeAppVersion = getNativeAppVersion(userAgent)
  const inNativeAppBuildId = getNativeAppBuildId(userAgent)
  const inNativeApp = !!inNativeAppVersion

  return {
    inNativeApp,
    inNativeAppVersion,
    inNativeAppBuildId,
    isMinimalNativeAppVersion: (minVersion) =>
      isNewerVersion(minVersion, inNativeAppVersion),
    inIOS: isIOS,
    isAndroid: isAndroid,
    inIOSVersion: isIOS ? getIOSVersion(userAgent) : undefined,
    inNativeIOSApp: inNativeApp && isIOS,
  }
}

const withInNativeApp = (WrappedComponent) => {
  const WithInNativeApp = (props) => {
    const inProps = useInNativeApp()
    return <WrappedComponent {...inProps} {...props} />
  }

  return WithInNativeApp
}

export default withInNativeApp
