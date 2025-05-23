import '@republik/theme/fonts.css'
import '@republik/theme/styles.css'
import '../globals.css'
import '../lib/polyfill'

import { ColorContextProvider, RootColorVariables } from '@project-r/styleguide'
import type { PagePropsWithApollo } from '@republik/nextjs-apollo-client'
import Head from 'next/head'

import { PaynoteOverlay } from '@app/components/paynotes/paynote/paynote-overlay'
import { AnalyticsProvider } from '@app/lib/analytics/provider'
import { SyncUTMToSessionStorage } from '@app/lib/analytics/utm-session-storage'
import { OPEN_ACCESS } from 'lib/constants'
import { AppProps } from 'next/app'
import AppVariableContext from '../components/Article/AppVariableContext'
import AudioPlayerOrchestrator from '../components/Audio/AudioPlayerOrchestrator'
import AudioProvider from '../components/Audio/AudioProvider'
import MediaProgressContext from '../components/Audio/MediaProgress'
import { ThemeProvider } from '../components/ColorScheme/ThemeProvider'
import MessageSync from '../components/NativeApp/MessageSync'
import { withApollo } from '../lib/apollo'
import MeContextProvider from '../lib/context/MeContext'
import UserAgentProvider from '../lib/context/UserAgentContext'
import PageErrorBoundary from '../lib/errors/PageErrorBoundary'
import { reportError } from '../lib/errors/reportError'
import { PaynotesProvider } from '@app/components/paynotes/paynotes-context'

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
    assumeAccess = OPEN_ACCESS ? true : false,
    ...otherPageProps
  } = pageProps

  return (
    <PageErrorBoundary>
      <MeContextProvider assumeAccess={assumeAccess}>
        <AnalyticsProvider>
          <UserAgentProvider providedValue={providedUserAgent}>
            <MediaProgressContext>
              <AudioProvider>
                <AppVariableContext>
                  <ThemeProvider>
                    <RootColorVariables />
                    <ColorContextProvider colorSchemeKey='auto'>
                      <PaynotesProvider>
                        <MessageSync />
                        <Head>
                          <meta
                            name='viewport'
                            content='width=device-width, initial-scale=1, viewport-fit=cover'
                          />
                          <link
                            rel='alternate'
                            type='application/rss+xml'
                            title='RSS Feed'
                            href='/feed.xml'
                          />
                        </Head>
                        <Component
                          serverContext={serverContext}
                          {...otherPageProps}
                        />
                        <AudioPlayerOrchestrator />
                        <SyncUTMToSessionStorage />
                        <PaynoteOverlay />
                      </PaynotesProvider>
                    </ColorContextProvider>
                  </ThemeProvider>
                </AppVariableContext>
              </AudioProvider>
            </MediaProgressContext>
          </UserAgentProvider>
        </AnalyticsProvider>
      </MeContextProvider>
    </PageErrorBoundary>
  )
}

export default withApollo(WebApp)
