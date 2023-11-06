'use client'

import { useMemo } from 'react'
import { usePlatformInformation } from './usePlatformInformation'

// extent window types for this file to avoid typescript errors
declare global {
  interface Window {
    ReactNativeWebView?: {
      // eslint-disable-next-line no-unused-vars
      postMessage: (msg: string) => void
    }
  }
}

// eslint-disable-next-line no-unused-vars
type PostMessageCallback = (msg: string | Record<string, unknown>) => void

/**
 * React-hook to get the postMessage function that can be used to send messages to the native app.
 * @returns {@type PostMessageCallback}
 */
export function usePostMessage() {
  const { isNativeApp, isLegacyNativeApp } = usePlatformInformation()

  const postMessage: PostMessageCallback = useMemo(() => {
    return !isNativeApp
      ? // eslint-disable-next-line @typescript-eslint/no-empty-function
        () => {} // does nothing outside of app, e.g. gallery full screen message
      : isLegacyNativeApp
      ? (msg) =>
          window.postMessage(
            typeof msg === 'string' ? msg : JSON.stringify(msg),
            '*',
          )
      : window?.ReactNativeWebView?.postMessage
      ? (msg) =>
          window.ReactNativeWebView.postMessage(
            typeof msg === 'string' ? msg : JSON.stringify(msg),
          )
      : (msg) => console.warn('postMessage unavailable', msg)
  }, [isNativeApp, isLegacyNativeApp])

  return postMessage
}
