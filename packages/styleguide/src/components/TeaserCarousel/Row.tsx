import React from 'react'
import { css } from 'glamor'
import PropTypes from 'prop-types'
import { useRef, useState, useContext, useEffect } from 'react'
import scrollIntoView from 'scroll-into-view'

import { PADDING, TILE_MARGIN_RIGHT } from './constants'
import CarouselContext from './Context'
import { plainButtonRule } from '../Button'
import { useColorContext } from '../Colors/useColorContext'
import { IconChevronLeft, IconChevronRight } from '@republik/icons'

const styles = {
  container: css({
    position: 'relative',
    margin: `-${PADDING}px -${PADDING}px 0`,
    padding: `${PADDING}px 0`,
    width: 'auto',
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
      background: 'transparent',
    },
  }),
  pad: css({
    flexShrink: 0,
    width: PADDING,
    height: 1,
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
      transition: 'opacity 200ms',
    },
  }),
  arrowIcon: css({
    // ontop of arrowBg
    position: 'relative',
  }),
  arrowBg: css({
    display: 'block',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.7,
  }),
  arrowHoverable: css({
    '@media (hover)': {
      '[role=group]:hover > &': {
        pointerEvents: 'auto',
        opacity: 1,
      },
    },
  }),
}

type RowProps = {
  children: React.ReactNode
  initialScrollTileIndex: number
  isSeriesNav?: boolean
}

const Row = ({ initialScrollTileIndex, children, isSeriesNav }: RowProps) => {
  const context = useContext(CarouselContext)
  const overflow = useRef<HTMLDivElement>(null)
  const [{ left, right }, setArrows] = useState({ left: false, right: false })
  const [colorScheme] = useColorContext()

  useEffect(() => {
    if (!(initialScrollTileIndex > 0)) {
      return
    }
    const scroller = overflow.current
    const target = Array.from(scroller.children)[initialScrollTileIndex + 1] // + 1 for pad element

    scroller.scrollLeft += Math.round(
      target.getBoundingClientRect().left - PADDING,
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
      setArrows((current) => {
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
      topOffset: scroller.getBoundingClientRect().top,
    }
  }

  const shouldCenter = isSeriesNav && !(left || right)

  return (
    <div role='group' {...styles.container}>
      <div {...styles.overflow} ref={overflow}>
        <div
          {...styles.pad}
          style={{ margin: shouldCenter ? 'auto' : undefined }}
        />
        {children}
        <div
          {...styles.pad}
          style={{
            width: PADDING - TILE_MARGIN_RIGHT,
            margin: shouldCenter ? 'auto' : undefined,
          }}
        />
      </div>
      <button
        {...styles.arrow}
        {...(left && styles.arrowHoverable)}
        style={{ left: 0 }}
        onClick={() => {
          const scroller = overflow.current
          const clientWidth = scroller.clientWidth
          const target = Array.from(scroller.children).find((element) => {
            const { left } = element.getBoundingClientRect()
            return left + clientWidth >= 0
          })
          scrollIntoView(target, {
            time: 400,
            align: {
              left: 0,
              leftOffset: TILE_MARGIN_RIGHT,
              ...getTop(),
            },
          })
        }}
      >
        <span
          {...styles.arrowBg}
          {...colorScheme.set('backgroundColor', context.bgColor)}
        />
        <IconChevronLeft
          size={50}
          {...styles.arrowIcon}
          {...colorScheme.set('fill', context.color)}
        />
      </button>

      <button
        {...styles.arrow}
        {...(right && styles.arrowHoverable)}
        style={{ right: 0 }}
        onClick={() => {
          const scroller = overflow.current
          const clientWidth = scroller.clientWidth
          const target = Array.from(scroller.children).find((element) => {
            const { left, width } = element.getBoundingClientRect()
            return left + width > clientWidth
          })

          // scroll all the way at the end
          const newRightEdge =
            scroller.scrollLeft +
            target.getBoundingClientRect().left +
            clientWidth
          scrollIntoView(target, {
            time: 400,
            align: {
              left: 0,
              leftOffset: newRightEdge >= scroller.scrollWidth ? 0 : PADDING,
              ...getTop(),
            },
          })
        }}
      >
        <span
          {...styles.arrowBg}
          {...colorScheme.set('backgroundColor', context.bgColor)}
        />
        <IconChevronRight
          size={50}
          {...styles.arrowIcon}
          {...colorScheme.set('fill', context.color)}
        />
      </button>
    </div>
  )
}

export default Row
