// Copyright 2017 Lobbywatch
// BSD-3-Clause
// https://github.com/lobbywatch/website/blob/master/src/components/ContextBox.js

import React, { Fragment } from 'react'
import { css } from 'glamor'
import PropTypes from 'prop-types'

import colors from '../../theme/colors'
import { Interaction } from '../Typography'
import { sansSerifRegular14 } from '../Typography/styles'

const boxStyle = css({
  position: 'absolute',
  backgroundColor: '#fff',
  color: colors.text,
  boxShadow: '0 2px 8px rgba(0,0,0,.2)',
  ...sansSerifRegular14,
  lineHeight: '1.1em',
  padding: '12px 16px',
  pointerEvents: 'none',
  zIndex: 10,
  minWidth: 200
})

const boxPosition = {
  top: {
    center: css({ transform: 'translateX(-50%) translateY(-100%)' }),
    left: css({ transform: 'translateX(-15%) translateY(-100%)' }),
    right: css({ transform: 'translateX(-85%) translateY(-100%)' })
  },
  below: {
    center: css({ transform: 'translateX(-50%) translateY(0)' }),
    left: css({ transform: 'translateX(-15%) translateY(0)' }),
    right: css({ transform: 'translateX(-85%) translateY(0)' })
  }
}

const notchStyle = css({
  position: 'absolute',
  width: 0,
  height: 0,
  borderStyle: 'solid',
  borderWidth: '8px 7.5px 0 7.5px',
  borderColor: `#fff transparent transparent transparent`
})

const notchPosition = {
  top: {
    center: css({ bottom: -8, transform: 'translateX(-50%)', left: '50%' }),
    left: css({ bottom: -8, transform: 'translateX(-50%)', left: '15%' }),
    right: css({ bottom: -8, transform: 'translateX(50%)', right: '15%' })
  },
  below: {
    center: css({
      top: -8,
      transform: 'translateX(-50%) rotate(180deg)',
      left: '50%'
    }),
    left: css({
      top: -8,
      transform: 'translateX(-50%) rotate(180deg)',
      left: '15%'
    }),
    right: css({
      top: -8,
      transform: 'translateX(50%) rotate(180deg)',
      right: '15%'
    })
  }
}

const labeledValueStyle = css({
  fontSize: 14,
  lineHeight: '20px',
  borderBottom: `1px solid ${colors.divider}`,
  paddingBottom: 10,
  marginBottom: 5,
  color: '#000',
  ':last-child': {
    borderBottom: 'none',
    paddingBottom: 5,
    marginBottom: 0
  }
})

export const ContextBoxValue = ({ label, children }) => {
  if (!children) {
    return null
  }
  return (
    <div {...labeledValueStyle} {...Interaction.fontRule}>
      {!!label && (
        <Fragment>
          <strong>{label}</strong>
          <br />
        </Fragment>
      )}
      {children}
    </div>
  )
}

ContextBoxValue.propTypes = {
  label: PropTypes.string,
  children: PropTypes.node
}

const ContextBox = ({
  orientation: yOrientation,
  x,
  y,
  contextWidth,
  children
}) => {
  const maxWidth = Math.min(400, contextWidth)
  let xOrientation = 'center'
  if (contextWidth - x < maxWidth / 2) {
    xOrientation = 'right'
  } else if (x < maxWidth / 2) {
    xOrientation = 'left'
  }

  return (
    <div
      {...boxStyle}
      className={boxPosition[yOrientation][xOrientation]}
      style={{ left: x, top: y, maxWidth }}
    >
      <div>{children}</div>
      <div
        {...notchStyle}
        className={notchPosition[yOrientation][xOrientation]}
      />
    </div>
  )
}

ContextBox.defaultProps = {
  orientation: 'top'
}
ContextBox.propTypes = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  contextWidth: PropTypes.number.isRequired,
  orientation: PropTypes.oneOf(['top', 'below']).isRequired,
  children: PropTypes.node
}

export default ContextBox
