import { useEffect, useState, useRef } from 'react'
import compose from 'lodash/flowRight'

import { ZINDEX_FEED_STICKY_SECTION_LABEL } from '../constants'
import { css } from 'glamor'
import {
  mediaQueries,
  useHeaderHeight,
  useColorContext,
} from '@project-r/styleguide'
import PropTypes from 'prop-types'
import { withTester } from '../Auth/checkRoles'

const SIDEBAR_WIDTH = 120
const MARGIN_WIDTH = 20
const STICKY_HEADER_HEIGHT = 27

const StickySection = ({ children, label, hasSpaceAfter = true }) => {
  const [colorScheme] = useColorContext()
  const [sticky, setSticky] = useState(false)
  const [isMedium, setIsMedium] = useState(false)
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)
  const headerHeight = useHeaderHeight()

  const sectionRef = useRef(null)
  const stateRef = useRef()
  stateRef.current = {
    sticky,
    height,
    headerHeight,
    hasSpaceAfter,
  }

  useEffect(() => {
    const onScroll = () => {
      if (sectionRef.current) {
        const { sticky, height, headerHeight, hasSpaceAfter } = stateRef.current
        const y = window.pageYOffset + headerHeight
        const offset = sectionRef.current.offsetTop
        const nextSticky =
          y > offset && // scroll pos is below top of section
          offset + height + (hasSpaceAfter ? STICKY_HEADER_HEIGHT : 0) > y // scroll pos is above bottom
        if (sticky !== nextSticky) {
          setSticky(nextSticky)
        }
      }
    }

    const measure = () => {
      const isMedium = window.innerWidth < mediaQueries.lBreakPoint
      if (sectionRef.current) {
        const { width, height } = sectionRef.current.getBoundingClientRect()
        setWidth(width)
        setHeight(height)
        setIsMedium(isMedium)
      }
    }
    window.addEventListener('scroll', onScroll)
    window.addEventListener('resize', measure)
    measure()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', measure)
    }
  }, [])

  return (
    <section ref={sectionRef}>
      <div {...style.header} {...colorScheme.set('backgroundColor', 'default')}>
        <div
          {...style.label}
          {...colorScheme.set('borderBottomColor', sticky ? 'divider' : 'text')}
          {...colorScheme.set('backgroundColor', 'default')}
          {...(sticky ? style.sticky : undefined)}
          style={{
            borderTopWidth: sticky ? 0 : 1,
            top: sticky ? headerHeight : undefined,
            position: sticky ? 'fixed' : 'relative',
            width: isMedium ? width : width ? SIDEBAR_WIDTH : '100%',
          }}
        >
          {label}
        </div>
      </div>
      {children}
    </section>
  )
}

const style = {
  header: css({
    margin: '0 0 30px 0',
    width: '100%',
    height: STICKY_HEADER_HEIGHT,
    [mediaQueries.lUp]: {
      height: 'auto',
      float: 'left',
      margin: `0 0 30px -${SIDEBAR_WIDTH + MARGIN_WIDTH}px`,
      width: SIDEBAR_WIDTH,
      '& > div': {
        width: SIDEBAR_WIDTH,
      },
    },
  }),
  label: css({
    padding: '8px 0',
    borderTopStyle: 'solid',
    zIndex: ZINDEX_FEED_STICKY_SECTION_LABEL,
  }),
  sticky: css({
    borderBottomWidth: '0.5px',
    borderBottomStyle: 'solid',
    [mediaQueries.lUp]: {
      borderBottom: 'none',
    },
  }),
}

StickySection.propTypes = {
  hasSpaceAfter: PropTypes.bool,
  label: PropTypes.string.isRequired,
}

export default compose(withTester)(StickySection)
