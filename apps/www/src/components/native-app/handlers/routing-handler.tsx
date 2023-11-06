'use client'

import useNativeAppEvent from '@app/lib/hooks/useNativeAppEvent'
import { usePostMessage } from '@app/lib/hooks/usePostMessage'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

// eslint-disable-next-line no-unused-vars
type RouteChangeCallback = (url: string) => void

function useOnRouteChange(callBack: RouteChangeCallback) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const callbackRef = useRef<RouteChangeCallback>(callBack)
  const lastUrlRef = useRef<string>(null)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (initialized) {
      return
    }
    setInitialized(true)
    lastUrlRef.current = window.location.href
  }, [])

  useEffect(() => {
    const url = new URL(pathname, window.location.origin)
    url.search = searchParams.toString()
    const urlStr = url.toString()
    if (lastUrlRef.current === urlStr) {
      return
    }
    console.log('urlStr', urlStr, lastUrlRef.current)
    lastUrlRef.current = urlStr
    callbackRef.current(urlStr)
  }, [pathname, searchParams])

  useEffect(() => {
    callbackRef.current = callBack
  }, [callBack])
}

export function NARoutingHandler() {
  const router = useRouter()
  const postMessage = usePostMessage()

  useOnRouteChange((url) => {
    postMessage({
      type: 'routeChange',
      payload: { url },
    })
  })

  useNativeAppEvent<Record<string, unknown>>('push-route', async (content) => {
    if (!content.url || !(content.url instanceof String)) {
      return
    }
    const targetUrl = content.url.replace(process.env.NEXT_PUBLIC_BASE_URL, '')
    await router.push(targetUrl)
    if (targetUrl.indexOf('#') === -1) {
      window.scrollTo(0, 0)
    }
  })

  useNativeAppEvent('back', () => {
    router.back()
  })

  return null
}
