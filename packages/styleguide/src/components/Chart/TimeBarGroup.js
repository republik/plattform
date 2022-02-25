import React from 'react'
import { css } from 'glamor'
import {
  sansSerifMedium14,
  sansSerifRegular12 as LABEL_FONT,
} from '../Typography/styles'
import { last } from './utils'
import { useColorContext } from '../Colors/useColorContext'
import { XAnnotation, YAnnotation } from './TimeBarsAnnotations'

const styles = {
  columnTitle: css({
    ...sansSerifMedium14,
  }),
  axisLabel: css({
    ...LABEL_FONT,
  }),
  axisYLine: css({
    strokeWidth: '1px',
    shapeRendering: 'crispEdges',
  }),
  axisXLine: css({
    strokeWidth: '1px',
    shapeRendering: 'crispEdges',
  }),
}

const TimeBarGroup = ({
  bars,
  title,
  xAnnotations,
  yAnnotations,
  yTicks,
  x,
  y,
  xNormalizer,
  yAxis,
  tLabel,
  color,
  width,
  xAxisPos,
  xAxisElement,
  yScaleInvert,
}) => {
  const [colorScheme] = useColorContext()
  const barWidth = x.bandwidth()
  const baseTick = y.domain()[0]

  return (
    <>
      {title && (
        <text
          dy='1.5em'
          {...styles.columnTitle}
          {...colorScheme.set('fill', 'text')}
        >
          {title}
        </text>
      )}
      {xAnnotations
        .filter((annotation) => annotation.ghost)
        .map((annotation, i) => (
          <rect
            key={`ghost-${i}`}
            x={x(xNormalizer(annotation.x))}
            y={y(annotation.value)}
            width={barWidth}
            height={y(0) - y(annotation.value)}
            shapeRendering='crispEdges'
            {...colorScheme.set('fill', 'divider')}
          />
        ))}
      {bars.map((bar) => {
        return (
          <g key={bar.x} transform={`translate(${x(bar.x)},0)`}>
            {bar.segments.map((segment, i) => (
              <rect
                key={i}
                y={segment.y}
                width={barWidth}
                height={segment.height}
                shapeRendering='crispEdges'
                {...colorScheme.set('fill', color(segment), 'charts')}
              />
            ))}
          </g>
        )
      })}
      <g transform={`translate(0,${xAxisPos})`}>{xAxisElement}</g>
      {yTicks.map((tick, i) => (
        <g data-axis key={tick} transform={`translate(0,${y(tick)})`}>
          {tick !== baseTick && (
            <line
              {...styles.axisYLine}
              {...colorScheme.set('stroke', 'text')}
              style={{
                opacity: tick === 0 ? 0.8 : 0.17,
              }}
              x2={width}
            />
          )}
          <text
            {...styles.axisLabel}
            {...colorScheme.set('fill', 'text')}
            dy={yScaleInvert ? '13px' : '-3px'}
          >
            {yAxis.axisFormat(tick, last(yTicks, i))}
          </text>
        </g>
      ))}
      {yAnnotations.map((annotation, i) => (
        <g
          key={`y-annotation-${i}`}
          transform={`translate(0,${y(annotation.value)})`}
        >
          <YAnnotation
            annotation={annotation}
            width={width}
            yFormat={yAxis.format}
            xCalc={(d) => x(xNormalizer(d))}
            tLabel={tLabel}
          />
        </g>
      ))}
      {xAnnotations.map((annotation, i) => (
        <g
          key={`x-annotation-${i}`}
          transform={`translate(0,${y(annotation.value)})`}
        >
          <XAnnotation
            annotation={annotation}
            width={width}
            barWidth={barWidth}
            yFormat={yAxis.format}
            xCalc={(d) => x(xNormalizer(d))}
            tLabel={tLabel}
          />
        </g>
      ))}
    </>
  )
}

export default TimeBarGroup
