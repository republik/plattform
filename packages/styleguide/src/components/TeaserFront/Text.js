import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { mUp, tUp } from './mediaQueries'
import { useColorContext } from '../Colors/useColorContext'

const TEXT_PADDING = 50

const styles = {
  rootPosition: css({
    [tUp]: {
      position: 'absolute',
      inset: 0,
      overflow: 'hidden',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      padding: `${TEXT_PADDING}px`,
    },
  }),
  rootMiddle: css({
    [tUp]: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    },
  }),
  topleft: css({
    [tUp]: {
      placeSelf: 'start start',
    },
  }),
  topright: css({
    [tUp]: {
      gridColumn: '2',
      placeSelf: 'start end',
    },
  }),
  bottomleft: css({
    [tUp]: {
      placeSelf: 'end start',
    },
  }),
  bottomright: css({
    [tUp]: {
      gridColumn: '2',
      placeSelf: 'end end',
    },
  }),
  top: css({
    [tUp]: {
      gridColumn: '1 / -1',
      placeSelf: 'start center',
    },
  }),
  middle: css({
    [tUp]: {
      gridColumn: '1 / -1',
      placeSelf: 'center center',
    },
  }),
  bottom: css({
    [tUp]: {
      gridColumn: '1 / -1',
      placeSelf: 'end center',
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
    <div {...rootStyles} data-component='Text'>
      <div
        {...attributes}
        {...colorRule}
        {...textAlignStyle}
        {...css(position ? styles[position] : {})}
        style={{ maxWidth, margin }}
      >
        {children}
        {audioPlayButton && (
          <div style={{ marginTop: 20, position: 'relative' }}>
            {audioPlayButton}
          </div>
        )}
      </div>
    </div>
  )
}

Text.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object,
  position: PropTypes.oneOf([
    'topleft',
    'topright',
    'bottomleft',
    'bottomright',
    'top',
    'middle',
    'bottom',
  ]),
  center: PropTypes.bool,
  color: PropTypes.string,
  collapsedColor: PropTypes.string,
  maxWidth: PropTypes.string,
  margin: PropTypes.string,
  feuilleton: PropTypes.bool,
  audioPlayButton: PropTypes.node,
}

export default Text
