import { useEffect, useState } from 'react'
import useInterval from '../../../lib/hooks/useInterval'

type CountDownTime = {
  distance: number
  days: number
  hours: number
  minutes: number
}

export function getCountDownTime(
  endDate: Date,
  currentDate?: Date,
): CountDownTime {
  const now = new Date()
  const distance = endDate.getTime() - (currentDate || now).getTime()
  // Distance-duration divided by day-duration
  const days = Math.floor(distance / (1000 * 60 * 60 * 24))
  // (Distance-duration mod day-duration) divided by hour-duration
  const hours = Math.floor(
    (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  )
  // (Distance-duration mod hour-duration) divided by minute-duration
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))

  return {
    distance,
    days,
    hours,
    minutes,
  }
}

/**
 * Returns a string representation of the given count down time.
 */
export function getCountDownString(countDownObject: CountDownTime): string {
  const parts = []
  if (countDownObject.days > 0) {
    parts.push(
      `${countDownObject.days} Tag${countDownObject.days > 1 ? 'e' : ''}`,
    )
    if (countDownObject.hours > 0 || countDownObject.minutes > 0) {
      parts.push(' ')
    }
    if (
      (countDownObject.hours > 0 && countDownObject.minutes == 0) ||
      (countDownObject.hours == 0 && countDownObject.minutes > 0)
    ) {
      parts.push('und ')
    }
  }
  if (countDownObject.hours > 0) {
    parts.push(
      `${countDownObject.hours} Stunde${countDownObject.hours > 1 ? 'n' : ''}`,
    )
    if (countDownObject.minutes > 0) {
      parts.push(' ')
    }
    if (countDownObject.minutes > 0) {
      parts.push('und ')
    }
  }
  if (countDownObject.minutes > 0) {
    parts.push(
      `${countDownObject.minutes} Minute${
        countDownObject.minutes > 1 ? 'n' : ''
      }`,
    )
  } else if (
    countDownObject.days == 0 &&
    countDownObject.hours == 0 &&
    countDownObject.minutes == 0 &&
    countDownObject.distance > 0
  ) {
    parts.push('weniger als eine Minute')
  }
  return parts.join('')
}

type CountDownTimeProps = {
  endDate: Date
  startDate?: Date
  onCountDownReached?: () => void | Promise<void>
  reachedContent?: React.ReactNode
}

/**
 * Displays a countdown from the given start date to the given end date.
 * If no startDate is given, the countdown will be shown statically.
 * If only endDate is given, the countdown will be updated every second relative to the current time.
 */
function CountDownTime({
  endDate,
  startDate,
  onCountDownReached,
  reachedContent,
}: CountDownTimeProps) {
  const [remainingTime, setRemainingTime] = useState(
    getCountDownTime(endDate, startDate),
  )

  // If a startDate is provided, the countdown will only update when the input changes
  useEffect(() => {
    if (startDate) {
      setRemainingTime(getCountDownTime(endDate, startDate))
    }
  }, [startDate?.toISOString()])

  // The interval is only to be used when no startDate is given,
  // as the displayed countdown will only update when the input changes
  useInterval(
    () => {
      setRemainingTime(getCountDownTime(endDate, startDate))
    },
    !startDate ? 1000 : null,
  )

  if (remainingTime.distance <= 0 && onCountDownReached) {
    onCountDownReached()
  }

  if (remainingTime.distance <= 0) {
    return reachedContent ? <>{reachedContent}</> : null
  }

  return <span>{getCountDownString(remainingTime)}</span>
}

export default CountDownTime
