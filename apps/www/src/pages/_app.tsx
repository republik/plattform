import '@republik/theme/fonts.css'
import '@republik/theme/styles.css'
import '@/globals.css'
import '@/lib/polyfill'
import CampaignPaynote from '@/app/(sanity)/components/paynotes/campaign/campaign-paynote'

import { PaynoteOverlay } from '@/app/(sanity)/components/paynotes/paynote/paynote-overlay'
import { PaynotesProvider } from '@/app/(sanity)/components/paynotes/paynotes-context'
import { IpAllowlistBanner } from '@/app/components/ip-allowlist-banner'
import { AnalyticsProvider } from '@/app/lib/analytics/provider'
import { SyncUTMToSessionStorage } from '@/app/lib/analytics/utm-session-storage'
import AudioPlayerOrchestrator from '@/components/Audio/AudioPlayerOrchestrator'
import AudioProvider from '@/components/Audio/AudioProvider'
import MediaProgressContext from '@/components/Audio/MediaProgress'
import { ThemeProvider } from '@/components/ColorScheme/ThemeProvider'
import MessageSync from '@/components/NativeApp/MessageSync'
import { withApollo } from '@/lib/apollo'
import { OPEN_ACCESS } from '@/lib/constants'
import MeContextProvider from '@/lib/context/MeContext'
import UserAgentProvider from '@/lib/context/UserAgentContext'
import PageErrorBoundary from '@/lib/errors/PageErrorBoundary'

import { ColorContextProvider, RootColorVariables } from '@project-r/styleguide'
import type { PagePropsWithApollo } from '@republik/nextjs-apollo-client'
import { AppProps } from 'next/app'
import Head from 'next/head'

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
                      <IpAllowlistBanner />
                      <Component
                        serverContext={serverContext}
                        {...otherPageProps}
                      />
                      <AudioPlayerOrchestrator />
                      <SyncUTMToSessionStorage />
                      <PaynoteOverlay />
                      <CampaignPaynote />
                    </PaynotesProvider>
                  </ColorContextProvider>
                </ThemeProvider>
              </AudioProvider>
            </MediaProgressContext>
          </UserAgentProvider>
        </AnalyticsProvider>
      </MeContextProvider>
    </PageErrorBoundary>
  )
}

export default withApollo(WebApp)
