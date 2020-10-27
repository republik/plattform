import React, { useMemo } from 'react'
import { css } from 'glamor'
import PropTypes from 'prop-types'
import { mUp } from '../../theme/mediaQueries'
import zIndex from '../../theme/zIndex'
import { useColorContext } from '../Colors/useColorContext'

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
      position: 'relative',
      top: 18
    }
  }),
  arrow: css({
    display: 'none',
    [mUp]: {
      display: 'block',
      transform: 'rotate(-45deg)',
      width: 12,
      height: 12,
      position: 'absolute',
      top: -7
    }
  }),
  callout: css({
    zIndex: 1,
    position: 'absolute',
    left: 0,
    bottom: -400,
    right: 0,
    padding: '15px 15px 80px',
    animation: `0.3s ${slideUp} 0.2s forwards`,
    textAlign: 'left',
    [mUp]: {
      bottom: 'auto',
      top: 20,
      left: 'auto',
      padding: 10,
      animation: 'none'
    }
  }),
  right: {
    callout: css({
      [mUp]: {
        right: -9,
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
        left: -9,
        right: 'auto'
      }
    }),
    arrow: css({
      left: 14
    })
  }
}

const Callout = ({ children, align = 'left', onClose }) => {
  const [colorScheme] = useColorContext()
  const calloutRule = useMemo(
    () =>
      css({
        backgroundColor: colorScheme.getCSSColor('overlay'),
        [mUp]: {
          boxShadow: colorScheme.getCSSColor('overlayShadow')
        }
      }),
    [colorScheme]
  )
  return (
    <div {...styles.calloutContainer} onClick={onClose}>
      <div
        {...styles.callout}
        {...styles[align].callout}
        {...calloutRule}
        onClick={e => e.stopPropagation()}
      >
        <div {...styles.arrow} {...calloutRule} {...styles[align].arrow} />
        {children}
      </div>
    </div>
  )
}

Callout.propTypes = {
  align: PropTypes.oneOf(['left', 'right'])
}

export default Callout
