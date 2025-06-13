'use client'

import useNativeAppEvent from '@app/lib/hooks/useNativeAppEvent'
import { usePostMessage } from '@app/lib/hooks/usePostMessage'
import { PUBLIC_BASE_URL } from 'lib/constants'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'

// eslint-disable-next-line no-unused-vars
type RouteChangeCallback = (url: string) => void

function useOnRouteChange(callBack: RouteChangeCallback) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const callbackRef = useRef<RouteChangeCallback>(callBack)
  const lastUrlRef = useRef<string>(null)

  useEffect(() => {
    try {
      const url = new URL(pathname, window.location.origin)
      url.search = searchParams.toString()
      const urlStr = url.toString()

      if (lastUrlRef.current === urlStr) {
        return
      }

      lastUrlRef.current = urlStr
      callbackRef.current(urlStr)
    } catch (e) {
      console.error(e)
    }
  }, [pathname, searchParams])

  useEffect(() => {
    callbackRef.current = callBack
  }, [callBack])
}

export function NARoutingHandler() {
  const router = useRouter()
  const postMessage = usePostMessage()
  const previousPushUrl = useRef<string>(undefined)

  useOnRouteChange((url) => {
    postMessage({
      type: 'routeChange',
      payload: { url },
    })
  })

  useNativeAppEvent<Record<string, unknown>>('push-route', async (content) => {
    if (!content.url || typeof content.url !== 'string') {
      console.error('push-route: invalid url', content)
      return
    }
    const targetUrl = content.url.replace(PUBLIC_BASE_URL, '')

    // Check for and ignore recurring attempts to navigate to the same URL
    if (previousPushUrl.current !== targetUrl) {
      previousPushUrl.current = targetUrl
      router.push(targetUrl)
    }
  })

  useNativeAppEvent('back', () => {
    router.back()
  })

  return null
}
