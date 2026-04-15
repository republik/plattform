// Derived from https://github.com/facebook/immutable-js/blob/7f4e61601d92fc874c99ccf7734d6f33239cec8c/pages/src/src/Header.js#L2

import { useState, useEffect, useRef } from 'react'
import { css } from 'glamor'
import { range } from 'd3-array'

import { HEADER_HEIGHT } from '../constants'

import {
  NarrowContainer,
  fontFamilies,
  mediaQueries,
  useColorContext,
} from '@project-r/styleguide'

const styles = {
  cover: css({
    position: 'fixed',
    left: 0,
    right: 0,
    fontFamily: fontFamilies.sansSerifMedium,
    top: HEADER_HEIGHT,
    height: 220,
    paddingTop: 20,
    fontSize: 150,
    [mediaQueries.mUp]: {
      height: 420,
      fontSize: 300,
    },
  }),
  headline: css({
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
  }),
  content: css({
    position: 'relative',
    zIndex: 1,
    marginTop: 200,
    [mediaQueries.mUp]: {
      marginTop: 400,
    },
    paddingTop: 60,
    paddingBottom: 60,
  }),
}

const ErrorFrame = ({ children, statusCode }) => {
  const [colorScheme] = useColorContext()
  const [isMobile, setIsMobile] = useState(true)
  const [scroll, setScroll] = useState(0)

  const requestRef = useRef()

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < mediaQueries.mBreakPoint
      if (mobile !== isMobile) {
        setIsMobile(mobile)
      }
    }

    const handleScroll = () => {
      if (!requestRef.current) {
        const headerHeight = window.innerHeight * 0.6
        if (window.scrollY < headerHeight) {
          requestRef.current = window.requestAnimationFrame(() => {
            requestRef.current = undefined
            setScroll(Math.max(window.scrollY, 0))
          })
        }
      }
    }
    handleScroll()
    handleResize()
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleResize)

    return () => {
      window.cancelAnimationFrame(requestRef.current)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const space = isMobile ? 35 : 70

  return (
    <>
      <div {...styles.cover}>
        {(isMobile ? range(7) : range(11)).map((_, i) => (
          <div
            key={i}
            {...styles.headline}
            {...colorScheme.set('color', 'primary')}
            style={t(y(scroll, i * space), z(scroll, i * space))}
          >
            <span style={{ opacity: o(scroll, i * space) }}>{statusCode}</span>
          </div>
        ))}
        <div {...styles.headline} style={t(scroll * -0.55, 1)}>
          <span>{statusCode}</span>
        </div>
      </div>
      <div
        {...styles.content}
        {...colorScheme.set('backgroundColor', 'default')}
      >
        <NarrowContainer>{children}</NarrowContainer>
      </div>
    </>
  )
}

const y = (scroll, pos) => {
  return (pos < scroll ? pos : scroll) * -0.55
}

const o = (scroll, pos) => {
  return Math.max(0, scroll > pos ? 1 - (scroll - pos) / 350 : 1)
}

const z = (scroll, pos) => {
  return Math.max(0, scroll > pos ? 1 - (scroll - pos) / 20000 : 1)
}

const t = (y, z) => {
  const transform = `translate3d(0, ${y}px, 0) scale(${z})`
  return {
    transform: transform,
    WebkitTransform: transform,
    MozTransform: transform,
    msTransform: transform,
    OTransform: transform,
  }
}

export default ErrorFrame
