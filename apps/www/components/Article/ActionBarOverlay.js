import React, { useEffect, useRef, useState } from 'react'
import { mediaQueries, useMediaQuery } from '@project-r/styleguide'
import { AUDIO_PLAYER_HEIGHT } from '../constants'

import BottomPanel from '../Frame/BottomPanel'

const ACTIONBAR_FADE_AREA = 400
const FOOTER_FADE_AREA = 800
const FOOTER_FADE_AREA_MOBILE = 1200

const ActionBarOverlay = ({ children, audioPlayerVisible }) => {
  const [overlayVisible, setOverlayVisible] = useState(false)
  const isDesktop = useMediaQuery(mediaQueries.mUp)

  const lastY = useRef()
  const diff = useRef(0)

  const audioPlayerOffset = audioPlayerVisible ? AUDIO_PLAYER_HEIGHT + 20 : 0

  useEffect(() => {
    const onScroll = () => {
      const scrollHeight = document.body.scrollHeight
      const windowHeight = window.innerHeight
      const footerFadeArea = isDesktop
        ? FOOTER_FADE_AREA
        : FOOTER_FADE_AREA_MOBILE
      const y = Math.max(window.pageYOffset)
      const articleActionBarVisible = ACTIONBAR_FADE_AREA - y >= 0
      const footerOverlap = scrollHeight - windowHeight - y <= footerFadeArea
      const newDiff = lastY.current ? lastY.current - y : 0

      diff.current += newDiff
      diff.current = Math.max(Math.min(30, diff.current), 0)
      if (y > lastY.current) {
        // downscroll
        setOverlayVisible(false)
      } else {
        // upscroll
        setOverlayVisible(
          articleActionBarVisible || footerOverlap || diff.current < 30
            ? false
            : true,
        )
      }
      lastY.current = y
    }

    window.addEventListener('scroll', onScroll)
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [isDesktop])
  return (
    <BottomPanel offset={audioPlayerOffset} visible={overlayVisible}>
      {children}
    </BottomPanel>
  )
}

export default ActionBarOverlay
