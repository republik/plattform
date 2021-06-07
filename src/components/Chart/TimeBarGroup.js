import React from 'react'
import { css } from 'glamor'
import { sansSerifRegular12 as LABEL_FONT } from '../Typography/styles'
import { last } from './utils'
import { useColorContext } from '../Colors/useColorContext'
import { XAnnotation, YAnnotation } from './TimeBarsAnnotations'

const X_TICK_HEIGHT = 3

const styles = {
  axisLabel: css({
    ...LABEL_FONT
  }),
  axisYLine: css({
    strokeWidth: '1px',
    shapeRendering: 'crispEdges'
  }),
  axisXLine: css({
    strokeWidth: '1px',
    shapeRendering: 'crispEdges'
  })
}

const TimeBarGroup = ({
  group,
  xAnnotations,
  yAnnotations,
  baseLines,
  xTicks,
  yTicks,
  x,
  y,
  xNormalizer,
  xFormat,
  xParser,
  yAxis,
  width,
  tLabel,
  innerHeight,
  color
}) => {
  const [colorScheme] = useColorContext()
  const barWidth = x.bandwidth()
  const baseTick = y.domain()[0]

  return (
    <>
      <text
        dy='1.5em'
        {...styles.groupTitle}
        {...colorScheme.set('fill', 'text')}
      >
        {group.title}
      </text>
      {xAnnotations
        .filter(annotation => annotation.ghost)
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
      {group.bars.map(bar => {
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
      <g transform={`translate(0,${innerHeight})`}>
        {baseLines.map((line, i) => {
          return (
            <line
              key={i}
              x1={line.x1}
              x2={line.x2}
              {...styles.axisXLine}
              {...(baseTick !== 0
                ? colorScheme.set('stroke', 'text')
                : colorScheme.set('stroke', 'divider'))}
              strokeDasharray={line.gap ? '2 2' : 'none'}
            />
          )
        })}
        {xTicks.map(tick => (
          <g
            key={tick}
            transform={`translate(${x(tick) + Math.round(barWidth / 2)},0)`}
          >
            <line
              {...styles.axisXLine}
              {...colorScheme.set('stroke', 'text')}
              y2={X_TICK_HEIGHT}
            />
            <text
              {...styles.axisLabel}
              {...colorScheme.set('fill', 'text')}
              y={X_TICK_HEIGHT + 5}
              dy='0.6em'
              textAnchor='middle'
            >
              {xFormat(xParser(tick))}
            </text>
          </g>
        ))}
      </g>
      {yTicks.map((tick, i) => (
        <g key={tick} transform={`translate(0,${y(tick)})`}>
          {tick !== baseTick && (
            <line
              {...styles.axisYLine}
              {...colorScheme.set('stroke', 'text')}
              style={{
                opacity: tick === 0 ? 0.8 : 0.17
              }}
              x2={width}
            />
          )}
          <text
            {...styles.axisLabel}
            {...colorScheme.set('fill', 'text')}
            dy='-3px'
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
            xCalc={d => x(xNormalizer(d))}
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
            xCalc={d => x(xNormalizer(d))}
            tLabel={tLabel}
          />
        </g>
      ))}
    </>
  )
}

export default TimeBarGroup
