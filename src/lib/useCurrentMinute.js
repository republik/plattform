import { useState, useEffect } from 'react'

let setters = []

let timeout = null
const startTimer = () => {
  const currentTime = new Date()
  const msLeft = 1000 - currentTime.getMilliseconds() + 50
  const msToNextMinute = (60 - currentTime.getSeconds()) * 1000 + msLeft
  timeout = setTimeout(() => {
    const now = Date.now()
    setters.forEach(setter => setter(now))
    startTimer()
  }, msToNextMinute)
}

const addSetter = setter => {
  setters.push(setter)
  if (timeout === null) {
    startTimer()
  }
}
const rmSetter = setter => {
  setters = setters.filter(s => s !== setter)
  if (!setter.length) {
    clearTimeout(timeout)
    timeout = null
  }
}

const useCurrentMinute = () => {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    addSetter(setNow)
    return () => {
      rmSetter(setNow)
    }
  }, [])
  return now
}

export default useCurrentMinute
