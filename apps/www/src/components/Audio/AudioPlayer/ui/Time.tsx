import { fontStyles } from '@project-r/styleguide'
import { token } from '@republik/theme/tokens'
import { css } from 'glamor'
import { clamp } from '../../helpers/clamp'
import { renderTime } from '../shared'

const styles = {
  time: css({
    ...fontStyles.sansSerifRegular14,
    fontFeatureSettings: '"tnum" 1, "kern" 1',
    margin: 0,
    color: token.var('colors.textSoft'),
  }),
}

type TimeProps = {
  currentTime?: number
  duration?: number
}

const Time = ({ currentTime, duration }: TimeProps) => {
  const currentTimeString = renderTime(clamp(currentTime || 0, 0, duration))
  const durationString = renderTime(duration || 0)

  return (
    <span
      role='presentation' // FIXME: should this be a <time> element? role='timer'?
      {...styles.time}
    >
      {currentTimeString} / {durationString}
    </span>
  )
}

export default Time
