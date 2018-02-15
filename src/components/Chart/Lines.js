import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'

import { range, min, max } from 'd3-array'
import { scaleOrdinal, scalePoint, scaleTime } from 'd3-scale'
import { line as lineShape, area as areaShape } from 'd3-shape'
import { timeYear } from 'd3-time'
import { timeFormat } from 'd3-time-format'

import {
  sansSerifRegular12, sansSerifMedium14, sansSerifMedium22
} from '../Typography/styles'
import colors from '../../theme/colors'

import layout, {
  LABEL_FONT, VALUE_FONT,
  Y_CONNECTOR, Y_CONNECTOR_PADDING
} from './Lines.layout'

import {
  subsup,
  transparentAxisStroke,
  circleFill,
  deduplicate,
  runSort,
  sortPropType,
  sortBy
} from './utils'
import ColorLegend from './ColorLegend'

const styles = {
  columnTitle: css({
    ...sansSerifMedium14,
    fill: colors.text
  }),
  axisLabel: css({
    ...sansSerifRegular12,
    fill: colors.text
  }),
  axisYLine: css({
    stroke: transparentAxisStroke,
    strokeWidth: '1px',
    shapeRendering: 'crispEdges'
  }),
  axisXLine: css({
    stroke: colors.text,
    strokeWidth: '1px',
    shapeRendering: 'crispEdges'
  }),
  annotationCircle: css({
    stroke: colors.text,
    fill: circleFill
  }),
  annotationLine: css({
    stroke: colors.text,
    strokeWidth: '1px',
    fillRule: 'evenodd',
    strokeLinecap: 'round',
    strokeDasharray: '1,3',
    strokeLinejoin: 'round'
  }),
  annotationText: css({
    fill: colors.text,
    ...sansSerifRegular12
  }),
  value: css({
    ...VALUE_FONT,
    fill: colors.text
  }),
  valueMini: css({
    ...sansSerifMedium22
  }),
  label: css({
    ...LABEL_FONT,
    fill: colors.text
  }),
  confidenceLegend: css({
    ...sansSerifRegular12,
    color: colors.text,
    whiteSpace: 'nowrap'
  }),
  confidenceBar: css({
    display: 'inline-block',
    width: 24,
    height: 11,
    marginBottom: -1,
    backgroundColor: colors.text,
    borderTop: `4px solid ${colors.divider}`,
    borderBottom: `4px solid ${colors.divider}`
  })
}

const X_TICK_HEIGHT = 4
const Y_LABEL_HEIGHT = 12

const last = (array, index) => array.length - 1 === index

const calculateLabelY = (linesWithLayout, propery) => {
  let lastY = -Infinity
  sortBy(
    linesWithLayout.filter(line => line[`${propery}Value`]),
    line => line[`${propery}Y`]
  ).forEach(line => {
    let labelY = line[`${propery}Y`]
    let nextY = lastY + Y_LABEL_HEIGHT
    if (nextY > labelY) {
      labelY = nextY
    }
    line[`${propery}LabelY`] = lastY = labelY
  })
}

const LineGroup = (props) => {
  const {
    lines, mini, title,
    y, yTicks, yAxisFormat,
    x, xTicks, xAccessor, xFormat,
    width, yCut, yCutHeight,
    yAnnotations,
    confidence,
    endDy
  } = props

  const [height] = y.range()
  const xAxisY = height + (yCut ? yCutHeight : 0)

  const pathGenerator = lineShape()
    .x(d => x(xAccessor(d)))
    .y(d => y(d.value))

  const confidenceArea = areaShape()
    .x(d => x(xAccessor(d)))
    .y0(d => y(d.datum[`confidence${confidence}_lower`]))
    .y1(d => y(d.datum[`confidence${confidence}_upper`]))

  const linesWithLayout = lines.map(line => {
    return {
      ...line,
      startX: x(xAccessor(line.start)),
      // we always render at end label outside of the chart area
      // even if the line end in the middle of the graph
      endX: width,
      startY: y(line.start.value),
      endY: y(line.end.value),
    }
  })

  calculateLabelY(linesWithLayout, 'start')
  calculateLabelY(linesWithLayout, 'end')

  return (
    <g>
      <text dy='1.7em' {...styles.columnTitle}>{subsup.svg(title)}</text>
      {
        !!yCut && <text y={height + (yCutHeight / 2)} dy='0.3em' {...styles.axisLabel}>{yCut}</text>
      }
      {
        xTicks.map((tick, i) => {
          let textAnchor = 'middle'
          if (last(xTicks, i)) {
            textAnchor = 'end'
          }
          if (i === 0) {
            textAnchor = 'start'
          }
          return (
            <g key={tick} transform={`translate(${x(tick)},${xAxisY})`}>
              <line {...styles.axisXLine} y2={X_TICK_HEIGHT} />
              <text {...styles.axisLabel} y={X_TICK_HEIGHT + 5} dy='0.6em' textAnchor={textAnchor}>
                {xFormat(tick)}
              </text>
            </g>
          )
        })
      }
      {
        linesWithLayout.map(({line, startValue, endValue, endLabel, highlighted, stroked, start, startX, startY, startLabelY, end, endX, endY, endLabelY, lineColor}, i) => {
          return (
            <g key={i}>
              {startValue && (startValue !== endValue) && (
                <g>
                  <line
                    x1={startX - Y_CONNECTOR_PADDING}
                    x2={startX - Y_CONNECTOR - Y_CONNECTOR_PADDING}
                    y1={startLabelY}
                    y2={startLabelY}
                    stroke={lineColor}
                    strokeWidth={3} />
                  <text
                    {...styles.value}
                    dy='0.3em'
                    x={startX - Y_CONNECTOR - Y_CONNECTOR_PADDING * 2}
                    y={startLabelY}
                    textAnchor='end'>{startValue}</text>
                </g>
              )}
              {confidence && <path
                fill={lineColor}
                fillOpacity='0.2'
                d={confidenceArea(line)} />}
              <path
                fill='none'
                stroke={lineColor}
                strokeWidth={highlighted ? 6 : 3}
                strokeDasharray={stroked ? '6 2' : 'none'}
                d={pathGenerator(line)} />
              {endValue && (
                <g>
                  {!mini && <line
                    x1={endX + Y_CONNECTOR_PADDING}
                    x2={endX + Y_CONNECTOR + Y_CONNECTOR_PADDING}
                    y1={endLabelY}
                    y2={endLabelY}
                    stroke={lineColor}
                    strokeWidth={3} />}
                  <text
                    dy={endDy}
                    x={mini ? endX : endX + Y_CONNECTOR + Y_CONNECTOR_PADDING * 2}
                    y={mini ? endLabelY - Y_LABEL_HEIGHT : endLabelY}
                    fill={colors.text}
                    textAnchor={mini ? 'end' : 'start'}>
                    <tspan {...styles[mini ? 'valueMini' : 'value']}>{endValue}</tspan>
                    {endLabel && <tspan {...styles.label}>{subsup.svg(endLabel)}</tspan>}
                  </text>
                </g>
              )}
            </g>
          )
        })
      }
      {
        yTicks.map((tick, i) => (
          <g key={tick} transform={`translate(0,${y(tick)})`}>
            <line {...styles.axisYLine} x2={width} style={{
              stroke: tick === 0 ? colors.divider : undefined
            }} />
            <text {...styles.axisLabel} dy='-3px'>
              {yAxisFormat(tick, last(yTicks, i))}
            </text>
          </g>
        ))
      }
      {
        yAnnotations.map((annotation, i) => (
          <g key={`annotation-${i}`} transform={`translate(0,${y(annotation.value)})`}>
            <line x1={0} x2={width} {...styles.annotationLine} />
            <circle r='3.5' cx={annotation.x ? x(annotation.x) : 4} {...styles.annotationCircle} />
            <text x={width} textAnchor='end' dy={annotation.dy || '-0.4em'} {...styles.annotationText}>{annotation.label} {annotation.formattedValue}</text>
          </g>
        ))
      }
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
      start: PropTypes.shape({value: PropTypes.number.isRequired}),
      end: PropTypes.shape({value: PropTypes.number.isRequired}),
      highlighted: PropTypes.bool,
      stroked: PropTypes.bool,
      lineColor: PropTypes.string.isRequired,
      startValue: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]).isRequired,
      endValue: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]).isRequired
    })
  ),
  mini: PropTypes.bool,
  title: PropTypes.string,
  y: PropTypes.func.isRequired,
  yCut: PropTypes.string,
  yCutHeight: PropTypes.number.isRequired,
  yTicks: PropTypes.array.isRequired,
  yAxisFormat: PropTypes.func.isRequired,
  yAnnotations: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.number.isRequired,
    label: PropTypes.string.isRequired
  })),
  x: PropTypes.func.isRequired,
  xTicks: PropTypes.array.isRequired,
  xAccessor: PropTypes.func.isRequired,
  xFormat: PropTypes.func.isRequired,
  endDy: PropTypes.string.isRequired,
  width: PropTypes.number.isRequired,
  confidence: PropTypes.oneOf([95])
}

const LineChart = (props) => {
  const {
    width, mini,
    children,
    t, description,
    confidence,
    endDy
  } = props

  const {
    data,
    groupedData,
    xParser,
    xAccessor,
    y,
    yAxis,
    yCut,
    yCutHeight,
    yAnnotations,
    colorLegend,
    colorLegendValues,
    paddingLeft,
    paddingRight,
    columnHeight
  } = layout(props)

  const possibleColumns = Math.floor(width / (props.minInnerWidth + paddingLeft + paddingRight))
  const columns = possibleColumns >= props.columns ? props.columns : Math.max(possibleColumns, 1)

  const columnWidth = Math.floor(width / columns) - 1
  const innerWidth = columnWidth - paddingLeft - paddingRight

  const xValues = data.map(xAccessor)
  let x
  let xTicks
  let xFormat = d => d
  if (props.xScale === 'time') {
    xFormat = timeFormat(props.timeFormat)
    const xTimes = xValues.map(d => d.getTime())
    const domainTime = [min(xTimes), max(xTimes)]
    const domain = domainTime.map(d => new Date(d))
    let yearInteval = Math.round(timeYear.count(domain[0], domain[1]) / 3)

    let time1 = timeYear.offset(domain[0], yearInteval).getTime()
    let time2 = timeYear.offset(domain[1], -yearInteval).getTime()

    x = scaleTime().domain(domain)
    xTicks = [
      domainTime[0],
      sortBy(xTimes, d => Math.abs(d - time1))[0],
      sortBy(xTimes, d => Math.abs(d - time2))[0],
      domainTime[1]
    ].filter(deduplicate).map(d => new Date(d))
  } else {
    let domain = xValues.filter(deduplicate)
    x = scalePoint().domain(domain)
    xTicks = domain
    if (domain.length > 5) {
      let maxIndex = domain.length - 1
      xTicks = [
        domain[0],
        domain[Math.round(maxIndex * 0.33)],
        domain[Math.round(maxIndex * 0.66)],
        domain[maxIndex]
      ].filter(deduplicate)
    } else {
      xTicks = domain
    }
  }
  if (mini) {
    xTicks = [xTicks[0], xTicks[xTicks.length - 1]]
  }
  if (props.xTicks) {
    xTicks = props.xTicks.map(xParser)
  }
  x.range([0, innerWidth])

  let groups = groupedData.map(g => g.key)
  runSort(props.columnSort, groups)

  const gx = scaleOrdinal().domain(groups).range(range(columns).map(d => d * columnWidth))
  const gy = scaleOrdinal().domain(groups).range(range(groups.length).map(d => Math.floor(d / columns) * columnHeight))
  const rows = Math.ceil(groups.length / columns)

  return (
    <div>
      <svg width={width} height={rows * columnHeight}>
        <desc>{description}</desc>
        {
          groupedData.map(({values: lines, key}) => {
            return (
              <g key={key || 1} transform={`translate(${gx(key) + paddingLeft},${gy(key)})`}>
                <LineGroup
                  mini={mini}
                  title={key}
                  lines={lines}
                  x={x}
                  xTicks={xTicks}
                  xAccessor={xAccessor}
                  xFormat={xFormat}
                  y={y}
                  yTicks={yAxis.ticks}
                  yAxisFormat={yAxis.axisFormat}
                  confidence={confidence}
                  yCut={yCut}
                  yCutHeight={yCutHeight}
                  yAnnotations={yAnnotations}
                  endDy={endDy}
                  width={innerWidth} />
              </g>
            )
          })
        }
      </svg>
      <div>
        <div style={{paddingLeft, paddingRight}}>
          <ColorLegend inline values={(
            []
              .concat(props.colorLegend && colorLegend && colorLegendValues)
              .concat(!mini && confidence && {label: (
                <span {...styles.confidenceLegend}>
                  <span {...styles.confidenceBar} />
                  {` ${t(`styleguide/charts/confidence${confidence}-legend`)}`}
                </span>
              )})
              .filter(Boolean)
          )}/>
        </div>
        {children}
      </div>
    </div>
  )
}

LineChart.propTypes = {
  children: PropTypes.node,
  values: PropTypes.array.isRequired,
  width: PropTypes.number.isRequired,
  mini: PropTypes.bool,
  x: PropTypes.string.isRequired,
  xScale: PropTypes.oneOf(['time', 'ordinal']),
  xSort: sortPropType,
  xTicks: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
  timeParse: PropTypes.string.isRequired,
  timeFormat: PropTypes.string.isRequired,
  column: PropTypes.string,
  columnSort: sortPropType,
  columnFilter: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    test: PropTypes.string.isRequired
  })),
  highlight: PropTypes.string,
  stroke: PropTypes.string,
  labelFilter: PropTypes.string,
  color: PropTypes.string,
  colorRange: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  colorRanges: PropTypes.shape({
    sequential3: PropTypes.array.isRequired,
    discrete: PropTypes.array.isRequired
  }).isRequired,
  colorLegend: PropTypes.bool,
  category: PropTypes.string,
  confidence: PropTypes.oneOf([95]),
  numberFormat: PropTypes.string.isRequired,
  zero: PropTypes.bool.isRequired,
  filter: PropTypes.string,
  startValue: PropTypes.bool.isRequired,
  endLabel: PropTypes.bool.isRequired,
  endDy: PropTypes.string.isRequired,
  minInnerWidth: PropTypes.number.isRequired,
  columns: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  unit: PropTypes.string,
  yAnnotations: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.number.isRequired,
    label: PropTypes.string.isRequired,
    x: PropTypes.string,
    dy: PropTypes.string
  })),
  t: PropTypes.func.isRequired,
  description: PropTypes.string
}

export const Line = props => <LineChart {...props} />

Line.defaultProps = {
  x: 'year',
  xScale: 'time',
  timeParse: '%Y',
  timeFormat: '%Y',
  numberFormat: '.0%',
  zero: true,
  unit: '',
  startValue: false,
  endLabel: true,
  endDy: '0.3em',
  minInnerWidth: 110,
  columns: 1,
  height: 240,
  colorLegend: true
}

export const Slope = props => <LineChart {...props} />

Slope.defaultProps = {
  x: 'year',
  xScale: 'ordinal',
  timeParse: '%Y',
  timeFormat: '%Y',
  numberFormat: '.0%',
  zero: true,
  unit: '',
  startValue: true,
  endLabel: false,
  endDy: '0.3em',
  minInnerWidth: 90,
  columns: 2,
  height: 240,
  colorLegend: true
}
