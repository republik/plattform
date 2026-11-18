import { countMinutes, dayjs } from '@/app/lib/util/time-format'
import { useEffect, useState } from 'react'
import {
  fontStyles,
  Interaction,
  mediaQueries,
  P,
  pxToRem,
  useColorContext,
} from '@project-r/styleguide'
import withT from '@/lib/withT'
import { css } from 'glamor'

const styles = {
  smallNumber: css({
    display: 'block',
    [mediaQueries.mUp]: {
      marginBottom: -3,
    },
    fontSize: 22,
    ...fontStyles.sansSerifRegular,
    lineHeight: 1,
  }),
  label: css(Interaction.fontRule, {
    display: 'block',
    fontSize: pxToRem(14),
    lineHeight: pxToRem(20),
    paddingTop: 5,
    paddingBottom: 5,
    [mediaQueries.mUp]: {
      paddingTop: 8,
    },
  }),
}

const Countdown = withT(({ t, endDate, caption, over }) => {
  const [colorScheme] = useColorContext()
  const [lastUpdate, setLastUpdate] = useState()
  const [currentTimeout, setCurrentTimeout] = useState()

  const tick = () => {
    const now = new Date()

    const msLeft = 1000 - now.getMilliseconds() + 50
    let msToNextTick = (60 - now.getSeconds()) * 1000 + msLeft

    const end = new Date(endDate)
    if (end < now) {
      return
    }
    const totalMinutes = countMinutes(now, end)
    const hours = Math.floor(totalMinutes / 60) % 24
    if (hours === 0) {
      msToNextTick = msLeft
    }

    clearTimeout(currentTimeout)
    setCurrentTimeout(
      setTimeout(() => {
        setLastUpdate(new Date())
        tick()
      }, msToNextTick),
    )
  }

  useEffect(() => {
    tick()
    clearTimeout(currentTimeout)
  }, [])

  const now = new Date()
  const nextMinute = dayjs().add(59_999, 'ms').startOf('minute')

  // end date is expected to be an exact minute
  // it is rounded to the nearest minute to ensure that and
  // support end dates like '2017-05-31 19:59:59.999+02'
  const end = dayjs(endDate).add(30, 'second').startOf('minute')

  const totalMinutes = countMinutes(nextMinute, end)
  const minutes = totalMinutes % 60
  const hours = Math.floor(totalMinutes / 60) % 24
  const days = Math.floor(totalMinutes / 60 / 24)

  const isRunning = minutes >= 0

  return (
    <P {...colorScheme.set('color', 'text')}>
      <span
        {...styles.smallNumber}
        style={isRunning ? undefined : { lineHeight: 1.3 }}
      >
        {isRunning
          ? [
              days > 0 &&
                t.pluralize('crowdfunding/status/time/days', {
                  count: days,
                }),
              (days !== 0 || hours > 0) &&
                t.pluralize('crowdfunding/status/time/hours', {
                  count: hours,
                }),
              t.pluralize('crowdfunding/status/time/minutes', {
                count: minutes,
              }),
              days === 0 &&
                hours === 0 &&
                lastUpdate &&
                t.pluralize('crowdfunding/status/time/seconds', {
                  count: 60 - now.getSeconds(),
                }),
            ]
              .filter(Boolean)
              .join(' ')
          : over}
      </span>
      {isRunning ? <span {...styles.label}>{caption}</span> : <br />}
    </P>
  )
})

export default Countdown
