import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'

import { line as lineShape, area as areaShape } from 'd3-shape'
import { useColorContext } from '../Colors/useColorContext'

import { subsup, isLastItem } from './utils'

import {
  Y_CONNECTOR,
  Y_CONNECTOR_PADDING,
  Y_LABEL_HEIGHT
} from './Layout.constants'

import {
  sansSerifRegular12 as LABEL_FONT,
  sansSerifMedium12 as VALUE_FONT,
  sansSerifMedium14,
  sansSerifMedium22
} from '../Typography/styles'

const styles = {
  columnTitle: css({
    ...sansSerifMedium14
  }),
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
  }),
  annotationLine: css({
    strokeWidth: '1px',
    fillRule: 'evenodd',
    strokeLinecap: 'round',
    strokeDasharray: '1,3',
    strokeLinejoin: 'round'
  }),
  annotationText: css({
    ...LABEL_FONT
  }),
  annotationValue: css({
    ...VALUE_FONT
  }),
  value: css({
    ...VALUE_FONT
  }),
  valueMini: css({
    ...sansSerifMedium22
  }),
  label: css({
    ...LABEL_FONT
  }),
  bandLegend: css({
    ...LABEL_FONT,
    whiteSpace: 'nowrap'
  }),
  bandBar: css({
    display: 'inline-block',
    width: 24,
    height: 11,
    marginBottom: -1,
    borderTopWidth: 4,
    borderBottomWidth: 4,
    borderTopStyle: 'solid',
    borderBottomStyle: 'solid'
  })
}

const LineGroup = props => {
  const {
    lines,
    mini,
    title,
    y,
    yTicks,
    yAxisFormat,
    x,
    width,
    yCut,
    yCutHeight,
    yConnectorSize,
    yNeedsConnectors,
    yAnnotations,
    xAnnotations,
    band,
    endDy,
    xAccessor,
    xAxis
  } = props
  const [colorScheme] = useColorContext()

  const [height] = y.range()

  const pathGenerator = lineShape()
    .x(d => x(xAccessor(d)))
    .y(d => y(d.value))

  const bandArea = areaShape()
    .x(d => x(xAccessor(d)))
    .y0(d => y(+d.datum[`${band}_lower`]))
    .y1(d => y(+d.datum[`${band}_upper`]))

  const linesWithLayout = lines.map(line => {
    return {
      ...line,
      startX: x(xAccessor(line.start)),
      // we always render at end label outside of the chart area
      // even if the line ends in the middle of the graph
      endX: width
    }
  })

  return (
    <g>
      <text
        dy='1.7em'
        {...styles.columnTitle}
        {...colorScheme.set('fill', 'text')}
      >
        {subsup.svg(title)}
      </text>
      {!!yCut && (
        <text
          y={height + yCutHeight / 2}
          dy='0.3em'
          {...styles.axisLabel}
          {...colorScheme.set('fill', 'text')}
        >
          {yCut}
        </text>
      )}
      <g transform={`translate(0,${height + (!!yCut && yCutHeight)})`}>
        {xAxis}
      </g>
      {linesWithLayout.map(
        (
          {
            line,
            startValue,
            endValue,
            endLabel,
            highlighted,
            stroked,
            start,
            startX,
            startY,
            startLabelY,
            end,
            endX,
            endY,
            endLabelY,
            lineColor
          },
          i
        ) => {
          return (
            <g key={`line${endLabel}${i}`}>
              {startValue && (
                <g>
                  {yNeedsConnectors && (
                    <circle
                      cx={startX - Y_CONNECTOR_PADDING - Y_CONNECTOR / 2}
                      cy={startLabelY + 0.5}
                      r={Y_CONNECTOR / 2}
                      {...colorScheme.set('fill', lineColor, 'charts')}
                    />
                  )}
                  <text
                    {...styles.value}
                    {...colorScheme.set('fill', 'text')}
                    dy='0.3em'
                    x={startX - yConnectorSize}
                    y={startLabelY}
                    textAnchor='end'
                  >
                    {startValue}
                  </text>
                </g>
              )}
              {band && line.find(d => d.datum[`${band}_lower`]) && (
                <path
                  {...colorScheme.set('fill', lineColor, 'charts')}
                  fillOpacity='0.2'
                  d={bandArea(line)}
                />
              )}
              <path
                fill='none'
                {...colorScheme.set('stroke', lineColor, 'charts')}
                strokeWidth={highlighted ? 6 : 3}
                strokeDasharray={stroked ? '6 2' : 'none'}
                d={pathGenerator(line)}
              />
              {(endValue || endLabel) && (
                <g>
                  {!mini && yNeedsConnectors && (
                    <circle
                      cx={endX + Y_CONNECTOR_PADDING + Y_CONNECTOR / 2}
                      cy={endLabelY + 0.5}
                      r={Y_CONNECTOR / 2}
                      {...colorScheme.set('fill', lineColor, 'charts')}
                    />
                  )}
                  <text
                    dy={endDy}
                    x={mini ? endX : endX + yConnectorSize}
                    y={mini ? endLabelY - Y_LABEL_HEIGHT : endLabelY}
                    {...colorScheme.set('fill', 'text')}
                    textAnchor={mini ? 'end' : 'start'}
                  >
                    <tspan {...styles[mini ? 'valueMini' : 'value']}>
                      {endValue}
                    </tspan>
                    {endLabel && (
                      <tspan
                        {...styles.label}
                        {...colorScheme.set('fill', 'text')}
                      >
                        {subsup.svg(endLabel)}
                      </tspan>
                    )}
                  </text>
                </g>
              )}
            </g>
          )
        }
      )}
      {yTicks.map((tick, i) => (
        <g data-axis key={`y${tick}`} transform={`translate(0,${y(tick)})`}>
          <line
            {...styles.axisYLine}
            x2={width}
            {...colorScheme.set('stroke', 'text')}
            style={{
              opacity: tick === 0 ? 0.8 : 0.17
            }}
          />
          <text
            {...styles.axisLabel}
            {...colorScheme.set('fill', 'text')}
            dy='-3px'
          >
            {yAxisFormat(tick, isLastItem(yTicks, i))}
          </text>
        </g>
      ))}
      {yAnnotations.map((annotation, i) => (
        <g
          key={`annotation-${i}`}
          transform={`translate(0,${y(annotation.value)})`}
        >
          <line
            x1={0}
            x2={width}
            {...styles.annotationLine}
            {...colorScheme.set('stroke', 'text')}
          />
          <circle
            r='3.5'
            cx={annotation.x ? x(annotation.x) : 4}
            {...colorScheme.set('stroke', 'text')}
            {...colorScheme.set('fill', 'textInverted')}
          />
          <text
            x={width}
            textAnchor='end'
            dy={annotation.dy || '-0.4em'}
            {...styles.annotationText}
            {...colorScheme.set('fill', 'text')}
          >
            {annotation.label}
            {annotation.showValue !== false && (
              <>
                {' '}
                {annotation.formattedValue} {annotation.unit}
              </>
            )}
          </text>
        </g>
      ))}
      {xAnnotations.map((annotation, i) => {
        const range = annotation.x1 !== undefined && annotation.x2 !== undefined

        const x1 = range ? x(annotation.x1) : x(annotation.x)
        const x2 = range && x(annotation.x2)

        const fullWidth = width + (props.paddingRight || 0)
        let textAnchor = 'middle'
        if (
          x1 + (range ? x2 - x1 : 0) / 2 + annotation.labelSize / 2 >
          fullWidth
        ) {
          textAnchor = 'end'
          if ((range ? x2 : x1) - annotation.labelSize < 0) {
            textAnchor = 'start'
          }
        }
        let tx = x1
        if (range) {
          if (textAnchor === 'end') {
            tx = x2
          }
          if (textAnchor === 'middle') {
            tx = x1 + (x2 - x1) / 2
          }
        }

        const isBottom = annotation.position === 'bottom'
        const showValue = annotation.showValue !== false

        return (
          <g
            key={`x-annotation-${i}`}
            transform={`translate(0,${y(annotation.value)})`}
          >
            {range && (
              <line
                x1={x1}
                x2={x2}
                {...styles.annotationLine}
                {...colorScheme.set('stroke', 'text')}
              />
            )}
            <circle
              r='3.5'
              cx={x1}
              {...colorScheme.set('fill', 'textInverted')}
              {...colorScheme.set('stroke', 'text')}
            />
            {range && (
              <circle
                r='3.5'
                cx={x2}
                {...colorScheme.set('fill', 'textInverted')}
                {...colorScheme.set('stroke', 'text')}
              />
            )}
            <text
              x={tx}
              textAnchor={textAnchor}
              dy={
                showValue
                  ? isBottom
                    ? '2.7em'
                    : '-1.8em'
                  : isBottom
                  ? '1.4em'
                  : '-0.5em'
              }
              {...styles.annotationText}
              {...colorScheme.set('fill', 'text')}
            >
              {annotation.label}
            </text>
            {showValue && (
              <text
                x={tx}
                textAnchor={textAnchor}
                dy={isBottom ? '1.4em' : '-0.5em'}
                {...styles.annotationValue}
                {...colorScheme.set('fill', 'text')}
              >
                {annotation.valuePrefix}
                {annotation.formattedValue} {annotation.unit}
              </text>
            )}
          </g>
        )
      })}
    </g>
  )
}

LineGroup.propTypes = {
  lines: PropTypes.arrayOf(
    PropTypes.shape({
      line: PropTypes.arrayOf(
        PropTypes.shape({
          value: PropTypes.number.isRequired
        })
      ),
      start: PropTypes.shape({ value: PropTypes.number.isRequired }),
      end: PropTypes.shape({ value: PropTypes.number.isRequired }),
      highlighted: PropTypes.bool,
      stroked: PropTypes.bool,
      lineColor: PropTypes.string.isRequired,
      startValue: PropTypes.oneOfType([PropTypes.bool, PropTypes.string])
        .isRequired,
      endValue: PropTypes.oneOfType([PropTypes.bool, PropTypes.string])
        .isRequired
    })
  ),
  mini: PropTypes.bool,
  title: PropTypes.string,
  y: PropTypes.func.isRequired,
  yCut: PropTypes.string,
  yCutHeight: PropTypes.number.isRequired,
  yTicks: PropTypes.array.isRequired,
  yAxisFormat: PropTypes.func.isRequired,
  yAnnotations: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.number.isRequired,
      label: PropTypes.string,
      x: PropTypes.date,
      dy: PropTypes.string
    })
  ),
  x: PropTypes.func.isRequired,
  xTicks: PropTypes.array.isRequired,
  xAccessor: PropTypes.func.isRequired,
  xFormat: PropTypes.func.isRequired,
  endDy: PropTypes.string.isRequired,
  width: PropTypes.number.isRequired,
  band: PropTypes.string
}

export default LineGroup
