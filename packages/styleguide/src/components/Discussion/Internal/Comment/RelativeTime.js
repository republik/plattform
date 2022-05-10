import React from 'react'

import { useCurrentMinute } from '../../../../lib/useCurrentMinute'
import { formatTimeRelative } from '../../DiscussionContext'

const RelativeTime = ({ date, t, isDesktop, direction = 'past' }) => {
  const now = useCurrentMinute()

  return (
    <span suppressHydrationWarning>
      {formatTimeRelative(new Date(date), {
        t,
        isDesktop,
        now,
        direction,
      })}
    </span>
  )
}

export default RelativeTime
