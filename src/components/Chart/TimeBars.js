import PropTypes from 'prop-types'
import React from 'react'
import { max, min, ascending } from 'd3-array'
import { scaleLinear, scaleBand } from 'd3-scale'
import { timeFormat, timeParse } from '../../lib/timeFormat'
import {
  calculateAxis,
  groupBy,
  deduplicate,
  unsafeDatumFn,
  hasValues,
  identityFn,
  xAccessor
} from './utils'
import { getColorMapper } from './colorMaps'
import ColorLegend from './ColorLegend'
import TimeBarGroup from './TimeBarGroup'
import {
  getBaselines,
  getXDomain,
  getXTicks,
  normalizeData,
  sumSegments,
  intervals,
  getAnnotationsXValues
} from './TimeBars.utils'

const AXIS_BOTTOM_HEIGHT = 24

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
    xTicks,
    xInterval,
    xIntervalStep,
    padding,
    domain
  } = props

  const paddingTop = 24

  let xParser = identityFn
  let xParserFormat = identityFn
  let xNormalizer = identityFn
  let xFormat = identityFn
  let xSort = identityFn
  if (xScale === 'time') {
    xParser = timeParse(props.timeParse)
    xParserFormat = timeFormat(props.timeParse)
    xNormalizer = d => xParserFormat(xParser(d))
    xFormat = timeFormat(props.timeFormat || props.timeParse)
    xSort = ascending
  }

  let data = values
    .filter(props.filter ? unsafeDatumFn(props.filter) : identityFn)
    .filter(hasValues)
    .map(normalizeData(props.x, xNormalizer))

  const bars = groupBy(data, xAccessor).map(({ values: segments, key: x }) => ({
    segments,
    up: segments.filter(segment => segment.value > 0).reduce(sumSegments, 0),
    down: segments.filter(segment => segment.value < 0).reduce(sumSegments, 0),
    x
  }))

  const innerHeight =
    props.height - (mini ? paddingTop + AXIS_BOTTOM_HEIGHT : 0)

  const y = scaleLinear()
    .domain(
      props.domain
        ? props.domain
        : [
            Math.min(
              0,
              min(bars, d => d.down)
            ),
            Math.max(max(bars, d => d.up))
          ]
    )
    .range([innerHeight, 0])

  if (!domain) {
    y.nice(3)
  }

  bars.forEach(group => {
    let upValue = 0
    let upPos = y(0)
    let downValue = 0
    let downPos = y(0)
    group.segments.forEach(segment => {
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
    .range([padding, width - padding])
    .padding(props.xBandPadding)
    .round(true)

  const xDomain = getXDomain(
    xValues,
    xInterval,
    props.x,
    timeParse,
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

  let groupedData = [
    {
      x: 0,
      y: paddingTop,
      bars
    }
  ]

  return (
    <>
      <ColorLegend inline values={colorLegendValues} />
      <svg width={width} height={innerHeight + paddingTop + AXIS_BOTTOM_HEIGHT}>
        <desc>{description}</desc>
        {groupedData.map(group => (
          <g
            key={`group${group.title || 1}`}
            transform={`translate(${group.x},${group.y})`}
          >
            <TimeBarGroup
              group={group}
              xAnnotations={xAnnotations}
              yAnnotations={yAnnotations}
              baseLines={getBaselines(xDomain, x, width)}
              xTicks={getXTicks(xTicks, xValues, xNormalizer, x)}
              yTicks={yTicks}
              x={x}
              y={y}
              xNormalizer={xNormalizer}
              xFormat={xFormat}
              xParser={xParser}
              yAxis={yAxis}
              width={width}
              tLabel={tLabel}
              color={d => color(colorAccessor(d))}
              innerHeight={innerHeight}
            />
          </g>
        ))}
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
  numberFormat: PropTypes.string.isRequired,
  filter: PropTypes.string,
  tLabel: PropTypes.func.isRequired,
  description: PropTypes.string,
  columns: PropTypes.number.isRequired
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
  colorLegend: true,
  xIntervalStep: 1,
  yAnnotations: [],
  xAnnotations: [],
  columns: 1
}

export default TimeBarChart
