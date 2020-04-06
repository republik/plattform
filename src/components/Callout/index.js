import React from 'react'
import { css } from 'glamor'
import PropTypes from 'prop-types'
import { mUp } from '../../theme/mediaQueries'
import colors from '../../theme/colors'
import zIndex from '../../theme/zIndex'

const slideUp = css.keyframes({
  from: {
    bottom: -400
  },
  to: {
    bottom: 0
  }
})

const styles = {
  calloutContainer: css({
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: zIndex.callout,
    background: 'rgba(0,0,0,0.5)',
    [mUp]: {
      position: 'absolute',
      top: '100%',
      left: '50%',
      right: '50%',
      bottom: 'auto',
      background: 'none'
    }
  }),
  arrow: css({
    display: 'none',
    [mUp]: {
      display: 'block',
      transform: 'rotate(-45deg)',
      background: colors.containerBg,
      borderTop: `1px solid ${colors.divider}`,
      borderRight: `1px solid ${colors.divider}`,
      width: 12,
      height: 12,
      position: 'absolute',
      top: -7
    }
  }),
  callout: css({
    zIndex: 1,
    position: 'absolute',
    background: 'white',
    border: `1px solid ${colors.divider}`,
    left: 0,
    bottom: -400,
    right: 0,
    padding: '15px 15px 80px',
    animation: `0.3s ${slideUp} 0.2s forwards`,
    textAlign: 'left',
    boxShadow: 'inset 0px -50px 50px -30px rgba(0, 0, 0, 0.3)',
    [mUp]: {
      bottom: 'auto',
      top: 20,
      left: 'auto',
      padding: 10,
      animation: 'none',
      boxShadow: 'none'
    }
  }),
  right: {
    callout: css({
      [mUp]: {
        right: -20,
        left: 'auto'
      }
    }),
    arrow: css({
      right: 14
    })
  },
  left: {
    callout: css({
      [mUp]: {
        left: -20,
        right: 'auto'
      }
    }),
    arrow: css({
      left: 14
    })
  }
}

const Callout = ({ children, align = 'left', onClose }) => (
  <div {...styles.calloutContainer} onClick={onClose}>
    <div
      {...styles.callout}
      {...styles[align].callout}
      onClick={e => e.stopPropagation()}
    >
      <div {...styles.arrow} {...styles[align].arrow} />
      {children}
    </div>
  </div>
)

Callout.propTypes = {
  align: PropTypes.oneOf(['left', 'right'])
}

export default Callout
