const apiSurfaces = [
  // Canonical non-prefixed API
  [
    'requestFullscreen',
    'exitFullscreen',
    'fullscreenElement',
    'fullscreenEnabled',
    'fullscreenchange',
    'fullscreenerror'
  ],
  // contemporary webkit
  [
    'webkitRequestFullscreen',
    'webkitExitFullscreen',
    'webkitFullscreenElement',
    'webkitFullscreenEnabled',
    'webkitfullscreenchange',
    'webkitfullscreenerror'
  ],
  // legacy webkit (Safari 5.1)
  [
    'webkitRequestFullScreen',
    'webkitCancelFullScreen', // That's why we check apiSurface[1] for feature detection below.
    'webkitCurrentFullScreenElement',
    'webkitCancelFullScreen',
    'webkitfullscreenchange',
    'webkitfullscreenerror'
  ],
  [
    'mozRequestFullScreen',
    'mozCancelFullScreen',
    'mozFullScreenElement',
    'mozFullScreenEnabled',
    'mozfullscreenchange',
    'mozfullscreenerror'
  ],
  // IE11
  // https://msdn.microsoft.com/en-us/library/dn265028(v=vs.85).aspx
  [
    'msRequestFullscreen',
    'msExitFullscreen',
    'msFullscreenElement',
    'msFullscreenEnabled',
    'MSFullscreenChange',
    'MSFullscreenError'
  ]
]

const getFullscreenApi = () => {
  let api = {}
  const canonicalSurface = apiSurfaces[0]
  apiSurfaces.forEach(apiSurface => {
    if (!document[apiSurface[1]]) {
      return
    }
    apiSurface.forEach((method, index) => {
      api[canonicalSurface[index]] = apiSurface[index]
    })
  })
  return api.requestFullscreen ? api : null
}

export const setupFullscreen = ({ onChange }) => {
  const api = getFullscreenApi()
  if (!api) {
    return
  }

  document.addEventListener(api.fullscreenchange, onChange, false)

  return {
    request(elem) {
      const subject = elem || document.documentElement
      subject[api.requestFullscreen]()
    },
    element() {
      return document[api.fullscreenElement]
    },
    dispose() {
      document.removeEventListener(api.fullscreenchange, onChange, false)
    }
  }
}
