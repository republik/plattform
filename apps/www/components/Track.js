import { useEffect, useRef } from 'react'
import { useRouter } from 'next/router'

import { parse, format } from 'url'

import track from '../lib/matomo'
import { payload, getUtmParams } from '../lib/utils/track'
import { useInNativeApp } from '../lib/withInNativeApp'

import { PUBLIC_BASE_URL } from '../lib/constants'

import { PSP_PLEDGE_ID_QUERY_KEYS } from './Payment/constants'
import { useMe } from '../lib/context/MeContext'

const trackRoles = (me) =>
  track([
    'setCustomDimension',
    1,
    me ? [].concat(me.roles).sort().join(' ') || 'none' : 'guest',
  ])

let lastTrackedUrl
const trackUrl = (url) => {
  // protect against double calls
  // - e.g. because next router becomes ready and triggers a routeChangeComplete for the same url
  if (url === lastTrackedUrl) {
    return
  }
  lastTrackedUrl = url
  // sanitize url
  const urlObject = parse(url, true)
  const { query, pathname } = urlObject

  // Redact receive payment psp payloads
  if (pathname === '/angebote' || pathname === '/en') {
    const key = PSP_PLEDGE_ID_QUERY_KEYS.find((key) => query[key])
    if (key) {
      // redact all query params
      urlObject.query = { [key]: 'R*' }
    }
  }
  // Redact email and token for notification, pledge and sign in pages
  if (query.email) {
    query.email = 'R'
  }
  if (query.token) {
    query.token = 'R'
  }
  if (pathname === '/abholen') {
    if (query.code) {
      query.code = 'R'
    }
  }
  // rm fb and google click ids
  if (query.fbclid) {
    query.fbclid = 'R'
  }
  if (query.gclid) {
    query.gclid = 'R'
  }
  // ensure query string is calculated from query object
  urlObject.search = undefined

  const sanitizedUrl = format(urlObject)

  payload.record('paths', parse(sanitizedUrl).path)
  const referrer = getUtmParams(query)
  if (Object.keys(referrer).length) {
    payload.record('referrers', referrer)
  }

  track(['setCustomUrl', sanitizedUrl])
  track(['setDocumentTitle', document.title])
  track(['trackPageView'])
}

const Track = () => {
  const { me, meLoading } = useMe()
  const lastMeRef = useRef()
  const router = useRouter()

  useEffect(() => {
    if (meLoading) {
      return
    }
    const prevMe = lastMeRef.current

    if (prevMe !== me && (!prevMe || !me || prevMe.email !== me.email)) {
      if (prevMe !== undefined) {
        // start new visit with potentially different roles
        track(['appendToTrackingUrl', 'new_visit=1'])
        track(['deleteCookies'])
      }
      trackRoles(me)
      lastMeRef.current = me
    }
    payload.disable(!!me?.activeMembership)
  }, [me, meLoading])

  const { inNativeAppVersion } = useInNativeApp()
  useEffect(() => {
    if (inNativeAppVersion) {
      track(['setCustomDimension', 2, inNativeAppVersion])
    } else {
      track(['deleteCustomDimension', 2])
    }
  }, [inNativeAppVersion])

  useEffect(() => {
    if (router.isReady) {
      trackUrl(window.location.href)
    }
  }, [router.isReady])
  useEffect(() => {
    const onRouteChangeComplete = (url) => {
      // give pages time to set correct page title
      // may not always be enough, e.g. if data dependent and slow query/network, but works fine for many cases
      setTimeout(() => {
        // update url and title manually, necessary after client navigation
        trackUrl(`${PUBLIC_BASE_URL}${url}`)
      }, 600)
    }
    router.events.on('routeChangeComplete', onRouteChangeComplete)
    return () => {
      router.events.off('routeChangeComplete', onRouteChangeComplete)
    }
  }, [])

  return null
}

export default Track
