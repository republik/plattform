const state = {
  playingRef: undefined,
  muted: false, // video only
  subtitles: false, // currently video only
  instances: [],
  setTime: (time) => {
    state.instances.forEach((setter) => {
      setter.setTime && setter.setTime(time)
    })
  },
}

export const parseTimeHash = (hash) => {
  const matches = hash && hash.match(/t=(\d+)/)
  const time = matches && +matches[1]
  if (time && time > -1) {
    return time
  }
  return false
}

if (typeof window !== 'undefined') {
  window.addEventListener('hashchange', () => {
    const time = parseTimeHash(window.location.hash)
    if (time !== false) {
      state.setTime(time)
    }
  })
}

export default state
