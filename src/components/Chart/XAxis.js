import React from 'react'
import { css } from 'glamor'
import { sansSerifRegular12 as LABEL_FONT } from '../Typography/styles'
import { useColorContext } from '../Colors/useColorContext'
import { getBaselines } from './TimeBars.utils'
import { isLastItem } from './utils'

import { X_UNIT_PADDING, X_TICK_HEIGHT } from './Layout.constants'

const styles = {
  axisLabel: css({
    ...LABEL_FONT
  }),
  axisXLine: css({
    strokeWidth: '1px',
    shapeRendering: 'crispEdges'
  })
}

const XAxis = ({
  xTicks,
  width,
  x,
  xDomain,
  format,
  strong,
  xUnit,
  yScaleInvert,
  type
}) => {
  const [colorScheme] = useColorContext()
  const baseLines = type === 'TimeBar' && getBaselines(xDomain, x, width)
  const tickPosition = type === 'TimeBar' ? Math.round(x.bandwidth() / 2) : 0

  return (
    <g data-axis>
      {type === 'TimeBar' &&
        baseLines.map((line, i) => (
          <line
            key={i}
            x1={line.x1}
            x2={line.x2}
            {...styles.axisXLine}
            {...(strong
              ? colorScheme.set('stroke', 'text')
              : colorScheme.set('stroke', 'divider'))}
            strokeDasharray={line.gap ? '2 2' : 'none'}
          />
        ))}
      {xTicks.map((tick, i) => {
        let textAnchor = 'middle'
        if (isLastItem(xTicks, i)) {
          textAnchor = 'end'
        }
        if (i === 0) {
          textAnchor = 'start'
        }
        return (
          <g key={tick} transform={`translate(${x(tick) + tickPosition}, 0)`}>
            <line
              {...styles.axisXLine}
              {...colorScheme.set('stroke', 'text')}
              y2={yScaleInvert ? X_TICK_HEIGHT - 6 : X_TICK_HEIGHT}
            />
            <text
              {...styles.axisLabel}
              {...colorScheme.set('fill', 'text')}
              y={X_TICK_HEIGHT + 5}
              dy={yScaleInvert ? '-1.1em' : '0.6em'}
              textAnchor={type === 'TimeBar' ? 'middle' : textAnchor}
            >
              {format(tick)}
            </text>
          </g>
        )
      })}
      {xUnit && (
        <text
          x={
            type === 'TimeBar'
              ? x(xTicks[xTicks.length - 1]) + tickPosition
              : width
          }
          y={yScaleInvert ? -20 : X_UNIT_PADDING}
          textAnchor={type === 'TimeBar' ? 'middle' : 'end'}
          {...styles.axisLabel}
          {...colorScheme.set('fill', 'text')}
        >
          {xUnit}
        </text>
      )}
    </g>
  )
}

export default XAxis
