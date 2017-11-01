import React from 'react'
import {css} from 'glamor'
import {MdClose} from 'react-icons/lib/md'

import colors from '../../theme/colors'
import {sansSerifRegular16} from '../Typography/styles'

const styles = {
  root: css({
    display: 'flex',
    height: 48,
    borderBottom: `1px solid ${colors.divider}`
  }),
  close: css({
    fontSize: '24px',
    height: '48px',
    width: '48px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    border: 'none',
    outline: 'none',
    padding: '0',
    background: 'transparent',
  }),
  confirm: css({
    height: '48px',
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
    padding: '0 12px'
  })
}

export const OverlayToolbar = ({children}) => (
  <div {...styles.root}>
    {children}
  </div>
)

export const OverlayToolbarClose = ({onClick}) => (
  <button {...styles.close} onClick={onClick}>
    <MdClose />
  </button>
)

export const OverlayToolbarConfirm = ({label, onClick}) => (
  <button {...styles.confirm} onClick={onClick}>
    {label}
  </button>
)
