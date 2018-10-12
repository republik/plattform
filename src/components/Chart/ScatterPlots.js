import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'

import ColorLegend from './ColorLegend'
import { scaleLinear, scaleLog, scaleOrdinal, scaleSqrt } from 'd3-scale'
import { extent, ascending, min } from 'd3-array'

import ContextBox, { ContextBoxValue } from './ContextBox'

import {
  calculateAxis,
  subsup,
  runSort,
  deduplicate,
  sortPropType,
  last,
  transparentAxisStroke,
  get3EqSpaTicks,
  baseLineColor
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

class ScatterPlot extends Component {
  constructor (...args) {
    super(...args)
    this.state = {
      hover: []
    }

  }
  setContainerRef = ref => {
    this.container = ref
  }
  setHoverRectRef = ref => {
    this.hoverRect = ref
  }
  measure = () => {
    const { left, top } = this.container.getBoundingClientRect()
    if (this.state.left !== left || this.state.top !== top) {
      this.setState({ left, top })
    }
  }
  componentDidMount () {
    window.addEventListener('resize', this.measure)
    this.hoverRect.addEventListener('touchstart', this.focus, { passive: false })
    this.hoverRect.addEventListener('touchmove', this.focus)
    this.hoverRect.addEventListener('touchend', this.blur)
    this.measure()
  }
  componentDidUpdate () {
    this.measure()
  }
  componentWillUnmount () {
    this.hoverRect.removeEventListener('touchstart', this.focus)
    this.hoverRect.removeEventListener('touchmove', this.focus)
    this.hoverRect.removeEventListener('touchend', this.blur)
    window.removeEventListener('resize', this.measure)
  }
  focus = (event) => {
    const { top, left } = this.state
    if (top === undefined || left === undefined || !this.symbols) {
      return
    }

    let hoverTouch = false
    let currentEvent = event
    if (currentEvent.nativeEvent) {
      currentEvent = event.nativeEvent
    }
    while (currentEvent.sourceEvent) {
      currentEvent = currentEvent.sourceEvent
    }
    if (currentEvent.changedTouches) {
      hoverTouch = true
      currentEvent = currentEvent.changedTouches[0]
    }

    const focusX = currentEvent.clientX - left
    const focusY = currentEvent.clientY - top

    const withDistance = this.symbols.map(symbol => {
      return {
        symbol,
        distance: Math.sqrt(
          Math.pow(symbol.cx - focusX, 2) +
          Math.pow(symbol.cy - focusY, 2)
        ) - symbol.r
      }
    })

    let hover = withDistance.filter(({ distance }) => distance < 1)
    if (hover.length === 0) {
      const minDistance = min(withDistance, d => d.distance)
      if (minDistance < 10) {
        hover = withDistance.filter(({ distance }) => distance === minDistance)
      }
    }
    if (hover.length) {
      event.preventDefault()
    }
    hover = hover.map(({ symbol }) => symbol)

    this.setState({ hover, hoverTouch })
  }
  blur = () => {
    this.setState({ hover: [] })
  }
  renderHover ({ width, height, xFormat, yFormat }) {
    const { hover, hoverTouch } = this.state

    if (!hover.length) {
      return null
    }

    const { props } = this

    const { cx, cy, r } = hover.sort((a, b) => ascending(a.cy, b.cy))[0]
    const top = cy > height / 3
    const yOffset = r + (hoverTouch ? 40 : 12)
    return (
      <ContextBox
        orientation={top ? 'top' : 'below'}
        x={cx}
        y={cy + (top ? -yOffset : yOffset)}
        contextWidth={width}>
        {hover.map(({ value }, i) => (
          <ContextBoxValue key={`${value.datum[props.label]}${i}`}
            label={value.datum[props.label]}>
            {yFormat(value.y)} {subsup(props.yUnit)}<br />
            {xFormat(value.x)} {subsup(props.xUnit)}
          </ContextBoxValue>
        ))}
      </ContextBox>
    )
  }
  render () {
    const { props } = this
    const {
      width,
      description,
      children,
      values,
      t, tLabel,
      opacity
    } = props

    const data = values
      .filter(d => (
        d[props.x] && d[props.x].length > 0 &&
        d[props.y] && d[props.y].length > 0
      ))
      .map(d => ({
        datum: d,
        x: +d[props.x],
        y: +d[props.y],
        size: +d[props.size] || 0
      }))

    const paddingTop = 15
    const paddingRight = 1
    const paddingBottom = 50
    const paddingLeft = props.paddingLeft

    const innerWidth = props.width - paddingLeft - paddingRight
    const height = props.height || (innerWidth * props.heightRatio) + paddingTop + paddingBottom
    const innerHeight = height - paddingTop - paddingBottom

    // setup x axis
    let xValues = data.map(d => d.x)
    if (props.xTicks) {
      xValues = xValues.concat(props.xTicks)
    }
    const x = scales[props.xScale]()
      .domain(extent(xValues))
      .range([paddingLeft, paddingLeft + innerWidth])
    const xNice = props.xNice === undefined
      ? Math.min(Math.max(Math.round(innerWidth / 150), 3), 5)
      : props.xNice
    if (xNice) {
      x.nice(xNice)
    }
    const xAxis = calculateAxis(props.xNumberFormat || props.numberFormat, t, x.domain()) // xUnit is rendered separately
    const xTicks = props.xTicks || (props.xScale === 'log' ? get3EqSpaTicks(x) : xAxis.ticks)
    // ensure highest value is last: the last value is labled with the unit
    xTicks.sort(ascending)

    // setup y axis
    let yValues = data.map(d => d.y)
    if (props.yTicks) {
      yValues = yValues.concat(props.yTicks)
    }
    const y = scales[props.yScale]()
      .domain(extent(yValues))
      .range([innerHeight + paddingTop, paddingTop])
    const yNice = props.yNice === undefined
      ? Math.min(Math.max(Math.round(innerHeight / 150), 3), 5)
      : props.yNice
    if (yNice) {
      y.nice(yNice)
    }
    const yAxis = calculateAxis(props.yNumberFormat || props.numberFormat, t, y.domain(), tLabel(props.yUnit))
    const yTicks = props.yTicks || (props.yScale === 'log' ? get3EqSpaTicks(y) : yAxis.ticks)
    // ensure highest value is last: the last value is labled with the unit
    yTicks.sort(ascending)

    const colorAccessor = d => d.datum[props.color]
    const colorValues = data.map(colorAccessor).filter(deduplicate).filter(Boolean)
    runSort(props.colorSort, colorValues)

    const size = scaleSqrt().domain(extent(data, d => d.size)).range(props.sizeRange)

    let colorRange = props.colorRanges[props.colorRange] || props.colorRange
    if (!colorRange) {
      colorRange = colorValues.length > 3
        ? props.colorRanges.discrete
        : props.colorRanges.sequential3
    }
    const color = scaleOrdinal(colorRange).domain(colorValues)

    this.symbols = data.map((value, i) => {
      return {
        key: `symbol${i}`,
        value,
        cx: x(value.x),
        cy: y(value.y),
        r: size(value.size)
      }
    })

    return (
      <div style={{ position: 'relative' }}>
        <svg width={width} height={height} ref={this.setContainerRef}>
          <desc>{description}</desc>
          {this.symbols.map((symbol, i) => (
            <circle key={symbol.key}
              style={{ opacity }}
              fill={color(colorAccessor(symbol.value))}
              cx={symbol.cx}
              cy={symbol.cy}
              r={symbol.r} />
          ))}
          {this.state.hover.map((symbol, i) => (
            <circle key={`hover${symbol.key}`}
              fill='none'
              stroke='#000'
              cx={symbol.cx}
              cy={symbol.cy}
              r={symbol.r} />
          ))}
          {
            yTicks.map((tick, i) => (
              <g key={tick} transform={`translate(0,${y(tick)})`}>
                <line {...styles.axisLine} x2={width - paddingRight} style={{
                  stroke: tick === 0 ? baseLineColor : undefined
                }} />
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
              if (i === 0 && paddingLeft < 20) {
                textAnchor = 'start'
              }
              return (
                <g key={`x${tick}`} transform={`translate(${x(tick)},${paddingTop + innerHeight + X_TICK_HEIGHT})`}>
                  <line {...styles.axisLine} y2={-(innerHeight + X_TICK_HEIGHT)} style={{
                    stroke: tick === 0 ? baseLineColor : undefined
                  }} />
                  <text {...styles.axisLabel} y={5} dy='0.6em' textAnchor={textAnchor}>
                    {subsup.svg(xAxis.axisFormat(tick, last(xTicks, i)))}
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
          <rect fill='transparent'
            width={width}
            height={height}
            onMouseEnter={this.focus}
            onMouseMove={this.focus}
            onMouseLeave={this.blur} 
            ref={
              /* touch events are added via ref for { passive: false } on touchstart
               * react does not support setting passive, which defaults to true in newer browsers
               * https://github.com/facebook/react/issues/6436
               */
              this.setHoverRectRef
            } />
        </svg>
        {this.renderHover({
          width,
          height,
          xFormat: xAxis.format,
          yFormat: yAxis.format
        })}
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
}

ScatterPlot.propTypes = {
  children: PropTypes.node,
  values: PropTypes.array.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number,
  heightRatio: PropTypes.number,
  paddingLeft: PropTypes.number.isRequired,
  x: PropTypes.string.isRequired,
  xUnit: PropTypes.string,
  xNice: PropTypes.number,
  xTicks: PropTypes.arrayOf(PropTypes.number),
  xScale: PropTypes.oneOf(Object.keys(scales)),
  xNumberFormat: PropTypes.string,
  y: PropTypes.string.isRequired,
  yUnit: PropTypes.string,
  yNice: PropTypes.number,
  yTicks: PropTypes.arrayOf(PropTypes.number),
  yScale: PropTypes.oneOf(Object.keys(scales)),
  yNumberFormat: PropTypes.string,
  numberFormat: PropTypes.string.isRequired,
  opacity: PropTypes.number.isRequired,
  color: PropTypes.string,
  colorLegend: PropTypes.bool,
  colorRange: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  colorRanges: PropTypes.shape({
    sequential3: PropTypes.array.isRequired,
    discrete: PropTypes.array.isRequired
  }).isRequired,
  colorSort: sortPropType,
  size: PropTypes.string.isRequired,
  sizeRange: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
  label: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
  description: PropTypes.string
}

ScatterPlot.defaultProps = {
  x: 'value',
  y: 'value',
  xScale: 'linear',
  yScale: 'linear',
  opacity: 1,
  numberFormat: 's',
  colorLegend: true,
  paddingLeft: 30,
  size: 'size',
  sizeRange: [4, 10],
  label: 'label',
  heightRatio: 1
}

export default ScatterPlot
