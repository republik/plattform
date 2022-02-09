import { useState, useEffect } from 'react'

let setters = []

let timeout = null
const startTimer = () => {
  const currentTime = new Date()
  const msLeft = 1000 - currentTime.getMilliseconds()
  const msToNextMinute = (60 - currentTime.getSeconds()) * 1000 + msLeft
  // ensure timer runs in new minute and with at least 5 seconds in between runs
  const msToNextRun = Math.max(msToNextMinute + 500, 5 * 1000)
  clearTimeout(timeout)
  timeout = setTimeout(() => {
    const now = Date.now()
    setters.forEach((setter) => setter(now))
    startTimer()
  }, msToNextRun)
}

const addSetter = (setter) => {
  setters.push(setter)
  if (timeout === null) {
    startTimer()
  }
}
const rmSetter = (setter) => {
  setters = setters.filter((s) => s !== setter)
  if (!setter.length) {
    clearTimeout(timeout)
    timeout = null
  }
}

export const useCurrentMinute = () => {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    addSetter(setNow)
    return () => {
      rmSetter(setNow)
    }
  }, [])
  return now
}
