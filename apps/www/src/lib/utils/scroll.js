import { easeCubicOut } from 'd3-ease'
import { timer } from 'd3-timer'
import { interpolateNumber } from 'd3-interpolate'

let scrollTimer

export const scrollIt = (destination, duration = 200) => {
  if (scrollTimer) {
    scrollTimer.stop()
  }
  const n = interpolateNumber(window.pageYOffset, destination)
  scrollTimer = timer((elapsed) => {
    const t = easeCubicOut(Math.min(elapsed / duration, 1))

    window.scroll(0, Math.round(n(t)))

    if (t >= 1) {
      scrollTimer.stop()
    }
  })
}

export const focusSelector = (selector, aim) => {
  const element = document.querySelector(selector)

  if (!aim) {
    aim = 'middle'
  }

  if (element) {
    const rect = element.getBoundingClientRect()
    let y

    if (aim === 'middle') {
      y = window.pageYOffset + rect.top - window.innerHeight / 3
    } else {
      y = window.pageYOffset + rect.top
    }

    window.scroll(0, y)
  }
}
