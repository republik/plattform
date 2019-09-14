import { css } from 'glamor'
import PropTypes from 'prop-types'
import React, { useRef, useState, useContext, useEffect, useMemo } from 'react'
import scrollIntoView from 'scroll-into-view'

import ChevronLeft from 'react-icons/lib/md/keyboard-arrow-left'
import ChevronRight from 'react-icons/lib/md/keyboard-arrow-right'

import { PADDING, TILE_MARGIN_RIGHT } from './constants'
import CarouselContext from './Context'
import { color } from 'd3-color'

import {
  plainButtonRule
} from '../Button'

const styles = {
  container: css({
    position: 'relative',
    margin: `-${PADDING}px -${PADDING}px 0`,
    padding: `${PADDING}px 0`,
    width: 'auto'
  }),
  overflow: css({
    display: 'flex',
    flexDirection: 'row',
    overflowX: 'scroll',
    flexWrap: 'nowrap',
    scrollbarWidth: 'none' /* Firefox */,
    msOverflowStyle: 'none' /* IE 10+ */,
    WebkitOverflowScrolling: 'touch',
    '::-webkit-scrollbar': {
      width: 0,
      background: 'transparent'
    }
  }),
  pad: css({
    flexShrink: 0,
    width: PADDING,
    height: 1
  }),
  arrow: css(plainButtonRule, {
    display: 'none',
    '@media (hover)': {
      display: 'flex',
      position: 'absolute',
      top: 0,
      bottom: 0,
      width: 60,
      textAlign: 'center',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'none',
      opacity: 0,
      transition: 'opacity 200ms'
    }
  }),
  arrowHoverable: css({
    '@media (hover)': {
      '[role=group]:hover > &': {
        pointerEvents: 'auto',
        opacity: 1
      }
    }
  })
}

// $0.scrollLeft .scrollWidth

export const Row = ({ children }) => {
  const context = useContext(CarouselContext)
  const overflow = useRef()
  const [{left, right}, setArrows] = useState({ left: false, right: false })
  const lightBg = useMemo(() => {
    const bg = color(context.bgColor)
    bg.opacity = 0.7
    return bg.toString()
  }, [context.bgColor])

  useEffect(() => {
    const scroller = overflow.current
    const measure = () => {
      let left = false
      let right = false
      if (scroller.scrollLeft > 0) {
        left = true
      }
      if (scroller.scrollLeft + scroller.clientWidth < scroller.scrollWidth) {
        right = true
      }
      setArrows(current => {
        if (current.left !== left || current.right !== right) {
          return { left, right }
        }
        return current
      })
    }
    scroller.addEventListener('scroll', measure)
    window.addEventListener('resize', measure)
    measure()
    return () => {
      scroller.removeEventListener('scroll', measure)
      window.removeEventListener('resize', measure)
    }
  }, [])

  return (
    <div role='group' {...styles.container}>
      <div {...styles.overflow} ref={overflow}>
        <div {...styles.pad} />
        {children}
        <div {...styles.pad} style={{ width: PADDING - TILE_MARGIN_RIGHT }} />
      </div>
      <button
        {...styles.arrow}
        {...left && styles.arrowHoverable}
        style={{ left: 0, backgroundColor: lightBg }}
        onClick={() => {
          const clientWidth = overflow.current.clientWidth
          const target = Array.from(overflow.current.children).find(element => {
            const { left } = element.getBoundingClientRect()
            return left + clientWidth >= 0
          })
          scrollIntoView(target, {
            time: 400,
            align: {
              left: 0,
              leftOffset: TILE_MARGIN_RIGHT
            }
          })
        }}>
        <ChevronLeft size={50} fill={context.color} />
      </button>
      <button
        {...styles.arrow}
        {...right && styles.arrowHoverable}
        style={{ right: 0, backgroundColor: lightBg }}
        onClick={() => {
          const scroller = overflow.current
          const clientWidth = scroller.clientWidth
          const target = Array.from(scroller.children).find(element => {
            const { left, width } = element.getBoundingClientRect()
            return left + width > clientWidth
          })

          // scroll all the way at the end
          const newRightEdge = scroller.scrollLeft + target.getBoundingClientRect().left + clientWidth
          scrollIntoView(target, {
            time: 400,
            align: {
              left: 0,
              leftOffset: newRightEdge >= scroller.scrollWidth
                ? 0 : PADDING
            }
          })
        }}>
        <ChevronRight size={50} fill={context.color} />
      </button>
    </div>
  )
}

export default Row

Row.propTypes = {
  children: PropTypes.node
}
