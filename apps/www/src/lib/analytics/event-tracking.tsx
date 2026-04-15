'use client'
import { usePlausible } from 'next-plausible'
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
} from 'react'

declare global {
  interface Window {
    plausible?: (
      eventName: string,
      eventProps?: {
        props?: Record<string, unknown>
        revenue?: { currency: string; amount: number }
      },
    ) => void
  }
}

type TrackingContextValue = { category: string; action?: string } | null

const ctx = createContext<TrackingContextValue>(null)
ctx.displayName = 'EventTrackingContext'
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
      console.error(
        `useTrackEvent: context missing. Please wrap this component in a <TrackingContext> `,
      )
    }
  }

  return useCallback(
    (
      params: { action?: string; name?: string; value?: number } & Record<
        string,
        string | number
      >,
    ) => {
      const { category, ...props } = {
        ...ctxValue,
        ...params,
      }

      if (!props.action) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(
            `useTrackEvent: action undefined. Set one on the TrackingContext or function argument`,
          )
        }
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log('Track Event', category, props)
        }

        trackPlausibleEvent(category, { props })
      }
    },
    [ctxValue, trackPlausibleEvent],
  )
}
import { shouldIgnoreClick } from '@project-r/styleguide'

/**
 * Track Revenue
 */
export const trackRevenue = (amount: number) => {
  window.plausible?.('Sales', {
    revenue: { currency: 'CHF', amount },
  })
}

/**
 * LEGACY trackEvent that can be used globally
 */
export const trackEvent = ([eventName, action, name, value = undefined]) => {
  window.plausible?.(eventName, {
    props: { action, name, value },
  })
}

/**
 * LEGACY trackEvent that can be used to intercept clicks
 */
export const trackEventOnClick =
  ([eventName, action, name, value], onClick) =>
  (e) => {
    trackEvent([eventName, action, name, value])

    if (shouldIgnoreClick(e, false)) {
      return
    }

    e.preventDefault()
    onClick(e)
  }
