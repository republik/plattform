'use client'
import { useMe } from 'lib/context/MeContext'
import PlausibleProvider from 'next-plausible'

type AnalyticsProviderProps = Omit<
  Parameters<typeof PlausibleProvider>[0],
  'domain'
>

export const AnalyticsProvider = (props: AnalyticsProviderProps) => {
  const { me, hasActiveMembership, meLoading } = useMe()

  return (
    <PlausibleProvider
      domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
      revenue
      trackLocalhost
      pageviewProps={{
        user_type: hasActiveMembership
          ? 'member'
          : me
          ? 'logged in'
          : 'anonymous',
      }}
      // Defer enabling analytics until me query has been loaded. This should still reliably track the 1st page view, just a bit later.
      enabled={!meLoading}
      {...props}
    />
  )
}
