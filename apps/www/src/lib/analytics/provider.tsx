import PlausibleProvider from 'next-plausible'

type AnalyticsProviderProps = Omit<
  Parameters<typeof PlausibleProvider>[0],
  'domain'
>

export const AnalyticsProvider = (props: AnalyticsProviderProps) => {
  return (
    <PlausibleProvider
      domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
      revenue
      // trackLocalhost
      enabled
      {...props}
    />
  )
}
