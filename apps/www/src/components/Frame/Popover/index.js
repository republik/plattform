import PropTypes from 'prop-types'
import { css } from 'glamor'

import {
  mediaQueries,
  fontFamilies,
  useBodyScrollLock,
  useColorContext,
} from '@project-r/styleguide'
import {
  ZINDEX_POPOVER,
  HEADER_HEIGHT,
} from '../../constants'
import { useEffect } from 'react'

const Popover = ({ expanded, id, children }) => {
  const [ref] = useBodyScrollLock(expanded)
  const [colorScheme] = useColorContext()

  useEffect(() => {
    if (expanded) {
      ref.current.scrollTop = 0
    }
  }, [expanded])

  return (
    <div
      {...css({
        top: HEADER_HEIGHT,
        height: `calc(100vh - ${HEADER_HEIGHT}px)`,
        borderTopWidth: 1,
        borderTopStyle: 'solid',
      })}
      {...colorScheme.set('borderColor', 'divider')}
      {...colorScheme.set('backgroundColor', 'default')}
      {...menuStyle}
      ref={ref}
      id={id}
      aria-expanded={expanded}
    >
      {children}
    </div>
  )
}

const menuStyle = css({
  position: 'fixed',
  zIndex: ZINDEX_POPOVER + 3,
  left: 0,
  right: 0,
  fontFamily: fontFamilies.sansSerifRegular,
  flexDirection: 'column',
  opacity: 0,
  visibility: 'hidden',
  transition: 'opacity 0.2s ease-in-out, visibility 0s linear 0.2s',
  '&[aria-expanded=true]': {
    opacity: 1,
    visibility: 'visible',
    transition: 'opacity 0.2s ease-in-out',
  },
  overflow: 'auto',
  WebkitOverflowScrolling: 'touch',
})

Popover.propTypes = {
  expanded: PropTypes.bool,
}

export default Popover
