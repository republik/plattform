import React from 'react'
import { css } from 'glamor'
import { useColorContext } from '../Colors/useColorContext'

const styles = {
  circle: css({
    transition: 'stroke-dashoffset 0.35s',
    transform: 'rotate(-90deg)',
    transformOrigin: '50% 50%',
  }),
}

const Circle = ({
  progress = 100,
  size = 24,
  strokeColorName,
  strokeWidth = 2,
  strokePlaceholder,
}) => {
  const circleSize = (size * 5) / 6
  const radius = circleSize / 2
  const normalizedRadius = radius - strokeWidth / 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset = circumference - (progress / 100) * circumference
  const [colorScheme] = useColorContext()
  return (
    <svg height={size} width={size}>
      {strokePlaceholder && (
        <circle
          {...styles.circle}
          {...colorScheme.set('stroke', 'divider')}
          fill='transparent'
          strokeWidth={strokeWidth}
          style={{ strokeDashoffset }}
          r={normalizedRadius}
          cx='50%'
          cy='50%'
        />
      )}
      <circle
        {...styles.circle}
        {...colorScheme.set('stroke', strokeColorName || 'text')}
        fill='transparent'
        strokeWidth={strokeWidth}
        strokeDasharray={circumference + ' ' + circumference}
        style={{ strokeDashoffset }}
        r={normalizedRadius}
        cx='50%'
        cy='50%'
      />
    </svg>
  )
}

export default Circle
