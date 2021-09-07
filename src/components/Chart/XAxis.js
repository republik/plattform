import React from 'react'
import { css } from 'glamor'
import { sansSerifRegular12 as LABEL_FONT } from '../Typography/styles'
import { useColorContext } from '../Colors/useColorContext'
import { getBaselines, getXTicks } from './TimeBars.utils'
import { isLastItem } from './utils'

const X_TICK_HEIGHT = 3

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
  xValues,
  xNormalizer,
  x,
  xDomain,
  format,
  strong,
  xUnit,
  yScaleInvert
}) => {
  const [colorScheme] = useColorContext()
  const baseLines = getBaselines(xDomain, x, width)
  const ticks = getXTicks(xTicks, xValues, xNormalizer, x)

  return (
    <g data-axis>
      {baseLines.map((line, i) => (
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
      {ticks.map((tick, i) => (
        <g
          key={tick}
          transform={`translate(${x(tick) + Math.round(x.bandwidth() / 2)}, 0)`}
        >
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
            textAnchor='middle'
          >
            {isLastItem(ticks, i) ? format(tick) + xUnit : format(tick)}
          </text>
        </g>
      ))}
    </g>
  )
}

export default XAxis
