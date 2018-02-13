const apiSurfaces = [
  [
    'requestFullscreen',
    'exitFullscreen',
    'fullscreenElement',
    'fullscreenEnabled',
    'fullscreenchange',
    'fullscreenerror'
  ],
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
    'webkitCancelFullScreen',
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
  for (let i = 0; i < apiSurfaces.length; i++) {
    let apiSurface = apiSurfaces[i]
    if (!!document[apiSurface[1]]) {
      let api = {}
      for (let j = 0; j < apiSurface.length; j++) {
        api[apiSurfaces[0][j]] = apiSurface[j]
      }
      return api
    }
  }
  return null
}

const Fullscreen = () => {
  const api = getFullscreenApi()
  if (!api) {
    return null
  }

  return {
    request: elem => {
      elem = elem || document.documentElement
      elem[api.requestFullscreen]()
    },
    addChangeListener: callback => {
      document.addEventListener(api.fullscreenchange, callback, false)
    },
    addErrorListener: callback => {
      document.addEventListener(api.fullscreenerror, callback, false)
    },
    removeChangeListener: callback => {
      document.removeEventListener(api.fullscreenchange, callback, false)
    },
    removeErrorListener: callback => {
      document.removeEventListener(api.fullscreenerror, callback, false)
    },
    isFullscreen: () => !!document[api.fullscreenElement]
  }
}

export default Fullscreen
