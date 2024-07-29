'use client'
import { usePlausible } from 'next-plausible'
import { ReactNode, createContext, useContext, useMemo } from 'react'

type TrackingContextValue = { category: string; action?: string } | null

const ctx = createContext<TrackingContextValue>(null)
ctx.displayName = 'MatomoTrackingContext'
const { Provider } = ctx

/**
 * Provide a category and (optional) action for event tracking
 */
export const EventTrackingContext = ({
  category,
  action,
  name,
  children,
}: {
  category: string
  action?: string
  name?: string
  children: ReactNode
}) => {
  const value = useMemo(
    () => ({ category, action, name }),
    [category, action, name],
  )

  return <Provider value={value}>{children}</Provider>
}

/**
 * Get a trackEvent function which uses event category and action from context
 */
export const useTrackEvent = () => {
  const ctxValue = useContext(ctx)

  const trackPlausibleEvent = usePlausible()

  if (!ctxValue) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        `useTrackEvent: context missing. Please wrap this component in a <TrackingContext> `,
      )
    }
  }

  return (params: { action?: string; name?: string; value?: number }) => {
    const { category, action, name, value } = {
      ...ctxValue,
      ...params,
    }

    if (!action) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          `useTrackEvent: action undefined. Set one on the TrackingContext or function argument`,
        )
      }
    } else {
      trackPlausibleEvent(category, { props: { action, name, value } })
    }
  }
}
