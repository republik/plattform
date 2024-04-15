import { payload } from './utils/track'
import { shouldIgnoreClick } from '@project-r/styleguide'

const __DEV__ = process.env.NODE_ENV === 'development'

const track = (...args) => {
  if (typeof window === 'undefined' || !window._paq) {
    if (__DEV__) {
      throw new Error(
        "Can't use the imperative track api while server rendering",
      )
    }
    return
  }

  if (__DEV__) {
    console.log('track', ...args[0])
  }
  window._paq.push(...args)
}

export default track

export const trackEvent = ([category, action, name, value = undefined]) => {
  track(['trackEvent', category, action, name, value])

  // TODO: implement plausible properly
  window.plausible?.(category, { props: { action, name, value } })

  payload.record('events', { category, action, name, value })
}

export const trackEventOnClick =
  ([category, action, name, value], onClick) =>
  (e) => {
    trackEvent([category, action, name, value])

    if (shouldIgnoreClick(e)) {
      return
    }

    e.preventDefault()
    onClick(e)
  }
