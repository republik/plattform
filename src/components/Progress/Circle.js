import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import colors from '../../theme/colors'

const styles = {
  circle: css({
    transition: 'stroke-dashoffset 0.35s',
    transform: 'rotate(-90deg)',
    transformOrigin: '50% 50%'
  })
}

class Circle extends Component {
  constructor(props) {
    super(props)

    const { radius, strokeWidth } = this.props
    this.normalizedRadius = radius - strokeWidth / 2
    this.circumference = this.normalizedRadius * 2 * Math.PI
  }

  render() {
    const {
      progress,
      radius,
      stroke,
      strokeWidth,
      strokePlaceholder
    } = this.props
    const strokeDashoffset =
      this.circumference - (progress / 100) * this.circumference

    return (
      <svg height={radius * 2} width={radius * 2}>
        {strokePlaceholder && (
          <circle
            {...styles.circle}
            stroke={strokePlaceholder}
            fill='transparent'
            strokeWidth={strokeWidth}
            style={{ strokeDashoffset }}
            r={this.normalizedRadius}
            cx={radius}
            cy={radius}
          />
        )}
        <circle
          {...styles.circle}
          stroke={stroke}
          fill='transparent'
          strokeWidth={strokeWidth}
          strokeDasharray={this.circumference + ' ' + this.circumference}
          style={{ strokeDashoffset }}
          r={this.normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
    )
  }
}

Circle.propTypes = {
  progress: PropTypes.number,
  radius: PropTypes.number,
  stroke: PropTypes.string,
  strokeWidth: PropTypes.number
}

Circle.defaultProps = {
  progress: 100,
  radius: 9,
  stroke: colors.text,
  strokeWidth: 2
}

export default Circle
