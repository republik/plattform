import Router from 'next/router'
import { parseJSONObject } from './safeJSON'
import { matchIOSUserAgent, useUserAgent } from './context/UserAgentContext'
import { getNativeAppBuildId, getNativeAppVersion } from './parse-useragent'

export { getNativeAppVersion, getNativeAppBuildId }

export const inNativeAppBrowserAppVersion = process.browser
  ? getNativeAppVersion(navigator.userAgent)
  : undefined

const isLegacyApp = (version) => parseFloat(version) < 2

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

export const inNativeAppBrowserLegacy = isLegacyApp(
  inNativeAppBrowserAppVersion,
)

export const inNativeAppBrowser = !!inNativeAppBrowserAppVersion
export const inNativeIOSAppBrowser =
  inNativeAppBrowser && matchIOSUserAgent(navigator.userAgent)

const runInNativeAppBrowser = inNativeAppBrowser
  ? (callback) => callback()
  : // eslint-disable-next-line @typescript-eslint/no-empty-function
    () => {}

runInNativeAppBrowser(() => {
  if (!inNativeAppBrowserLegacy) {
    return
  }
  const orgUrl =
    window.location.pathname + window.location.search + window.location.hash
  const orgTime = Date.now()
  // Accept push-route and scroll-to-top from app
  document.addEventListener('message', function (event) {
    const message = parseJSONObject(event.data)

    if (message.type === 'scroll-to-top') {
      window.scrollTo(0, 0)
    } else if (message.type === 'push-route') {
      // ignore push back loop from app
      // - while booting the app a bunch of race conditions lead to a loop
      // example
      // - save url on fs /feed
      // - app start loading webview with /feed
      // - deep services sets new url /rubriken
      // - app sends push-route /rubriken
      // - webview finishes loading, report /feed is now the url
      // - app saves /feed as url again
      // - app sends push-route /feed again <- this one we want to ignore
      if (message.url === orgUrl && Date.now() - orgTime < 10000) {
        return
      }
      Router.push(message.url).then(() => {
        window.scrollTo(0, 0)
      })
    }
  })

  // Monkey patch window.postMessage to fix native app webview issues
  // Ref: https://github.com/facebook/react-native/issues/11594
  let isReactNativePostMessageReady = !!window.originalPostMessage
  const queue = []

  let currentPostMessageFn = (message) => {
    queue.push(message)
  }

  if (!isReactNativePostMessageReady) {
    Object.defineProperty(window, 'postMessage', {
      configurable: true,
      enumerable: true,
      get() {
        return currentPostMessageFn
      },
      set(fn) {
        currentPostMessageFn = fn
        isReactNativePostMessageReady = true
        setTimeout(sendQueue, 0)
      },
    })
  }

  function sendQueue() {
    while (queue.length > 0) window.postMessage(queue.shift())
  }
})

export const postMessage = !inNativeAppBrowser
  ? // eslint-disable-next-line @typescript-eslint/no-empty-function
    () => {} // does nothing outside of app, e.g. gallery full screen message
  : inNativeAppBrowserLegacy
  ? (msg) =>
      window.postMessage(
        typeof msg === 'string' ? msg : JSON.stringify(msg),
        '*',
      )
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
  const { userAgent, isIOS, isAndroid } = useUserAgent()

  const inNativeAppVersion = getNativeAppVersion(userAgent)
  const inNativeAppBuildId = getNativeAppBuildId(userAgent)
  const inNativeApp = !!inNativeAppVersion

  return {
    inNativeApp,
    inNativeAppLegacy: isLegacyApp(inNativeAppVersion),
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
