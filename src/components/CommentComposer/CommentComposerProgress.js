import React, { Component } from 'react'
import { css } from 'glamor'

const styles = {
  circle: css({
    transition: 'stroke-dashoffset 0.35s',
    transform: 'rotate(-90deg)',
    transformOrigin: '50% 50%'
  })
}


class CommentComposerProgress extends Component {
  constructor(props) {
    super(props)
    
    const { radius, strokeWidth } = this.props
    
    this.normalizedRadius = radius - strokeWidth * 2
    this.circumference = this.normalizedRadius * 2 * Math.PI
  }
  
  render() {
    const { radius, stroke, strokeWidth, progress } = this.props

    const strokeDashoffset = this.circumference - progress / 100 * this.circumference
  
    return (
      <svg
        height={ radius * 2 }
        width={ radius * 2 }
       >
        <circle
          {...styles.circle}
          stroke={stroke}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={this.circumference + ' ' + this.circumference}
          style={{strokeDashoffset}}
          r={this.normalizedRadius}
          cx={radius}
          cy={radius}
         />
      </svg>
    );
  }
}

export default CommentComposerProgress
