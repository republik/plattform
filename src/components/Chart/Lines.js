import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { range, min, max } from 'd3-array'
import { scaleOrdinal, scalePoint, scaleTime, scaleLinear } from 'd3-scale'
import { line as lineShape, area as areaShape } from 'd3-shape'
import { timeYear } from 'd3-time'
import { useColorContext } from '../Colors/useColorContext'

import {
  sansSerifRegular12,
  sansSerifMedium12,
  sansSerifMedium14,
  sansSerifMedium22
} from '../Typography/styles'
import { timeFormat } from '../../lib/timeFormat'

import layout, {
  LABEL_FONT,
  VALUE_FONT,
  Y_CONNECTOR,
  Y_CONNECTOR_PADDING,
  Y_LABEL_HEIGHT,
  AXIS_BOTTOM_HEIGHT,
  yScales
} from './Lines.layout'

import {
  subsup,
  deduplicate,
  runSort,
  sortPropType,
  sortBy,
  getFormat
} from './utils'
import ColorLegend from './ColorLegend'

const styles = {
  columnTitle: css({
    ...sansSerifMedium14
  }),
  axisLabel: css({
    ...sansSerifRegular12
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
    ...sansSerifRegular12
  }),
  annotationValue: css({
    ...sansSerifMedium12
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
    ...sansSerifRegular12,
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

const X_TICK_HEIGHT = 4
const Y_GROUP_MARGIN = 20

const last = (array, index) => array.length - 1 === index

const LineGroup = props => {
  const {
    lines,
    mini,
    title,
    y,
    yTicks,
    yAxisFormat,
    x,
    xTicks,
    xAccessor,
    xFormat,
    xUnit,
    width,
    yCut,
    yCutHeight,
    yConnectorSize,
    yNeedsConnectors,
    yAnnotations,
    xAnnotations,
    band,
    endDy
  } = props
  const [colorScheme] = useColorContext()

  const [height] = y.range()
  const xAxisY = height + (yCut ? yCutHeight : 0)

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
      {xTicks.map((tick, i) => {
        let textAnchor = 'middle'
        if (last(xTicks, i)) {
          textAnchor = 'end'
        }
        if (i === 0) {
          textAnchor = 'start'
        }
        return (
          <g key={`x${tick}`} transform={`translate(${x(tick)},${xAxisY})`}>
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
              textAnchor={textAnchor}
            >
              {xFormat(tick)}
            </text>
          </g>
        )
      })}
      {xUnit && (
        <text
          x={width}
          y={height + AXIS_BOTTOM_HEIGHT + X_TICK_HEIGHT * 2}
          textAnchor='end'
          {...styles.axisLabel}
          {...colorScheme.set('fill', 'text')}
        >
          {xUnit}
        </text>
      )}
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
                      fill={lineColor}
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
                <path fill={lineColor} fillOpacity='0.2' d={bandArea(line)} />
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
                      fill={lineColor}
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
        <g key={`y${tick}`} transform={`translate(0,${y(tick)})`}>
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
            {yAxisFormat(tick, last(yTicks, i))}
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
            {...styles.annotationCircle}
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
            {annotation.label} {annotation.formattedValue} {annotation.unit}
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
              {...styles.annotationCircle}
              {...colorScheme.set('fill', 'textInverted')}
              {...colorScheme.set('stroke', 'text')}
            />
            {range && (
              <circle
                r='3.5'
                cx={x2}
                {...styles.annotationCircle}
                {...colorScheme.set('stroke', 'text')}
              />
            )}
            <text
              x={tx}
              textAnchor={textAnchor}
              dy={isBottom ? '2.7em' : '-1.8em'}
              {...styles.annotationText}
              {...colorScheme.set('fill', 'text')}
            >
              {annotation.label}
            </text>
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

const LineChart = props => {
  const { width, mini, description, band, bandLegend, endDy } = props

  const {
    data,
    groupedData,
    xParser,
    xAccessor,
    y,
    yAxis,
    yCut,
    yCutHeight,
    yConnectorSize,
    yNeedsConnectors,
    yAnnotations,
    xAnnotations,
    colorLegend,
    colorLegendValues,
    paddingLeft,
    paddingRight,
    columnHeight
  } = layout(props)

  const [colorScheme] = useColorContext()

  const possibleColumns = Math.floor(
    width / (props.minInnerWidth + paddingLeft + paddingRight)
  )
  let columns = props.columns
  if (possibleColumns < props.columns) {
    columns = Math.max(possibleColumns, 1)
    // decrease columns if it does not lead to new rows
    // e.g. four items, 4 desired columns, 3 possible => go with 2 columns
    if (
      Math.ceil(groupedData.length / columns) ===
      Math.ceil(groupedData.length / (columns - 1))
    ) {
      columns -= 1
    }
  }

  const columnWidth = Math.floor(width / columns) - 1
  const innerWidth = columnWidth - paddingLeft - paddingRight

  let xTicks = props.xTicks && props.xTicks.map(xParser)
  const xValues = data.map(xAccessor).concat(xTicks || [])
  let x
  let xFormat = d => d
  if (props.xScale === 'time') {
    xFormat = timeFormat(props.timeFormat)
    const xTimes = xValues.map(d => d.getTime())
    const domainTime = [min(xTimes), max(xTimes)]
    const domain = domainTime.map(d => new Date(d))
    x = scaleTime().domain(domain)

    if (!xTicks) {
      let yearInteval = Math.round(timeYear.count(domain[0], domain[1]) / 3)

      let time1 = timeYear.offset(domain[0], yearInteval).getTime()
      let time2 = timeYear.offset(domain[1], -yearInteval).getTime()

      xTicks = [
        domainTime[0],
        sortBy(xTimes, d => Math.abs(d - time1))[0],
        sortBy(xTimes, d => Math.abs(d - time2))[0],
        domainTime[1]
      ]
        .filter(deduplicate)
        .map(d => new Date(d))
    }
  } else if (props.xScale === 'linear') {
    const domain = [min(xValues), max(xValues)]
    x = scaleLinear().domain(domain)
    xTicks = xTicks || domain
    xFormat = getFormat(props.xNumberFormat || props.numberFormat, props.tLabel)
  } else {
    const domain = xValues.filter(deduplicate)
    x = scalePoint().domain(domain)
    if (!xTicks && domain.length > 5) {
      let maxIndex = domain.length - 1
      xTicks = [
        domain[0],
        domain[Math.round(maxIndex * 0.33)],
        domain[Math.round(maxIndex * 0.66)],
        domain[maxIndex]
      ].filter(deduplicate)
    } else if (!xTicks) {
      xTicks = domain
    }
  }
  if (mini) {
    xTicks = [xTicks[0], xTicks[xTicks.length - 1]]
  }
  x.range([0, innerWidth])

  let groups = groupedData.map(g => g.key)
  runSort(props.columnSort, groups)

  const rows = Math.ceil(groups.length / columns)
  const gx = scaleOrdinal()
    .domain(groups)
    .range(range(columns).map(d => d * columnWidth))
  const gy = scaleOrdinal()
    .domain(groups)
    .range(
      range(groups.length).map(d => {
        const row = Math.floor(d / columns)
        return row * columnHeight + row * Y_GROUP_MARGIN
      })
    )

  const visibleColorLegendValues = []
    .concat(props.colorLegend !== false && colorLegend && colorLegendValues)
    .concat(
      !mini &&
        band &&
        bandLegend && {
          label: (
            <span {...styles.bandLegend} {...colorScheme.set('color', 'text')}>
              <span
                {...styles.bandBar}
                {...colorScheme.set('backgroundColor', 'text')}
                {...colorScheme.set('borderTopColor', 'divider')}
                {...colorScheme.set('borderBottomColor', 'divider')}
              />
              {` ${bandLegend}`}
            </span>
          )
        }
    )
    .filter(Boolean)

  return (
    <>
      <div style={{ paddingLeft, paddingRight }}>
        <ColorLegend inline values={visibleColorLegendValues} />
      </div>
      <svg
        width={width}
        height={rows * columnHeight + (rows - 1) * Y_GROUP_MARGIN}
      >
        <desc>{description}</desc>
        {groupedData.map(({ values: lines, key }) => {
          return (
            <g
              key={key || 1}
              transform={`translate(${gx(key) + paddingLeft},${gy(key)})`}
            >
              <LineGroup
                mini={mini}
                title={key}
                lines={lines}
                x={x}
                xTicks={xTicks}
                xAccessor={xAccessor}
                xFormat={xFormat}
                xUnit={props.xUnit}
                y={y}
                yTicks={props.yTicks || yAxis.ticks}
                yAxisFormat={yAxis.axisFormat}
                band={band}
                yCut={yCut}
                yCutHeight={yCutHeight}
                yConnectorSize={yConnectorSize}
                yNeedsConnectors={yNeedsConnectors}
                yAnnotations={yAnnotations}
                xAnnotations={xAnnotations}
                endDy={endDy}
                width={innerWidth}
                paddingRight={paddingRight}
              />
            </g>
          )
        })}
      </svg>
    </>
  )
}

export const propTypes = {
  values: PropTypes.array.isRequired,
  width: PropTypes.number.isRequired,
  mini: PropTypes.bool,
  x: PropTypes.string.isRequired,
  xUnit: PropTypes.string,
  xScale: PropTypes.oneOf(['time', 'ordinal', 'linear']),
  xNumberFormat: PropTypes.string,
  xSort: sortPropType,
  xTicks: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  ),
  yScale: PropTypes.oneOf(Object.keys(yScales)),
  timeParse: PropTypes.string.isRequired,
  timeFormat: PropTypes.string.isRequired,
  column: PropTypes.string,
  columnSort: sortPropType,
  columnFilter: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      test: PropTypes.string.isRequired
    })
  ),
  highlight: PropTypes.string,
  stroke: PropTypes.string,
  labelFilter: PropTypes.string,
  color: PropTypes.string,
  colorSort: sortPropType,
  colorRange: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  colorRanges: PropTypes.shape({
    sequential3: PropTypes.array.isRequired,
    discrete: PropTypes.array.isRequired
  }).isRequired,
  colorMap: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  colorLegend: PropTypes.bool,
  colorLegendValues: PropTypes.arrayOf(PropTypes.string),
  category: PropTypes.string,
  band: PropTypes.string,
  bandLegend: PropTypes.string,
  numberFormat: PropTypes.string.isRequired,
  zero: PropTypes.bool.isRequired,
  filter: PropTypes.string,
  startValue: PropTypes.bool.isRequired,
  endLabel: PropTypes.bool.isRequired,
  endLabelWidth: PropTypes.number,
  endDy: PropTypes.string.isRequired,
  minInnerWidth: PropTypes.number.isRequired,
  columns: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  paddingTop: PropTypes.number,
  paddingRight: PropTypes.number,
  paddingLeft: PropTypes.number,
  unit: PropTypes.string,
  yNice: PropTypes.number,
  yTicks: PropTypes.arrayOf(PropTypes.number),
  yAnnotations: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.number.isRequired,
      unit: PropTypes.string,
      label: PropTypes.string,
      x: PropTypes.string,
      dy: PropTypes.string
    })
  ),
  xAnnotations: PropTypes.arrayOf(
    PropTypes.shape({
      valuePrefix: PropTypes.string,
      value: PropTypes.number.isRequired,
      unit: PropTypes.string,
      label: PropTypes.string,
      x: PropTypes.string,
      x1: PropTypes.string,
      x2: PropTypes.string,
      position: PropTypes.oneOf(['top', 'bottom'])
    })
  ),
  tLabel: PropTypes.func.isRequired,
  description: PropTypes.string
}

LineChart.propTypes = propTypes

export const Line = props => <LineChart {...props} />

Line.defaultProps = {
  x: 'year',
  xScale: 'time',
  yScale: 'linear',
  timeParse: '%Y',
  timeFormat: '%Y',
  numberFormat: '.0%',
  zero: true,
  unit: '',
  startValue: false,
  endValue: true,
  endLabel: true,
  endDy: '0.3em',
  minInnerWidth: 110,
  columns: 1,
  height: 240,
  yNice: 3
}

export const Slope = props => <LineChart {...props} />

Slope.defaultProps = {
  x: 'year',
  xScale: 'ordinal',
  yScale: 'linear',
  timeParse: '%Y',
  timeFormat: '%Y',
  numberFormat: '.0%',
  zero: true,
  unit: '',
  startValue: true,
  endValue: true,
  endLabel: false,
  endDy: '0.3em',
  minInnerWidth: 90,
  columns: 2,
  height: 240,
  yNice: 3
}

// Additional Info for Docs
// - Slope just has different default props
Slope.base = 'Line'
