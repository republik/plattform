import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import MdClose from 'react-icons/lib/md/close'

import { useColorContext } from '../Colors/useColorContext'
import { mUp } from '../../theme/mediaQueries'
import { sansSerifRegular16 } from '../Typography/styles'

export const height = 48

const styles = {
  root: css({
    display: 'flex',
    height: `${height}px`,
    borderBottom: `1px solid`,
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
      flexBasis: '48px'
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
    margin: '0 0 0 auto',
    padding: '0 12px',

    [mUp]: {
      padding: '0 20px'
    }
  })
}

export const OverlayToolbar = ({ children }) => {
  const [colorScheme] = useColorContext()
  return (
    <div
      {...styles.root}
      {...colorScheme.set('borderColor', 'divider')}
      {...colorScheme.set('backgroundColor', 'overlay')}
    >
      {children}
    </div>
  )
}
OverlayToolbar.propTypes = {
  children: PropTypes.node.isRequired
}

export const OverlayToolbarClose = ({ onClick }) => {
  const [colorScheme] = useColorContext()
  return (
    <button {...styles.close} onClick={onClick}>
      <MdClose {...colorScheme.set('fill', 'text')} />
    </button>
  )
}
OverlayToolbarClose.propTypes = {
  onClick: PropTypes.func.isRequired
}

export const OverlayToolbarConfirm = ({ label, onClick }) => {
  const [colorScheme] = useColorContext()
  return (
    <button
      {...styles.confirm}
      {...css({ color: colorScheme.static.primary })}
      onClick={onClick}
    >
      {label}
    </button>
  )
}
OverlayToolbarConfirm.propTypes = {
  label: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired
}
