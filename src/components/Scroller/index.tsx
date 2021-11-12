import { css } from 'glamor'
import React, { useRef, useState, useEffect, useMemo } from 'react'
import scrollIntoView from 'scroll-into-view'
import { ChevronLeftIcon, ChevronRightIcon } from '../Icons'
import { plainButtonRule } from '../Button'
import { useColorContext } from '../Colors/useColorContext'
import { mUp } from '../../theme/mediaQueries'

const styles = {
  container: css({
    position: 'relative',
    overflow: 'hidden'
  }),
  breakoutMargin: css({
    [mUp]: {
      margin: 0
    }
  }),
  scroller: css({
    display: 'flex',
    flexDirection: 'row',
    overflowX: 'scroll',
    flexWrap: 'nowrap',
    scrollbarWidth: 'none' /* Firefox */,
    msOverflowStyle: 'none' /* IE 10+ */,
    WebkitOverflowScrolling: 'touch',
    '::-webkit-scrollbar': {
      display: 'none'
    }
  }),
  arrow: css(plainButtonRule, {
    display: 'none',
    '@media (hover)': {
      display: 'flex',
      position: 'absolute',
      top: 0,
      bottom: 0,
      textAlign: 'center',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'none',
      opacity: 0,
      transition: 'opacity 200ms'
    }
  }),
  arrowIcon: css({
    // ontop of arrowBg
    position: 'relative'
  }),
  arrowBg: css({
    display: 'block',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.7
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

type ScrollerType = {
  children: React.ReactNode
  center?: boolean
  activeScrollItemIndex?: number
  hideArrows?: boolean
  arrowSize?: number
  breakoutWidth?: number
}

const Scroller = ({
  children,
  activeScrollItemIndex = 0,
  center = false,
  hideArrows = false,
  arrowSize = 28,
  breakoutWidth = 0
}: ScrollerType) => {
  const overflow = useRef<HTMLDivElement>()
  const [{ left, right }, setArrows] = useState({ left: false, right: false })
  const [colorScheme] = useColorContext()

  useEffect(() => {
    const scroller = overflow.current
    const target = Array.from(scroller?.children)[activeScrollItemIndex + 1] // + 1 for pad element
    scrollIntoView(target, {
      time: 400,
      align: {
        left: 0,
        leftOffset: breakoutWidth,
        ...getTop()
      }
    })
  }, [activeScrollItemIndex])

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

  const getTop = () => {
    const scroller = overflow.current
    return {
      top: 0,
      topOffset: scroller.getBoundingClientRect().top
    }
  }

  const handleArrowClick = direction => () => {
    const scroller = overflow.current
    const clientWidth = scroller.clientWidth
    const target = Array.from(scroller.children).find(element => {
      const { left, width } = element.getBoundingClientRect()
      if (direction === 'left') {
        return left + clientWidth >= 0
      }
      return left + width > clientWidth
    })
    // scroll all the way at the end
    const newRightEdge =
      scroller.scrollLeft + target.getBoundingClientRect().left + clientWidth
    const leftOffset = newRightEdge >= scroller.scrollWidth ? 0 : breakoutWidth

    scrollIntoView(target, {
      time: 400,
      align: {
        left: 0,
        leftOffset,
        ...getTop()
      }
    })
  }

  const shouldCenter = center && !(left || right)

  return (
    <div
      {...styles.container}
      {...(breakoutWidth > 0 &&
        css(css({ margin: `0 -${breakoutWidth}px 0` }), styles.breakoutMargin))}
      role='group'
    >
      <div
        ref={overflow}
        {...styles.scroller}
        style={{
          justifyContent: shouldCenter ? 'center' : 'flex-start'
        }}
      >
        <div style={{ flex: shouldCenter ? 1 : `0 0 ${breakoutWidth}px` }} />
        {children}
        <div style={{ flex: shouldCenter ? 1 : `0 0 ${breakoutWidth}px` }} />
      </div>
      {!hideArrows && (
        <>
          <button
            {...styles.arrow}
            {...(left && styles.arrowHoverable)}
            style={{ left: 0, width: arrowSize }}
            onClick={handleArrowClick('left')}
          >
            <span
              {...styles.arrowBg}
              {...colorScheme.set('backgroundColor', 'default')}
            />
            <ChevronLeftIcon
              size={arrowSize}
              {...styles.arrowIcon}
              {...colorScheme.set('fill', 'text')}
            />
          </button>

          <button
            {...styles.arrow}
            {...(right && styles.arrowHoverable)}
            style={{ right: 0, width: arrowSize }}
            onClick={handleArrowClick('right')}
          >
            <span
              {...styles.arrowBg}
              {...colorScheme.set('backgroundColor', 'default')}
            />
            <ChevronRightIcon
              size={arrowSize}
              {...styles.arrowIcon}
              {...colorScheme.set('fill', 'text')}
            />
          </button>
        </>
      )}
    </div>
  )
}

export default Scroller
