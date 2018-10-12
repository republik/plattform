import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'

import ColorLegend from './ColorLegend'
import { scaleLinear, scaleLog, scaleOrdinal } from 'd3-scale'
import { extent, ascending } from 'd3-array'

import {
  calculateAxis,
  subsup,
  runSort,
  deduplicate,
  sortPropType,
  last,
  transparentAxisStroke
} from './utils'

import {
  sansSerifRegular12
} from '../Typography/styles'

import colors from '../../theme/colors'

const X_TICK_HEIGHT = 6

const scales = {
  linear: scaleLinear,
  log: scaleLog
}

const styles = {
  axisLabel: css({
    ...sansSerifRegular12,
    fill: colors.text
  }),
  axisLine: css({
    stroke: transparentAxisStroke,
    strokeWidth: '1px',
    shapeRendering: 'crispEdges'
  })
}

const ScatterPlot = (props) => {
  const {
    width,
    description,
    children,
    values,
    t, tLabel
  } = props

  let data = values
    .filter(d => (
      d[props.x] && d[props.x].length > 0 &&
      d[props.y] && d[props.y].length > 0
    ))
    .map(d => ({
      datum: d,
      x: +d[props.x],
      y: +d[props.y]
    }))

  let paddingTop = 15
  let paddingRight = 1
  let paddingBottom = 50
  let paddingLeft = 30

  const innerWidth = props.width - paddingLeft - paddingRight
  const height = props.height || (innerWidth + paddingTop + paddingBottom)
  const innerHeight = height - paddingTop - paddingBottom

  // setup x axis
  const xValues = data.map(d => d.x)
  const x = scales[props.xScale]()
    .domain(extent(xValues))
    .range([paddingLeft, paddingLeft + innerWidth])
  const xNice = props.xNice === undefined
    ? Math.min(Math.max(Math.round(innerWidth / 150), 3), 5)
    : props.xNice
  if (xNice) {
    x.nice(xNice)
  }
  const xAxis = calculateAxis(props.numberFormat, t, x.domain(), tLabel(props.xUnit))
  let xTicks = props.xTicks || (props.xScale === 'log' ? [
    x.invert(x.range()[0]),
    x.invert(x.range()[0] + (x.range()[1] - x.range()[0]) / 2),
    x.invert(x.range()[1])
  ] : xAxis.ticks)
  xTicks.sort(ascending)

  // setup y axis
  const yValues = data.map(d => d.y)
  const y = scales[props.yScale]()
    .domain(extent(yValues))
    .range([innerHeight + paddingTop, paddingTop])
  const yNice = props.yNice === undefined
    ? Math.min(Math.max(Math.round(innerHeight / 150), 3), 5)
    : props.yNice
  if (yNice) {
    y.nice(yNice)
  }
  const yAxis = calculateAxis(props.numberFormat, t, y.domain(), tLabel(props.yUnit))
  let yTicks = props.yTicks || (props.yScale === 'log' ? [
    y.invert(y.range()[0]),
    y.invert(y.range()[0] + (y.range()[1] - y.range()[0]) / 2),
    y.invert(y.range()[1])
  ] : yAxis.ticks)
  // ensure highest value is last
  // - the last value is labled with the unit
  yTicks.sort(ascending)

  const colorAccessor = d => d.datum[props.color]
  const colorValues = data.map(colorAccessor).filter(deduplicate).filter(Boolean)
  runSort(props.colorSort, colorValues)

  let colorRange = props.colorRanges[props.colorRange] || props.colorRange
  if (!colorRange) {
    colorRange = colorValues.length > 3
      ? props.colorRanges.discrete
      : props.colorRanges.sequential3
  }
  const color = scaleOrdinal(colorRange).domain(colorValues)

  return (
    <div>
      <svg width={width} height={height}>
        <desc>{description}</desc>
        <g transform={`translate(0 0)`}>
          {data.map((value, i) => (
            <circle key={`dot${i}`}
              style={{opacity: 0.9}}
              fill={color(colorAccessor(value))}
              cx={x(value.x)}
              cy={y(value.y)}
              r={4} />
          ))}
          {
            yTicks.map((tick, i) => (
              <g key={tick} transform={`translate(0,${y(tick)})`}>
                <line {...styles.axisLine} x2={width - paddingRight}/>
                <text {...styles.axisLabel} dy='-3px'>
                  {subsup.svg(yAxis.axisFormat(tick, last(yTicks, i)))}
                </text>
              </g>
            ))
          }
          {
            xTicks.map((tick, i) => {
              let textAnchor = 'middle'
              if (last(xTicks, i)) {
                textAnchor = 'end'
              }
              // if (i === 0) {
              //   textAnchor = 'start'
              // }
              return (
                <g key={`x${tick}`} transform={`translate(${x(tick)},${paddingTop + innerHeight + X_TICK_HEIGHT})`}>
                  <line {...styles.axisLine} y2={-(innerHeight + X_TICK_HEIGHT)} />
                  <text {...styles.axisLabel} y={5} dy='0.6em' textAnchor={textAnchor}>
                    {subsup.svg(xAxis.axisFormat(tick))}
                  </text>
                </g>
              )
            })
          }
          <text
            x={paddingLeft + innerWidth}
            y={paddingTop + innerHeight + 28 + X_TICK_HEIGHT}
            textAnchor='end'
            {...styles.axisLabel}>
            {props.xUnit}
          </text>
          <rect fill='transparent' width={innerWidth} height={innerHeight} />
        </g>
      </svg>
      <ColorLegend inline values={(
        []
          .concat(props.colorLegend && colorValues.length > 1 && colorValues.map(colorValue => ({
            color: color(colorValue),
            label: tLabel(colorValue)
          })))
          .filter(Boolean)
      )} />
      {children}
    </div>
  )
}

ScatterPlot.propTypes = {
  children: PropTypes.node,
  values: PropTypes.array.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number,
  mini: PropTypes.bool,
  x: PropTypes.string.isRequired,
  xUnit: PropTypes.string,
  xNice: PropTypes.number,
  xTicks: PropTypes.arrayOf(PropTypes.number),
  xScale: PropTypes.oneOf(Object.keys(scales)),
  y: PropTypes.string.isRequired,
  yUnit: PropTypes.string,
  yNice: PropTypes.number,
  yTicks: PropTypes.arrayOf(PropTypes.number),
  yScale: PropTypes.oneOf(Object.keys(scales)),
  numberFormat: PropTypes.string.isRequired,
  color: PropTypes.string,
  colorLegend: PropTypes.bool,
  colorRange: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  colorRanges: PropTypes.shape({
    sequential3: PropTypes.array.isRequired,
    discrete: PropTypes.array.isRequired
  }).isRequired,
  colorSort: sortPropType,
  t: PropTypes.func.isRequired,
  description: PropTypes.string
}

ScatterPlot.defaultProps = {
  x: 'value',
  y: 'value',
  xScale: 'linear',
  yScale: 'linear',
  numberFormat: 's',
  colorLegend: true
}

export default ScatterPlot
