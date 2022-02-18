import React from 'react'
import { CloseIcon, SearchMenuIcon } from '@project-r/styleguide'
import {
  mediaQueries,
  plainButtonRule,
  useColorContext,
} from '@project-r/styleguide'
import { css } from 'glamor'

import {
  HEADER_HEIGHT,
  HEADER_HEIGHT_MOBILE,
  HEADER_HORIZONTAL_PADDING,
  ZINDEX_FRAME_TOGGLE,
  TRANSITION_MS,
} from '../constants'

const SIZE = 28
const PADDING_MOBILE = Math.floor((HEADER_HEIGHT_MOBILE - SIZE) / 2)
const PADDING_DESKTOP = Math.floor((HEADER_HEIGHT - SIZE) / 2)

const Toggle = ({ expanded, onClick, ...props }) => {
  const [colorScheme] = useColorContext()
  return (
    <button {...styles.menuToggle} onClick={onClick} {...props}>
      <SearchMenuIcon
        style={{
          opacity: expanded ? 0.000001 : 1, // hacky fix for browser rendering issue in FF
          transition: `opacity ${TRANSITION_MS}ms ease-out`,
        }}
        {...colorScheme.set('fill', 'text')}
        size={SIZE}
      />
      <CloseIcon
        style={{ opacity: expanded ? 1 : 0 }}
        {...styles.closeButton}
        {...colorScheme.set('fill', 'text')}
        size={SIZE}
      />
    </button>
  )
}

const styles = {
  menuToggle: css(plainButtonRule, {
    cursor: 'pointer',
    zIndex: ZINDEX_FRAME_TOGGLE,
    backgroundColor: 'transparent',
    border: 'none',
    boxShadow: 'none',
    outline: 'none',
    padding: PADDING_MOBILE,
    // Additional 4 px to account for scrollbar
    paddingRight: HEADER_HORIZONTAL_PADDING + 4,
    lineHeight: 0,
    [mediaQueries.mUp]: {
      padding: PADDING_DESKTOP,
    },
  }),
  closeButton: css({
    position: 'absolute',
    // Additional 4 px to account for scrollbar
    right: HEADER_HORIZONTAL_PADDING + 4,
    top: PADDING_MOBILE,
    transition: `opacity ${TRANSITION_MS}ms ease-out`,
    [mediaQueries.mUp]: {
      top: PADDING_DESKTOP,
    },
  }),
}

export default Toggle
