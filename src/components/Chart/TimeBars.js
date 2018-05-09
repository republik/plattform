import PropTypes from 'prop-types'
import React from 'react'
import { css } from 'glamor'
import { timeParse, timeFormat } from 'd3-time-format'

import { max, min, ascending } from 'd3-array'
import { scaleLinear, scaleOrdinal, scaleBand } from 'd3-scale'
import * as d3Intervals from 'd3-time'

import { sansSerifRegular12, sansSerifMedium12 } from '../Typography/styles'
import colors from '../../theme/colors'

import {
  calculateAxis,
  groupBy,
  deduplicate,
  transparentAxisStroke,
  circleFill,
  unsafeDatumFn
} from './utils'

import ColorLegend from './ColorLegend'

const intervals = Object.keys(d3Intervals)
  .filter(key => key.match(/^time/) && key !== 'timeInterval')
  .reduce(
    (all, key) => {
      all[key.replace(/^time/, '').toLowerCase()] = d3Intervals[key]
      return all
    },
    {}
  )

const last = (array, index) => array.length - 1 === index

const X_TICK_HEIGHT = 3
const AXIS_BOTTOM_HEIGHT = 24

const styles = {
  axisLabel: css({
    ...sansSerifRegular12,
    fill: colors.lightText
  }),
  axisYLine: css({
    stroke: transparentAxisStroke,
    strokeWidth: '1px',
    shapeRendering: 'crispEdges'
  }),
  axisXLine: css({
    stroke: colors.divider,
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
  annotationLineValue: css({
    stroke: colors.text,
    strokeWidth: '1px',
    shapeRendering: 'crispEdges'
  }),
  annotationValue: css({
    fill: colors.text,
    ...sansSerifMedium12
  }),
  annotationText: css({
    fill: colors.text,
    ...sansSerifRegular12
  })
}

const TimeBarChart = (props) => {
  const {
    values,
    width,
    mini,
    children,
    t,
    tLabel,
    description,
    yAnnotations,
    xAnnotations
  } = props

  const paddingTop = 24

  let data = values
  if (props.filter) {
    const filter = unsafeDatumFn(props.filter)
    data = data.filter(filter)
  }
  const xParser = timeParse(props.timeParse)
  const xParserFormat = timeFormat(props.timeParse)
  const xNormalizer = d => xParserFormat(xParser(d))
  data = data.filter(d => d.value && d.value.length > 0).map(d => {
    return {
      datum: d,
      x: xNormalizer(d[props.x]),
      value: +d.value
    }
  })

  const colorAccessor = d => d.datum[props.color]
  const colorValues = data.map(colorAccessor)
    .filter(Boolean)
    .filter(deduplicate)

  let colorRange = props.colorRanges[props.colorRange] || props.colorRange
  if (!colorRange) {
    colorRange = colorValues.length > 3
      ? props.colorRanges.discrete
      : props.colorRanges.sequential3
  }
  const color = scaleOrdinal(colorRange).domain(colorValues)

  const bars = groupBy(data, d => d.x).map(({values: segments, key: x}) => ({
    segments,
    up: segments.filter(segment => segment.value > 0).reduce(
      (sum, segment) => sum + segment.value,
      0
    ),
    down: segments.filter(segment => segment.value < 0).reduce(
      (sum, segment) => sum + segment.value,
      0
    ),
    x
  }))

  const innerHeight = props.height - (mini ? paddingTop + AXIS_BOTTOM_HEIGHT : 0)
  const y = scaleLinear()
    .domain(props.domain ? props.domain : [
      Math.min(0, min(bars, d => d.down)),
      max(bars, d => d.up)
    ])
    .range([innerHeight, 0])

  if (!props.domain) {
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
      const size = segment.height = Math.abs(y0 - y1)
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

  const yAxis = calculateAxis(props.numberFormat, t, y.domain(), tLabel(props.unit))
  const yTicks = props.yTicks || yAxis.ticks
  // ensure highest value is last
  // - the last value is labled with the unit
  yTicks.sort(ascending)

  const xValues = data
    .map(d => d.x)
    .concat(
      xAnnotations
        .reduce(
          (years, annotation) => years.concat(
            annotation.x, annotation.x1, annotation.x2
          ),
          []
        )
        .filter(Boolean)
        .map(d => xNormalizer(d)) // ensure format
    )
    .filter(deduplicate)
    .map(xParser)
    .sort(ascending)
    .map(xParserFormat)

  const xPadding = props.padding
  const x = scaleBand()
    .domain(xValues)
    .range([xPadding, width - xPadding])
    .padding(props.xBandPadding)
    .round(true)

  let xDomain = xValues
  const interval = intervals[props.xInterval] || (
    props.x === 'year' &&
    props.timeParse === '%Y' &&
    intervals.year
  )
  if (interval) {
    const gapsNeeded = Math.max(
      Math.ceil(
        // at least 26 px
        26 / Math.max(x.bandwidth(), 1)
      ),
      2 // at least 2 bars
    )
    xDomain = xValues.reduce(
      (values, value, index, all) => {
        values.push(value)
        const next = interval.offset(xParser(value), 1)
        if (
          all.indexOf(xParserFormat(next)) === -1 &&
          index !== all.length - 1
        ) {
          for (let i = 0; i < gapsNeeded; i++) {
            values.push(`GAP|${value}|${i}`)
          }
        }
        return values
      },
      []
    )

    x.domain(xDomain).round(true)
  }

  const barWidth = x.bandwidth()
  const barStep = x.step()
  const barPadding = barStep - barWidth

  let xTicks
  if (props.xTicks) {
    xTicks = props.xTicks.map(xNormalizer)
  } else {
    // 12px a average number width
    if (barStep >= xValues[0].length * 12) {
      xTicks = xValues
    } else {
      xTicks = [
        xValues[0],
        xValues[xValues.length - 1]
      ].filter(deduplicate)
    }
  }

  const xDomainLast = xDomain[xDomain.length - 1]
  const baseTick = y.domain()[0]
  const baseLines = xDomain.reduce(
    (lines, xValue) => {
      let previousLine = lines[lines.length - 1]
      let x1 = previousLine ? previousLine.x2 : 0
      let x2 = xValue === xDomainLast ? width : x(xValue) + barStep
      const gap = xValue.split('|')[0] === 'GAP'
      if (gap) {
        x2 -= barPadding
      }

      if (previousLine && previousLine.gap === gap) {
        previousLine.x2 = x2
      } else {
        lines.push({
          x1,
          x2,
          gap
        })
      }
      return lines
    },
    []
  )

  const xFormat = timeFormat(props.timeFormat || props.timeParse)

  return (
    <div>
      <svg width={width} height={innerHeight + paddingTop + AXIS_BOTTOM_HEIGHT}>
        <desc>{description}</desc>
        <g transform={`translate(0,${paddingTop})`}>
          <g transform={`translate(0,${innerHeight + 1})`}>
            {
              baseLines.map((line, i) => {
                return <line key={i} x1={line.x1} x2={line.x2} {...styles.axisXLine} strokeDasharray={line.gap ? '2 2' : 'none'} />
              })
            }
            {
              xTicks.map(tick => {
                return (
                  <g key={tick} transform={`translate(${x(tick) + Math.round(barWidth / 2)},0)`}>
                    <line {...styles.axisXLine} y2={X_TICK_HEIGHT} />
                    <text {...styles.axisLabel} y={X_TICK_HEIGHT + 5} dy='0.6em' textAnchor='middle'>
                      {xFormat(xParser(tick))}
                    </text>
                  </g>
                )
              })
            }
          </g>
          {
            xAnnotations.filter(annotation => annotation.ghost).map((annotation, i) => (
              <rect key={`ghost-${i}`}
                x={x(xNormalizer(annotation.x))}
                y={y(annotation.value)}
                width={barWidth}
                height={y(0) - y(annotation.value)}
                shapeRendering='crispEdges'
                fill={colors.divider} />
            ))
          }
          {
            bars.map(bar => {
              return (
                <g key={bar.x} transform={`translate(${x(bar.x)},0)`}>
                  {
                    bar.segments.map((segment, i) => (
                      <rect key={i}
                        y={segment.y}
                        width={barWidth}
                        height={segment.height}
                        shapeRendering='crispEdges'
                        fill={color(colorAccessor(segment))} />
                    ))
                  }
                </g>
              )
            })
          }
          {
            yTicks.map((tick, i) => (
              <g key={tick} transform={`translate(0,${y(tick)})`}>
                {tick !== baseTick && <line {...styles.axisYLine} x2={width}/>}
                <text {...styles.axisLabel} dy='-3px'>
                  {yAxis.axisFormat(tick, last(yTicks, i))}
                </text>
              </g>
            ))
          }
          {
            yAnnotations.map((annotation, i) => (
              <g key={`y-annotation-${i}`} transform={`translate(0,${y(annotation.value)})`}>
                <line x1={0} x2={width} {...styles.annotationLine} />
                <circle r='3.5' cx={annotation.x ? x(xNormalizer(annotation.x)) : 4} {...styles.annotationCircle} />
                <text x={width} textAnchor='end' dy={annotation.dy || '-0.4em'} {...styles.annotationText}>{tLabel(annotation.label)} {yAxis.format(annotation.value)}</text>
              </g>
            ))
          }
          {
            xAnnotations.map((annotation, i) => {
              const range = annotation.x1 !== undefined && annotation.x2 !== undefined
              const x1 = range
                ? x(xNormalizer(annotation.x1))
                : x(xNormalizer(annotation.x))
              const x2 = range
                ? x(xNormalizer(annotation.x2)) + barWidth
                : x1 + Math.max(barWidth, 8)
              const compact = width < 500
              let tx = x1
              if (compact) {
                tx -= range ? 0 : barWidth * 2
              } else {
                tx += (x2 - x1) / 2
              }
              const textAnchor = compact ? 'start' : 'middle'
              return (
                <g key={`x-annotation-${i}`} transform={`translate(0,${y(annotation.value)})`}>
                  <line x1={x1} x2={x2} {...(range ? styles.annotationLine : styles.annotationLineValue)} />
                  <circle r='3.5' cx={x1} {...styles.annotationCircle} />
                  {range && <circle r='3.5' cx={x2} {...styles.annotationCircle} />}
                  <text x={tx} textAnchor={textAnchor} dy='-1.8em' {...styles.annotationText}>
                    {tLabel(annotation.label)}
                  </text>
                  <text x={tx} textAnchor={textAnchor} dy='-0.5em' {...styles.annotationValue}>
                    {tLabel(annotation.valuePrefix)}{yAxis.format(annotation.value)}
                  </text>
                </g>
              )
            })
          }
        </g>
      </svg>
      <div>
        {!mini && <ColorLegend inline values={(
          []
            .concat(props.colorLegend && colorValues.length > 0 && colorValues.map(colorValue => (
              {color: color(colorValue), label: tLabel(colorValue)}
            )))
            .filter(Boolean)
        )}/>}
        {children}
      </div>
    </div>
  )
}

TimeBarChart.propTypes = {
  children: PropTypes.node,
  values: PropTypes.array.isRequired,
  padding: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  mini: PropTypes.bool,
  height: PropTypes.number.isRequired,
  color: PropTypes.string,
  colorRange: PropTypes.array,
  colorLegend: PropTypes.bool,
  colorRanges: PropTypes.shape({
    sequential3: PropTypes.array.isRequired,
    discrete: PropTypes.array.isRequired
  }).isRequired,
  domain: PropTypes.arrayOf(PropTypes.number),
  yTicks: PropTypes.arrayOf(PropTypes.number),
  yAnnotations: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.number.isRequired,
    label: PropTypes.string.isRequired,
    x: PropTypes.string,
    dy: PropTypes.string
  })).isRequired,
  timeParse: PropTypes.string.isRequired,
  timeFormat: PropTypes.string,
  xBandPadding: PropTypes.number.isRequired,
  x: PropTypes.string.isRequired,
  xInterval: PropTypes.oneOf(Object.keys(intervals)),
  xTicks: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number, PropTypes.string])),
  xAnnotations: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.number.isRequired,
    label: PropTypes.string,
    x: PropTypes.string
  })).isRequired,
  unit: PropTypes.string,
  numberFormat: PropTypes.string.isRequired,
  filter: PropTypes.string,
  t: PropTypes.func.isRequired,
  tLabel: PropTypes.func.isRequired,
  description: PropTypes.string
}

TimeBarChart.defaultProps = {
  x: 'year',
  xBandPadding: 0.25,
  timeParse: '%Y',
  numberFormat: 's',
  height: 240,
  padding: 50,
  unit: '',
  colorLegend: true,
  yAnnotations: [],
  xAnnotations: []
}

export default TimeBarChart
