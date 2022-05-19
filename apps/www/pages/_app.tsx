import '../lib/polyfill'

import { ApolloProvider, NormalizedCacheObject } from '@apollo/client'
import Head from 'next/head'

import {
  ColorContextProvider,
  IconContextProvider,
} from '@project-r/styleguide'

import { ErrorBoundary, reportError } from '../lib/errors'
import Track from '../components/Track'
import MessageSync from '../components/NativeApp/MessageSync'
import AudioProvider from '../components/Audio/AudioProvider'
import AudioPlayer from '../components/Audio/AudioPlayer'
import MediaProgressContext from '../components/Audio/MediaProgress'
import AppVariableContext from '../components/Article/AppVariableContext'
import ColorSchemeSync from '../components/ColorScheme/Sync'
import { APOLLO_STATE_PROP_NAME, useApollo } from '../lib/apollo/apolloClient'
import { AppProps } from 'next/app'
import MeContextProvider from '../lib/context/MeContext'
import UserAgentProvider from '../lib/context/UserAgentContext'

if (typeof window !== 'undefined') {
  window.addEventListener('error', (event: ErrorEvent) => {
    const { message, filename, lineno, colno, error } = event
    reportError(
      'onerror',
      (error && error.stack) || [message, filename, lineno, colno].join('\n'),
    )
  })

  window.addEventListener(
    'unhandledrejection',
    (event: PromiseRejectionEvent) => {
      reportError(
        'onunhandledrejection',
        (event.reason && event.reason.stack) || event.reason,
      )
    },
  )
}

/**
 * Base PageProps that contains the apollo-cache utilized in SSG & SSR.
 */
export type BasePageProps<P = unknown> = {
  /**
   * Shared cache between the client and server
   */
  [APOLLO_STATE_PROP_NAME]?: NormalizedCacheObject
  /**
   * When rendering a member-page in SSG, this value is passed to the me-context
   * to allow elements, which are only visible to members, to be rendered.
   */
  assumeAccess?: boolean
} & P // All other props given in a page

const WebApp = ({ Component, pageProps }: AppProps<BasePageProps>) => {
  const {
    // SSR only props
    providedApolloClient = undefined,
    providedUserAgent = undefined,
    serverContext = undefined,
    assumeAccess = false,
    ...otherPageProps
  } = pageProps
  const apolloClient = useApollo(otherPageProps, providedApolloClient)

  return (
    <ErrorBoundary>
      <ApolloProvider client={apolloClient}>
        <MeContextProvider assumeAccess={assumeAccess}>
          <UserAgentProvider providedValue={providedUserAgent}>
            <MediaProgressContext>
              <IconContextProvider
                value={{ style: { verticalAlign: 'middle' } }}
              >
                <AudioProvider>
                  <AppVariableContext>
                    <ColorContextProvider root colorSchemeKey='auto'>
                      <MessageSync />
                      <ColorSchemeSync />
                      <Head>
                        <meta
                          name='viewport'
                          content='width=device-width, initial-scale=1'
                        />
                      </Head>
                      <Component
                        serverContext={serverContext}
                        {...otherPageProps}
                      />
                      <Track />
                      <AudioPlayer />
                    </ColorContextProvider>
                  </AppVariableContext>
                </AudioProvider>
              </IconContextProvider>
            </MediaProgressContext>
          </UserAgentProvider>
        </MeContextProvider>
      </ApolloProvider>
    </ErrorBoundary>
  )
}

export default WebApp
