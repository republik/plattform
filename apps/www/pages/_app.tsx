import '../lib/polyfill'
import '@republik/theme/styles.css'
import '@republik/theme/fonts.css'
import '../globals.css'

import Head from 'next/head'
import { ColorContextProvider, RootColorVariables } from '@project-r/styleguide'
import type { PagePropsWithApollo } from '@republik/nextjs-apollo-client'

import { AppProps } from 'next/app'
import AppVariableContext from '../components/Article/AppVariableContext'
import AudioPlayerOrchestrator from '../components/Audio/AudioPlayerOrchestrator'
import AudioProvider from '../components/Audio/AudioProvider'
import MediaProgressContext from '../components/Audio/MediaProgress'
import MessageSync from '../components/NativeApp/MessageSync'
import { withApollo } from '../lib/apollo'
import MeContextProvider from '../lib/context/MeContext'
import UserAgentProvider from '../lib/context/UserAgentContext'
import PageErrorBoundary from '../lib/errors/PageErrorBoundary'
import { reportError } from '../lib/errors/reportError'
import { ThemeProvider } from '../components/ColorScheme/ThemeProvider'
import { AnalyticsProvider } from '@app/lib/analytics/provider'
import { SyncUTMToSessionStorage } from '@app/lib/analytics/utm-session-storage'

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
    <PageErrorBoundary>
      <AnalyticsProvider>
        <MeContextProvider assumeAccess={assumeAccess}>
          <UserAgentProvider providedValue={providedUserAgent}>
            <MediaProgressContext>
              <AudioProvider>
                <AppVariableContext>
                  <ThemeProvider>
                    <RootColorVariables />
                    <ColorContextProvider colorSchemeKey='auto'>
                      <MessageSync />
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
                      <AudioPlayerOrchestrator />
                      <SyncUTMToSessionStorage />
                    </ColorContextProvider>
                  </ThemeProvider>
                </AppVariableContext>
              </AudioProvider>
            </MediaProgressContext>
          </UserAgentProvider>
        </MeContextProvider>
      </AnalyticsProvider>
    </PageErrorBoundary>
  )
}

export default withApollo(WebApp)
