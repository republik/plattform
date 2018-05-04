import React from 'react'
import PropTypes from 'prop-types'
import {css} from 'glamor'
import MdClose from 'react-icons/lib/md/close'

import colors from '../../theme/colors'
import {mUp} from '../../theme/mediaQueries'
import {sansSerifRegular16} from '../Typography/styles'

export const height = 48

const styles = {
  root: css({
    display: 'flex',
    height: `${height}px`,
    background: 'white',
    borderBottom: `1px solid ${colors.divider}`,

    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    zIndex: 100,

    [mUp]: {
      position: 'absolute'
    }
  }),
  close: css({
    fontSize: '24px',
    height: `${height}px`,
    width: '38px',
    flexBasis: '38px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    border: 'none',
    outline: 'none',
    padding: '0',
    background: 'transparent',

    // For some reason 'justify-content' doesn't work in iOS, so
    // use auto margin to center the icon inside the button.
    '& > svg': {
      margin: '0 auto'
    },

    [mUp]: {
      width: '48px',
      flexBasis: '48px',
    }
  }),
  confirm: css({
    height: `${height}px`,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    border: 'none',
    outline: 'none',
    background: 'transparent',

    ...sansSerifRegular16,
    color: colors.primary,
    margin: '0 0 0 auto',
    padding: '0 12px',

    [mUp]: {
      padding: '0 20px',
    }
  })
}

export const OverlayToolbar = ({children}) => (
  <div {...styles.root}>{children}</div>
)
OverlayToolbar.propTypes = {
  children: PropTypes.node.isRequired
}

export const OverlayToolbarClose = ({onClick}) => (
  <button {...styles.close} onClick={onClick}>
    <MdClose />
  </button>
)
OverlayToolbarClose.propTypes = {
  onClick: PropTypes.func.isRequired
}

export const OverlayToolbarConfirm = ({label, onClick}) => (
  <button {...styles.confirm} onClick={onClick}>
    {label}
  </button>
)
OverlayToolbarConfirm.propTypes = {
  label: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired
}
