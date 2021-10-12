import React from 'react'
import { css } from 'glamor'
import { sansSerifRegular12 as LABEL_FONT } from '../Typography/styles'
import { useColorContext } from '../Colors/useColorContext'
import { getBaselines } from './TimeBars.utils'
import { isLastItem, subsup } from './utils'

import { X_UNIT_PADDING, X_TICK_HEIGHT } from './Layout.constants'
import { createTextGauger } from '../../lib/textGauger'

const styles = {
  axisLabel: css(LABEL_FONT),
  axisXLine: css({
    strokeWidth: '1px',
    shapeRendering: 'crispEdges'
  })
}

const tickGauger = createTextGauger(LABEL_FONT, {
  dimension: 'width',
  html: true
})

const XAxis = ({
  xTicks,
  width,
  paddingRight = 0,
  paddingLeft = 0,
  x,
  xDomain,
  format,
  xUnit,
  yScaleInvert,
  type
}) => {
  const [colorScheme] = useColorContext()
  const baseLines = type === 'TimeBar' && getBaselines(xDomain, x, width)
  const tickPosition = type === 'TimeBar' ? Math.round(x.bandwidth() / 2) : 0

  const xUnitWidth = xUnit ? tickGauger(xUnit) : 0
  let currentTextAnchor
  let currentX

  return (
    <g data-axis>
      {baseLines &&
        baseLines.map((line, i) => (
          <line
            key={i}
            x1={line.x1}
            x2={line.x2}
            {...styles.axisXLine}
            {...colorScheme.set('stroke', 'divider')}
            strokeDasharray={line.gap ? '2 2' : 'none'}
          />
        ))}
      {xTicks.map((tick, i) => {
        const tickText = format(tick)

        currentX = x(tick) + tickPosition
        currentTextAnchor = 'middle'
        if (isLastItem(xTicks, i)) {
          const tickTextWidth = Math.max(tickGauger(tickText), xUnitWidth)
          if (currentX + tickTextWidth / 2 > width + paddingRight) {
            currentTextAnchor = 'end'
          }
        }
        if (i === 0) {
          const tickTextWidth = tickGauger(tickText)
          if (paddingLeft + currentX - tickTextWidth / 2 < 0) {
            currentTextAnchor = 'start'
          }
        }
        const lineAlignmentCorrection =
          currentX === 0 ? 0.5 : currentX === width ? -0.5 : 0

        return (
          <g key={tick} transform={`translate(${currentX}, 0)`}>
            <line
              x1={lineAlignmentCorrection}
              x2={lineAlignmentCorrection}
              {...styles.axisXLine}
              {...colorScheme.set('stroke', 'text')}
              y2={yScaleInvert ? X_TICK_HEIGHT - 6 : X_TICK_HEIGHT}
            />
            <text
              {...styles.axisLabel}
              {...colorScheme.set('fill', 'text')}
              y={X_TICK_HEIGHT + 5}
              dy={yScaleInvert ? '-1.1em' : '0.6em'}
              textAnchor={currentTextAnchor}
            >
              {tickText}
            </text>
          </g>
        )
      })}
      {!!xTicks.length && xUnit && (
        <text
          x={currentX}
          y={yScaleInvert ? -20 : X_UNIT_PADDING}
          textAnchor={currentTextAnchor}
          {...styles.axisLabel}
          {...colorScheme.set('fill', 'text')}
        >
          {subsup.svg(xUnit)}
        </text>
      )}
    </g>
  )
}

export default XAxis
