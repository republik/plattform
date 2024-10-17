import React, { useMemo } from 'react'
import { css } from 'glamor'
import { mUp, tUp } from './mediaQueries'
import { useColorContext } from '../Colors/useColorContext'

const TEXT_PADDING = 50

const positionHalfWidth = {
  position: 'absolute',
  width: `calc(50% - ${TEXT_PADDING}px)`,
}

const positionFullWidth = {
  position: 'absolute',
  left: `${TEXT_PADDING}px`,
  right: `${TEXT_PADDING}px`,
}

const styles = {
  rootPosition: css({
    [tUp]: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      overflow: 'hidden',
    },
  }),
  rootMiddle: css({
    [tUp]: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    },
  }),
  positioned: css({
    position: 'relative',
  }),
  topleft: css({
    [tUp]: {
      ...positionHalfWidth,
      left: `${TEXT_PADDING}px`,
      top: `${TEXT_PADDING}px`,
    },
  }),
  topright: css({
    [tUp]: {
      ...positionHalfWidth,
      left: '50%',
      top: `${TEXT_PADDING}px`,
    },
  }),
  bottomleft: css({
    [tUp]: {
      ...positionHalfWidth,
      bottom: `${TEXT_PADDING}px`,
      left: `${TEXT_PADDING}px`,
    },
  }),
  bottomright: css({
    [tUp]: {
      ...positionHalfWidth,
      bottom: `${TEXT_PADDING}px`,
      left: '50%',
    },
  }),
  top: css({
    [tUp]: {
      ...positionFullWidth,
      top: `${TEXT_PADDING}px`,
    },
  }),
  middle: css({
    [tUp]: {
      ...positionFullWidth,
    },
  }),
  bottom: css({
    [tUp]: {
      ...positionFullWidth,
      bottom: `${TEXT_PADDING}px`,
    },
  }),
  center: css({
    textAlign: 'center',
  }),
  centerMobileOnly: css({
    textAlign: 'center',
    [mUp]: {
      textAlign: 'inherit',
    },
  }),
}

/**
 * @typedef {object} TextProps
 * @property {React.ReactNode} children
 * @property {object} [attributes]
 * @property {'topleft' | 'topright' | 'bottomleft' | 'bottomright' | 'top' | 'middle' | 'bottom'} [position]
 * @property {boolean} [center]
 * @property {string} [color]
 * @property {string} [collapsedColor]
 * @property {string} [maxWidth]
 * @property {string} [margin]
 * @property {boolean} [feuilleton]
 * @property {React.ReactNode} [audioPlayButton]
 */

/**
 * Text component
 * @param {TextProps} props
 * @returns {JSX.Element}
 */
const Text = ({
  children,
  attributes,
  position,
  center,
  color,
  collapsedColor,
  maxWidth,
  margin,
  feuilleton,
  audioPlayButton,
}) => {
  const [colorScheme] = useColorContext()
  const textAlignStyle =
    feuilleton && !center
      ? styles.centerMobileOnly
      : center
      ? styles.center
      : undefined
  const rootStyles = position ? styles.rootPosition : {}
  const middleStyles = position === 'middle' ? styles.rootMiddle : {}

  const colorRule = useMemo(
    () =>
      collapsedColor
        ? css({
            color: collapsedColor,
            [tUp]: {
              color: colorScheme.getCSSColor(color || 'text'),
            },
          })
        : css({
            color: colorScheme.getCSSColor(color || 'text'),
          }),
    [colorScheme, collapsedColor, color],
  )

  return (
    <div {...rootStyles} {...middleStyles}>
      <div
        {...attributes}
        {...colorRule}
        {...textAlignStyle}
        {...css(styles.positioned, position ? styles[position] : {})}
        style={{ maxWidth, margin }}
      >
        {children}
        {audioPlayButton && (
          <div style={{ marginTop: 20 }}>{audioPlayButton}</div>
        )}
      </div>
    </div>
  )
}

export default Text
