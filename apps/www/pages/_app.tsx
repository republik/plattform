import '../lib/polyfill'

import Head from 'next/head'

import {
  ColorContextProvider,
} from '@project-r/styleguide'
import type { PagePropsWithApollo } from '@republik/nextjs-apollo-client'

import { ErrorBoundary, reportError } from '../lib/errors'
import Track from '../components/Track'
import MessageSync from '../components/NativeApp/MessageSync'
import AudioProvider from '../components/Audio/AudioProvider'
import MediaProgressContext from '../components/Audio/MediaProgress'
import AppVariableContext from '../components/Article/AppVariableContext'
import ColorSchemeSync from '../components/ColorScheme/Sync'
import { AppProps } from 'next/app'
import MeContextProvider from '../lib/context/MeContext'
import UserAgentProvider from '../lib/context/UserAgentContext'
import { withApollo } from '../lib/apollo'
import AudioPlayerOrchestrator from '../components/Audio/AudioPlayerOrchestrator'

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

type WebAppProps = {
  providedUserAgent?: string
  serverContext?: any
  assumeAccess?: boolean
}

const WebApp = ({
  Component,
  pageProps,
}: AppProps<PagePropsWithApollo<WebAppProps>>) => {
  const {
    // SSR only props
    providedUserAgent = undefined,
    serverContext = undefined,
    assumeAccess = false,
    ...otherPageProps
  } = pageProps

  return (
    <ErrorBoundary>
      <MeContextProvider assumeAccess={assumeAccess}>
        <UserAgentProvider providedValue={providedUserAgent}>
          <MediaProgressContext>
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
                    <AudioPlayerOrchestrator />
                  </ColorContextProvider>
                </AppVariableContext>
            </AudioProvider>
          </MediaProgressContext>
        </UserAgentProvider>
      </MeContextProvider>
    </ErrorBoundary>
  )
}

export default withApollo(WebApp)
