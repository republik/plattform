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
  HEADER_HEIGHT_MOBILE,
} from '../../constants'

const Popover = ({ expanded, id, children, dark }) => {
  const [ref] = useBodyScrollLock(expanded)
  const [colorScheme] = useColorContext()
  return (
    <div
      {...css({
        top: HEADER_HEIGHT_MOBILE,
        height: `calc(100vh - ${HEADER_HEIGHT_MOBILE}px)`,
        borderTopWidth: 1,
        borderTopStyle: 'solid',
        [mediaQueries.mUp]: {
          top: HEADER_HEIGHT,
          height: `calc(100vh - ${HEADER_HEIGHT}px)`,
        },
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
