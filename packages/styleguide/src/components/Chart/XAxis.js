import React from 'react'
import { css } from 'glamor'
import { sansSerifRegular12 as LABEL_FONT } from '../Typography/styles'
import { useColorContext } from '../Colors/useColorContext'
import { getBaselines } from './TimeBars.utils'
import { isLastItem, subsup } from './utils'
import { ChartContext } from './ChartContext'

import { X_UNIT_PADDING, X_TICK_HEIGHT } from './Layout.constants'
import { createTextGauger } from '../../lib/textGauger'

const styles = {
  axisLabel: css(LABEL_FONT),
  axisXLine: css({
    strokeWidth: '1px',
    shapeRendering: 'crispEdges',
  }),
}

const tickGauger = createTextGauger(LABEL_FONT, {
  dimension: 'width',
  html: true,
})

const XAxis = ({ xUnit, yScaleInvert, type, lines: customLines }) => {
  const [colorScheme] = useColorContext()
  const chartContext = React.useContext(ChartContext)
  const { xAxis } = chartContext
  const baseLines =
    type === 'TimeBar' &&
    getBaselines(xAxis.domain, xAxis.scale, chartContext.innerWidth)
  const tickPosition =
    type === 'TimeBar' ? Math.round(xAxis.scale.bandwidth() / 2) : 0

  const xUnitWidth = xUnit ? tickGauger(xUnit) : 0
  let currentTextAnchor
  let currentX

  const lines =
    customLines?.map((line) => ({
      ...line,
      tick: chartContext.xNormalizer(line.tick),
    })) || xAxis.ticks.map((tick) => ({ tick }))

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
      {lines.map(({ tick, label, textAnchor }, i) => {
        const tickText = label ?? xAxis.axisFormat(tick)

        currentX = xAxis.scale(tick) + tickPosition
        currentTextAnchor = 'middle'
        if (isLastItem(xAxis.ticks, i)) {
          const tickTextWidth = Math.max(tickGauger(tickText), xUnitWidth)
          if (
            currentX + tickTextWidth / 2 >
            chartContext.innerWidth + chartContext.paddingRight
          ) {
            currentTextAnchor = 'end'
          }
        }
        if (i === 0) {
          const tickTextWidth = tickGauger(tickText)
          if (chartContext.paddingLeft + currentX - tickTextWidth / 2 < 0) {
            currentTextAnchor = 'start'
          }
        }
        if (textAnchor) {
          currentTextAnchor = textAnchor
        }
        const lineAlignmentCorrection =
          currentX === 0 ? 0.5 : currentX === chartContext.innerWidth ? -0.5 : 0

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
              {subsup.svg(tickText)}
            </text>
          </g>
        )
      })}
      {!!xAxis.ticks.length && xUnit && (
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
