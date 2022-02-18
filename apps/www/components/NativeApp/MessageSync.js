import React, { useEffect, useState } from 'react'
import { gql, useApolloClient, useMutation } from '@apollo/client'
import { parse } from 'url'
import { useRouter } from 'next/router'

import { useInNativeApp, postMessage } from '../../lib/withInNativeApp'
import { PUBLIC_BASE_URL } from '../../lib/constants'

import AppSignInOverlay from './AppSignInOverlay'
import { useMediaProgress } from '../Audio/MediaProgress'
import { usePersistedOSColorSchemeKey } from '../ColorScheme/lib'
import { useMe } from '../../lib/context/MeContext'

let routeChangeStarted

const upsertDeviceMutation = gql`
  mutation UpsertDevice($token: ID!, $information: DeviceInformationInput!) {
    upsertDevice(token: $token, information: $information) {
      id
    }
  }
`

const pendingAppSignInQuery = gql`
  query pendingAppSignIn {
    pendingAppSignIn {
      title
      body
      expiresAt
      verificationUrl
    }
  }
`

const NewAppMessageSync = () => {
  const [signInQuery, setSignInQuery] = useState()
  const router = useRouter()
  const setOSColorScheme = usePersistedOSColorSchemeKey()[1]

  const client = useApolloClient()
  const { me } = useMe()
  const [upsertDevice] = useMutation(upsertDeviceMutation)

  useEffect(() => {
    const handleRouteChange = (url) => {
      postMessage({
        type: 'routeChange',
        payload: { url },
      })
    }
    router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [])

  const { saveMediaProgress } = useMediaProgress()
  useEffect(() => {
    async function checkPendingAppSignIn() {
      const {
        data: { pendingAppSignIn },
      } = await client.query({
        query: pendingAppSignInQuery,
        fetchPolicy: 'network-only',
      })
      if (pendingAppSignIn) {
        const verificationUrlObject = parse(
          pendingAppSignIn.verificationUrl,
          true,
        )
        const { query } = verificationUrlObject
        setSignInQuery(query)
      }
    }
    if (me) {
      checkPendingAppSignIn()
    }
    const onMessage = (event) => {
      const { content = {}, id } = event.data
      if (content.type === 'onPushRegistered') {
        // Register Notification Token
        const { token, os, osVersion, model, appVersion, userAgent } =
          content.data
        upsertDevice({
          variables: {
            token,
            information: {
              os,
              osVersion,
              model,
              appVersion,
              userAgent,
            },
          },
        })
      } else if (content.type === 'onAppMediaProgressUpdate') {
        // Audio Player sent media progress update
        const { currentTime, mediaId } = content
        saveMediaProgress({ mediaId }, { currentTime })
      } else if (content.type === 'appState') {
        // Check Whenever App becomes active (foreground)
        // opens signin page if theres a pending request
        if (content.current === 'active' && me) {
          checkPendingAppSignIn()
        }
      } else if (content.type === 'authorization') {
        checkPendingAppSignIn()
      } else if (content.type === 'push-route') {
        const targetUrl = content.url.replace(PUBLIC_BASE_URL, '')
        router.push(targetUrl).then(() => {
          if (targetUrl.indexOf('#') === -1) {
            window.scrollTo(0, 0)
          }
        })
      } else if (content.type === 'osColorScheme') {
        if (content.value) {
          setOSColorScheme(content.value)
        }
      } else if (content.type === 'back') {
        routeChangeStarted = false
        window.history.back()
        setTimeout(() => {
          if (!routeChangeStarted) {
            router.replace('/')
          }
        }, 200)
      }
      postMessage({
        type: 'ackMessage',
        id: id,
      })
    }

    const setRouteChangeStarted = () => {
      routeChangeStarted = true
    }

    document.addEventListener('message', onMessage)
    router.events.on('routeChangeStart', setRouteChangeStarted)
    return () => {
      document.removeEventListener('message', onMessage)
      router.events.off('routeChangeStart', setRouteChangeStarted)
    }
  }, [me])

  if (signInQuery) {
    return (
      <AppSignInOverlay
        query={signInQuery}
        setQuery={setSignInQuery}
        onClose={() => setSignInQuery(null)}
      />
    )
  }
  return null
}

const SyncMe = () => {
  const { inNativeAppLegacy } = useInNativeApp()
  const { me, meLoading } = useMe()

  useEffect(() => {
    if (meLoading) {
      return
    }
    // Post current user data to native app
    if (inNativeAppLegacy) {
      postMessage({ type: 'initial-state', payload: { me } })
    } else {
      postMessage({ type: 'isSignedIn', payload: !!me })
    }
  }, [me, meLoading, inNativeAppLegacy])

  return null
}

const MessageSync = () => {
  const { inNativeApp, inNativeAppLegacy } = useInNativeApp()

  if (!inNativeApp) {
    return null
  }

  return (
    <>
      <SyncMe />
      {!inNativeAppLegacy && <NewAppMessageSync />}
    </>
  )
}

export default MessageSync
