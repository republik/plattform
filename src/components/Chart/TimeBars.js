import PropTypes from 'prop-types'
import React from 'react'
import { ascending } from 'd3-array'
import { scaleLinear, scaleBand } from 'd3-scale'
import { timeFormat, timeParse } from '../../lib/timeFormat'
import {
  calculateAxis,
  deduplicate,
  hasValues,
  identityFn,
  xAccessor,
  getDataFilter,
  sortPropType,
  groupInColumns,
  getColumnLayout
} from './utils'
import { getColorMapper } from './colorMaps'
import ColorLegend from './ColorLegend'
import TimeBarGroup from './TimeBarGroup'
import {
  insertXDomainGaps,
  normalizeData,
  intervals,
  getAnnotationsXValues,
  processSegments,
  getMax,
  getMin
} from './TimeBars.utils'
import XAxis from './XAxis'

const COLUMN_TITLE_HEIGHT = 24
const AXIS_BOTTOM_HEIGHT = 24
const PADDING_TOP = 24
const COLUMN_PADDING = 20
const PADDING_SIDES = 20

const TimeBarChart = props => {
  const {
    values,
    width,
    mini,
    tLabel,
    description,
    yAnnotations,
    xAnnotations,
    xScale,
    xInterval,
    xIntervalStep,
    xTicks,
    domain,
    padding,
    xUnit,
    height: innerHeight
  } = props

  let xParser = identityFn
  let xParserFormat = identityFn
  let xNormalizer = identityFn
  let xFormat = identityFn
  let xSort = (a, b) => 0
  if (xScale === 'time') {
    xParser = timeParse(props.timeParse)
    xParserFormat = timeFormat(props.timeParse)
    xNormalizer = d => xParserFormat(xParser(d))
    xFormat = timeFormat(props.timeFormat || props.timeParse)
    xSort = ascending
  } else if (xScale === 'linear') {
    xParser = x => +x
    xParserFormat = x => x.toString()
    xSort = ascending
  }

  let data = values
    .filter(getDataFilter(props.filter))
    .filter(hasValues)
    .map(normalizeData(props.x, xNormalizer))

  let groupedData = groupInColumns(data, props.column, props.columnFilter).map(
    processSegments
  )

  const columnTitleHeight = props.column ? COLUMN_TITLE_HEIGHT : 0
  const columnHeight =
    innerHeight +
    columnTitleHeight +
    (mini ? 0 : PADDING_TOP + AXIS_BOTTOM_HEIGHT)
  const { height, innerWidth, gx, gy } = getColumnLayout(
    props.columns,
    groupedData,
    width,
    props.minInnerWidth,
    () => columnHeight,
    props.columnSort,
    0,
    PADDING_SIDES,
    0,
    PADDING_SIDES,
    COLUMN_PADDING,
    true
  )

  const y = scaleLinear()
    .domain(
      props.domain ? props.domain : [getMin(groupedData), getMax(groupedData)]
    )
    .range([columnHeight - PADDING_TOP, AXIS_BOTTOM_HEIGHT + columnTitleHeight])

  if (!domain) {
    y.nice(3)
  }

  groupedData.forEach(group => {
    group.bars.forEach(bar => {
      let upValue = 0
      let upPos = y(0)
      let downValue = 0
      let downPos = y(0)
      bar.segments.forEach(segment => {
        const isPositive = segment.value > 0
        const baseValue = isPositive ? upValue : downValue
        const y0 = y(baseValue)
        const y1 = y(baseValue + segment.value)
        const size = (segment.height = Math.abs(y0 - y1))
        if (isPositive) {
          upPos -= size
          segment.y = upPos
          upValue += segment.value
        } else {
          segment.y = downPos
          downPos += size
          downValue += segment.value
        }
      })
    })
  })

  const yAxis = calculateAxis(
    props.numberFormat,
    tLabel,
    y.domain(),
    tLabel(props.unit),
    {
      ticks: props.yTicks
    }
  )

  const yTicks = (props.yTicks || yAxis.ticks).sort(ascending)

  const xValues = data
    .map(xAccessor)
    .concat(getAnnotationsXValues(xAnnotations, xNormalizer))
    .filter(deduplicate)
    .map(xParser)
    .sort(xSort)
    .map(xParserFormat)

  const x = scaleBand()
    .domain(xValues)
    .range([padding, innerWidth - padding])
    .padding(props.xBandPadding)
    .round(true)

  const xDomain = insertXDomainGaps(
    xValues,
    xInterval,
    props.x,
    props.timeParse,
    xIntervalStep,
    xParser,
    xParserFormat,
    x
  )

  x.domain(xDomain).round(true)

  const colorAccessor = d => d.datum[props.color]

  const colorValues = []
    .concat(data.map(colorAccessor))
    .concat(props.colorLegendValues)
    .filter(Boolean)
    .filter(deduplicate)

  const color = getColorMapper(props, colorValues)

  const colorLegendValues = []
    .concat(
      props.colorLegend &&
        (props.colorLegendValues || colorValues).map(colorValue => ({
          color: color(colorValue),
          label: tLabel(colorValue)
        }))
    )
    .filter(Boolean)

  const xAxis = (
    <XAxis
      xTicks={xTicks}
      width={innerWidth}
      xValues={xValues}
      xNormalizer={xNormalizer}
      x={x}
      xDomain={xDomain}
      format={x => xFormat(xParser(x))}
      xUnit={xUnit}
      strong={y.domain()[0] !== 0}
    />
  )

  return (
    <>
      <ColorLegend inline values={colorLegendValues} />
      <svg width={width} height={height}>
        <desc>{description}</desc>
        {groupedData.map(({ bars, key }) => {
          return (
            <g key={key || 1} transform={`translate(${gx(key)},${gy(key)})`}>
              <TimeBarGroup
                bars={bars}
                title={key}
                xAnnotations={xAnnotations}
                yAnnotations={yAnnotations}
                yTicks={yTicks}
                x={x}
                y={y}
                xNormalizer={xNormalizer}
                yAxis={yAxis}
                width={innerWidth}
                xAxis={xAxis}
                xAxisPos={innerHeight + PADDING_TOP + columnTitleHeight}
                tLabel={tLabel}
                color={d => color(colorAccessor(d))}
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
  padding: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  mini: PropTypes.bool,
  height: PropTypes.number.isRequired,
  color: PropTypes.string,
  colorRange: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  colorLegend: PropTypes.bool,
  colorLegendValues: PropTypes.arrayOf(PropTypes.string),
  colorRanges: PropTypes.shape({
    sequential3: PropTypes.array.isRequired,
    discrete: PropTypes.array.isRequired
  }).isRequired,
  colorMap: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  domain: PropTypes.arrayOf(PropTypes.number),
  yTicks: PropTypes.arrayOf(PropTypes.number),
  yAnnotations: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.number.isRequired,
      unit: PropTypes.string,
      label: PropTypes.string.isRequired,
      x: PropTypes.string,
      dy: PropTypes.string,
      showValue: PropTypes.bool
    })
  ).isRequired,
  timeParse: PropTypes.string.isRequired,
  timeFormat: PropTypes.string,
  xBandPadding: PropTypes.number.isRequired,
  x: PropTypes.string.isRequired,
  xInterval: PropTypes.oneOf(Object.keys(intervals)),
  xTicks: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.number, PropTypes.string])
  ),
  xScale: PropTypes.oneOf(['time', 'ordinal', 'linear']),
  xAnnotations: PropTypes.arrayOf(
    PropTypes.shape({
      valuePrefix: PropTypes.string,
      value: PropTypes.number.isRequired,
      unit: PropTypes.string,
      label: PropTypes.string,
      x: PropTypes.string,
      x1: PropTypes.string,
      x2: PropTypes.string,
      ghost: PropTypes.bool,
      position: PropTypes.oneOf(['top', 'bottom']),
      showValue: PropTypes.bool
    })
  ).isRequired,
  unit: PropTypes.string,
  xUnit: PropTypes.string,
  numberFormat: PropTypes.string.isRequired,
  filter: PropTypes.string,
  tLabel: PropTypes.func.isRequired,
  description: PropTypes.string,
  column: PropTypes.string,
  columnSort: sortPropType,
  columnFilter: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      test: PropTypes.string.isRequired
    })
  ),
  columns: PropTypes.number.isRequired,
  minInnerWidth: PropTypes.number.isRequired
}

TimeBarChart.propTypes = propTypes

TimeBarChart.defaultProps = {
  x: 'year',
  xScale: 'time',
  xBandPadding: 0.25,
  timeParse: '%Y',
  numberFormat: 's',
  height: 240,
  padding: 50,
  unit: '',
  xUnit: '',
  colorLegend: true,
  xIntervalStep: 1,
  yAnnotations: [],
  xAnnotations: [],
  columns: 1,
  minInnerWidth: 240
}

export default TimeBarChart
