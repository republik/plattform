'use client'
import { useMe } from '@/lib/context/MeContext'
import { useUserAgent } from '@/lib/context/UserAgentContext'
import { useInNativeApp } from '@/lib/withInNativeApp'
import PlausibleProvider from 'next-plausible'

type AnalyticsProviderProps = Omit<
  Parameters<typeof PlausibleProvider>[0],
  'domain'
>

export const AnalyticsProvider = (props: AnalyticsProviderProps) => {
  const { me, hasActiveMembership, trialStatus, meLoading, allowlistName } =
    useMe()
  const { userAgent } = useUserAgent()
  const { inNativeApp } = useInNativeApp()

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
        trial_status: trialStatus, // keeping the user_type too, as not to break compatibilty by deleting  the "user_type" prop.
        ...(allowlistName && { ip_allowlist: allowlistName }),
        ...(inNativeApp && { client: 'republik-app' }),
      }}
      // Defer enabling analytics until me query and user agent (for inNativeApp) have been loaded. This should still reliably track the 1st page view, just a bit later.
      // The script reads the pageview props only once, when it loads.
      enabled={!meLoading && userAgent !== undefined}
      {...props}
    />
  )
}
