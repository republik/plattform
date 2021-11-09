import { css } from 'glamor'
import React, { useRef, useState, useEffect, useMemo } from 'react'
import scrollIntoView from 'scroll-into-view'

import { ChevronLeftIcon, ChevronRightIcon } from '../Icons'
import { PADDING, TILE_MARGIN_RIGHT } from '../TeaserCarousel/constants'
import { plainButtonRule } from '../Button'
import { useColorContext } from '../Colors/useColorContext'

const styles = {
  container: css({
    position: 'relative',
    overflow: 'hidden'
  }),
  containerMargin: css({
    margin: `0 -${PADDING}px 0`
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
  centered?: boolean
  initialScrollTileIndex?: number
  fullWidth?: boolean
  bgColor?: string
  color?: string
  hideArrows?: boolean
  arrowSize?: number
  noBorderBottom?: boolean
}

const Scroller = ({
  initialScrollTileIndex = 0,
  children,
  centered = false,
  fullWidth = false,
  bgColor,
  color,
  hideArrows = false,
  arrowSize = 50,
  noBorderBottom = false
}: ScrollerType) => {
  const overflow = useRef<HTMLDivElement>()
  const [{ left, right }, setArrows] = useState({ left: false, right: false })
  const [colorScheme] = useColorContext()
  const borderRule = useMemo(
    () =>
      css({
        borderBottomWidth: 1,
        borderBottomStyle: 'solid',
        borderBottomColor: colorScheme.getCSSColor('divider')
      }),
    [colorScheme]
  )

  const padding = !fullWidth ? 0 : PADDING

  useEffect(() => {
    if (!(initialScrollTileIndex > 0)) {
      return
    }
    const scroller = overflow.current
    const target = Array.from(scroller?.children)[initialScrollTileIndex + 1] // + 1 for pad element

    scroller.scrollLeft += Math.round(
      target.getBoundingClientRect().left - padding
    )
  }, [initialScrollTileIndex])

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
    const leftOffset =
      direction === 'left'
        ? !fullWidth
          ? TILE_MARGIN_RIGHT
          : 0
        : newRightEdge >= scroller.scrollWidth
        ? 0
        : PADDING

    scrollIntoView(target, {
      time: 400,
      align: {
        left: 0,
        leftOffset,
        ...getTop()
      }
    })
  }

  const shouldCenter = centered && !(left || right)

  return (
    <div
      {...styles.container}
      {...(!fullWidth && styles.containerMargin)}
      role='group'
    >
      <div
        {...styles.scroller}
        style={{ justifyContent: shouldCenter ? 'center' : 'flex-start' }}
        ref={overflow}
      >
        {children}
        {/* filler component that draws rest of border */}
        <div style={{ flex: 1 }} {...(!noBorderBottom && borderRule)}></div>
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
              {...colorScheme.set('backgroundColor', bgColor || 'default')}
            />
            <ChevronLeftIcon
              size={arrowSize}
              {...styles.arrowIcon}
              {...colorScheme.set('fill', color || 'text')}
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
              {...colorScheme.set('backgroundColor', bgColor || 'default')}
            />
            <ChevronRightIcon
              size={arrowSize}
              {...styles.arrowIcon}
              {...colorScheme.set('fill', color || 'text')}
            />
          </button>
        </>
      )}
    </div>
  )
}

export default Scroller
