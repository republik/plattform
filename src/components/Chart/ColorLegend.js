import React from 'react'
import PropTypes from 'prop-types'
import { css, merge } from 'glamor'

import { sansSerifRegular12, sansSerifMedium12 } from '../Typography/styles'
import colors from '../../theme/colors'

const styles = {
  container: css({
    marginBottom: 10
  }),
  inlineContainer: css({
    marginBottom: 0,
    lineHeight: '12px'
  }),
  title: css({
    ...sansSerifMedium12,
    color: colors.text
  }),
  label: css({
    ...sansSerifRegular12,
    color: colors.text
  }),
  labelWithColor: css({
    paddingLeft: 12,
    position: 'relative'
  }),
  inlineLabel: css({
    display: 'inline-block',
    marginRight: 12
  }),
  color: css({
    position: 'absolute',
    left: 0,
    top: 5,
    width: 8,
    height: 8
  }),
  circle: css({
    borderRadius: '50%',
  })
}

const ColorLegend = ({title, shape, values, maxWidth, inline}) => {
  if (!values.length && !title) {
    return null
  }
  return (
    <div {...merge(styles.container, inline && styles.inlineContainer)} style={{maxWidth}}>
      {!!title && <div {...styles.title}>{title}</div>}
      {
        values.map((value, i) => {
          let text = value.label

          return (
            <div key={i} {...merge(styles.label, inline && styles.inlineLabel, !!value.color && styles.labelWithColor)}>
              {!!value.color && (
                <div
                  {...merge(styles.color, styles[shape === 'square' ? 'square' : 'circle'])}
                  style={{backgroundColor: value.color}} />
              )}
              {text}{' '}
            </div>
          )
        })
      }
    </div>
  )
}

ColorLegend.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  shape: PropTypes.oneOf(['square', 'circle', 'marker']),
  values: PropTypes.arrayOf(PropTypes.shape({
    color: PropTypes.string,
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired
  })),
  maxWidth: PropTypes.number,
  inline: PropTypes.bool
}

export default ColorLegend
