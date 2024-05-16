import React from 'react'

import timeahead from '../../lib/timeahead'
import timeago from '../../lib/timeago'
import timeduration from '../../lib/timeduration'
import { Formatter } from '../../lib/translate'

/**
 * The DiscussionContext wraps static details about a discussion and all
 * discussion-wide callbacks that are provided to all Comment components.
 *
 * You MUST wrap components which require the DiscussionContext in the provider.
 * There is no default value. The components which require DiscussionContext
 * are very likely to crash if you forget to provide the context.
 */
type DiscussionContext = {
  discussion: unknown
}
export const DiscussionContext = React.createContext<DiscussionContext>(
  {} as unknown as DiscussionContext,
)

/**
 * Format the given date relative to the current time. The date can be in the
 * future or past.
 *
 * The function will automatically format the time in the future or past, but you
 * can override this using the 'direction' option (can be 'future' or 'past').
 * This is handy to avoid showing a time in the future (eg. "in a few seconds")
 * when you meant "just now", which can happen when clocks drift apart.
 */
export const formatTimeRelative = (
  date: Date | string | number,
  {
    now,
    t,
    ...options
  }: {
    now: number
    t: Formatter
    direction?: 'future' | 'past'
    isDesktop?: boolean
  },
) => {
  const td = (+date - now) / 1000
  const direction = options.direction || (td > 0 ? 'future' : 'past')

  switch (direction) {
    case 'future': {
      return timeahead(t, Math.max(0, td))
    }
    default: {
      /*
       * On large screens we use the full timeago string. On smaller screens
       * we abreviate it to just '5h' instead of the full '5 hours ago'.
       */
      if (options.isDesktop) {
        return timeago(t, Math.max(0, -td))
      } else {
        return timeduration(t, Math.max(0, -td))
      }
    }
  }
}
