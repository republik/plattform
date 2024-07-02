import React from 'react'

import { useCurrentMinute } from '../../../../lib/useCurrentMinute'
import { formatTimeRelative } from '../../DiscussionContext'
import { Formatter } from '../../../../lib/translate'

type RelativeTimeProps = {
  date: string
  t: Formatter
  isDesktop: boolean
  direction?: 'past' | 'future'
}

const RelativeTime = ({
  date,
  t,
  isDesktop,
  direction = 'past',
}: RelativeTimeProps) => {
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
