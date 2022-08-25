import { renderTime } from '../shared'
import React from 'react'
import { css } from 'glamor'
import { sansSerifRegular14 } from '../../Typography/styles'
import { useColorContext } from '../../Colors/ColorContext'

const styles = {
  time: css({
    ...sansSerifRegular14,
    fontFeatureSettings: '"tnum" 1, "kern" 1',
    margin: 0,
  }),
}

type TimeProps = {
  currentTime?: number
  duration?: number
}

const Time = ({ currentTime = 0, duration = 0 }: TimeProps) => {
  const [colorScheme] = useColorContext()
  return (
    <span {...styles.time} {...colorScheme.set('color', 'textSoft')}>
      {renderTime(currentTime)} / {renderTime(duration)}
    </span>
  )
}

export default Time
