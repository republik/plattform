import { renderTime } from '../shared'
import React from 'react'
import { css } from 'glamor'
import { fontStyles, useColorContext } from '@project-r/styleguide'
import { clamp } from '../../helpers/clamp'

const styles = {
  time: css({
    ...fontStyles.sansSerifRegular14,
    fontFeatureSettings: '"tnum" 1, "kern" 1',
    margin: 0,
  }),
}

type TimeProps = {
  currentTime?: number
  duration?: number
}

const Time = ({ currentTime, duration }: TimeProps) => {
  const [colorScheme] = useColorContext()

  const currentTimeString = renderTime(clamp(currentTime || 0, 0, duration))
  const durationString = renderTime(duration || 0)

  return (
    <span
      role='presentation' // FIXME: should this be a <time> element? role='timer'?
      {...styles.time}
      {...colorScheme.set('color', 'textSoft')}
    >
      {currentTimeString} / {durationString}
    </span>
  )
}

export default Time
