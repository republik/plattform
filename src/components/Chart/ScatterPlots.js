import React, { Fragment, Component } from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'

import ColorLegend from './ColorLegend'
import { scaleLinear, scaleLog, scaleOrdinal, scaleSqrt } from 'd3-scale'
import { extent, ascending, min, max } from 'd3-array'

import ContextBox, { ContextBoxValue } from './ContextBox'

import {
  calculateAxis,
  subsup,
  runSort,
  deduplicate,
  sortPropType,
  last,
  transparentAxisStroke,
  get3EqualDistTicks,
  baseLineColor,
  getFormat
} from './utils'

import { getColorMapper } from './colorMaps'

import { sansSerifRegular12, sansSerifMedium12 } from '../Typography/styles'

import colors from '../../theme/colors'
import { intersperse } from '../../lib/helpers'

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
  }),
  inlineLabel: css({
    ...sansSerifMedium12,
    fill: '#000'
  }),
  inlineSecondaryLabel: css({
    ...sansSerifRegular12,
    fill: '#000'
  })
}

class ScatterPlot extends Component {
  constructor(...args) {
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
  componentDidMount() {
    window.addEventListener('resize', this.measure)
    this.hoverRect.addEventListener('touchstart', this.focus, {
      passive: false
    })
    this.hoverRect.addEventListener('touchmove', this.focus)
    this.hoverRect.addEventListener('touchend', this.blur)
    this.measure()
  }
  componentDidUpdate() {
    this.measure()
  }
  componentWillUnmount() {
    this.hoverRect.removeEventListener('touchstart', this.focus)
    this.hoverRect.removeEventListener('touchmove', this.focus)
    this.hoverRect.removeEventListener('touchend', this.blur)
    window.removeEventListener('resize', this.measure)
  }
  focus = event => {
    const { top, left } = this.state
    if (top === undefined || left === undefined || !this.symbols) {
      return
    }

    let hoverTouch = false
    let currentEvent = event
    if (currentEvent.changedTouches) {
      hoverTouch = true
      currentEvent = currentEvent.changedTouches[0]
    }

    const focusX = currentEvent.clientX - left
    const focusY = currentEvent.clientY - top

    const withDistance = this.symbols.map(symbol => {
      return {
        symbol,
        distance:
          Math.sqrt(
            Math.pow(symbol.cx - focusX, 2) + Math.pow(symbol.cy - focusY, 2)
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
  renderHover({ width, height, xFormat, yFormat }) {
    const { hover, hoverTouch } = this.state

    if (!hover.length) {
      return null
    }

    const { props } = this
    const sizeFormat = getFormat(
      props.sizeNumberFormat || props.numberFormat,
      props.tLabel
    )

    const { cx, cy, r } = hover.sort((a, b) => ascending(a.cy, b.cy))[0]
    const top = hoverTouch || cy > height / 3
    const yOffset = r + (hoverTouch ? 40 : 12)
    return (
      <ContextBox
        orientation={top ? 'top' : 'below'}
        x={cx}
        y={cy + (top ? -yOffset : yOffset)}
        contextWidth={width}
      >
        {hover.map(({ value }, i) => (
          <ContextBoxValue
            key={`${value.datum[props.label]}${i}`}
            label={value.datum[props.label]}
          >
            {intersperse(
              []
                .concat(
                  value.datum[props.detail] &&
                    value.datum[props.detail]
                      .split('\n')
                      .map((d, i) => (
                        <Fragment key={`d${i}`}>{subsup(d)}</Fragment>
                      ))
                )
                .concat([
                  props.yShowValue && (
                    <Fragment key='y'>
                      {yFormat(value.y)} {subsup(props.yUnit)}
                    </Fragment>
                  ),
                  props.xShowValue && (
                    <Fragment key='x'>
                      {xFormat(value.x)} {subsup(props.xUnit)}
                    </Fragment>
                  ),
                  props.sizeShowValue && (
                    <Fragment key='size'>
                      {sizeFormat(value.size)} {subsup(props.sizeUnit)}
                    </Fragment>
                  )
                ])
                .filter(Boolean),
              (item, index) => (
                <br key={`br${index}`} />
              )
            )}
          </ContextBoxValue>
        ))}
      </ContextBox>
    )
  }
  render() {
    const { props } = this
    const {
      width,
      description,
      children,
      values,
      tLabel,
      inlineLabelPosition,
      inlineLabel,
      inlineSecondaryLabel,
      opacity
    } = props

    const data = values
      .filter(
        d =>
          d[props.x] &&
          d[props.x].length > 0 &&
          d[props.y] &&
          d[props.y].length > 0
      )
      .map(d => {
        const size = d[props.size]
        return {
          datum: d,
          x: +d[props.x],
          y: +d[props.y],
          size: size === undefined ? 1 : +d[props.size] || 0
        }
      })

    const { paddingTop, paddingRight, paddingBottom, paddingLeft } = props

    const innerWidth = props.width - paddingLeft - paddingRight
    const height =
      props.height ||
      innerWidth * props.heightRatio + paddingTop + paddingBottom
    const innerHeight = height - paddingTop - paddingBottom

    // setup x axis
    let xValues = data.map(d => d.x)
    if (props.xTicks) {
      xValues = xValues.concat(props.xTicks)
    }
    if (props.xLines) {
      xValues = xValues.concat(props.xLines.map(line => line.tick))
    }
    const x = scales[props.xScale]()
      .domain(extent(xValues))
      .range([paddingLeft, paddingLeft + innerWidth])
    const xNice =
      props.xNice === undefined
        ? Math.min(Math.max(Math.round(innerWidth / 150), 3), 5)
        : props.xNice
    if (xNice) {
      x.nice(xNice)
    }
    const xAxis = calculateAxis(
      props.xNumberFormat || props.numberFormat,
      tLabel,
      x.domain(),
      undefined,
      {
        ticks: props.xLines ? props.xLines.map(line => line.tick) : props.xTicks
      }
    ) // xUnit is rendered separately
    const xLines =
      props.xLines ||
      (
        props.xTicks ||
        (props.xScale === 'log' ? get3EqualDistTicks(x) : xAxis.ticks)
      ).map(tick => ({ tick }))
    // ensure highest value is last: the last value is labled with the unit
    xLines.sort((a, b) => ascending(a.tick, b.tick))

    // setup y axis
    let yValues = data.map(d => d.y)
    if (props.yTicks) {
      yValues = yValues.concat(props.yTicks)
    }
    if (props.yLines) {
      yValues = yValues.concat(props.yLines.map(line => line.tick))
    }
    const y = scales[props.yScale]()
      .domain(extent(yValues))
      .range([innerHeight + paddingTop, paddingTop])
    const yNice =
      props.yNice === undefined
        ? Math.min(Math.max(Math.round(innerHeight / 150), 3), 5)
        : props.yNice
    if (yNice) {
      y.nice(yNice)
    }
    const yAxis = calculateAxis(
      props.yNumberFormat || props.numberFormat,
      tLabel,
      y.domain(),
      tLabel(props.yUnit),
      {
        ticks: props.yLines ? props.yLines.map(line => line.tick) : props.yTicks
      }
    )
    const yLines =
      props.yLines ||
      (
        props.yTicks ||
        (props.yScale === 'log' ? get3EqualDistTicks(y) : yAxis.ticks)
      ).map(tick => ({ tick }))
    // ensure highest value is last: the last value is labled with the unit
    yLines.sort((a, b) => ascending(a.tick, b.tick))
    const maxYLine = yLines[yLines.length - 1]

    const colorAccessor = d => d.datum[props.color]
    const colorValues = []
      .concat(data.map(colorAccessor))
      .concat(props.colorLegendValues)
      .filter(deduplicate)
      .filter(Boolean)
    runSort(props.colorSort, colorValues)

    const sizeRangeMax = props.sizeRange
      ? props.sizeRange[1] // backwards compatible
      : props.sizeRangeMax

    const size = scaleSqrt()
      .domain([0, max(data, d => d.size)])
      .range([0, sizeRangeMax])

    let colorRange = props.colorRanges[props.colorRange] || props.colorRange
    if (!colorRange) {
      colorRange =
        colorValues.length > 3
          ? props.colorRanges.discrete
          : props.colorRanges.sequential3
    }
    const color = getColorMapper(props, colorValues)

    this.symbols = data.map((value, i) => {
      return {
        key: `symbol${i}`,
        value,
        cx: x(value.x),
        cy: y(value.y),
        r: size(value.size)
      }
    })

    const yLinesPaddingLeft = paddingLeft < 2 ? paddingLeft : 0

    return (
      <div style={{ position: 'relative' }}>
        <svg width={width} height={height} ref={this.setContainerRef}>
          <desc>{description}</desc>
          {this.symbols.map((symbol, i) => (
            <circle
              key={symbol.key}
              style={{ opacity }}
              fill={color(colorAccessor(symbol.value))}
              cx={symbol.cx}
              cy={symbol.cy}
              r={symbol.r}
            />
          ))}
          {(inlineLabel || inlineSecondaryLabel) &&
            this.symbols
              .filter(
                ({ value: { datum } }) =>
                  datum[inlineLabel] || datum[inlineSecondaryLabel]
              )
              .map((symbol, i) => {
                const { datum } = symbol.value
                const primary = datum[inlineLabel]
                const secondary = datum[inlineSecondaryLabel]
                const pos = datum[inlineLabelPosition] || 'center'
                let textAnchor = 'middle'
                let yOffset = 0
                let xOffset = 0
                if (pos === 'left') {
                  textAnchor = 'end'
                  xOffset = -(symbol.r + 5)
                }
                if (pos === 'right') {
                  textAnchor = 'start'
                  xOffset = symbol.r + 5
                }
                if (pos === 'top' || pos === 'bottom') {
                  yOffset = symbol.r + 5 + (primary && secondary ? 15 : 7)
                  if (pos === 'top') {
                    yOffset = -yOffset
                  }
                }

                return (
                  <g
                    key={`inlineLabel${symbol.key}`}
                    textAnchor={textAnchor}
                    transform={`translate(${symbol.cx + xOffset},${symbol.cy +
                      yOffset})`}
                  >
                    {primary && (
                      <text
                        {...styles.inlineLabel}
                        dy={secondary ? '-0.3em' : '0.4em'}
                      >
                        {subsup.svg(primary)}
                      </text>
                    )}
                    {secondary && (
                      <text
                        {...styles.inlineSecondaryLabel}
                        dy={primary ? '0.9em' : '0.4em'}
                      >
                        {subsup.svg(secondary)}
                      </text>
                    )}
                  </g>
                )
              })}
          {this.state.hover.map((symbol, i) => (
            <circle
              key={`hover${symbol.key}`}
              fill='none'
              stroke='#000'
              cx={symbol.cx}
              cy={symbol.cy}
              r={symbol.r}
            />
          ))}
          {yLines.map(({ tick, label, base }, i) => (
            <g
              key={tick}
              transform={`translate(${yLinesPaddingLeft},${y(tick)})`}
            >
              <line
                {...styles.axisLine}
                x2={width - paddingRight - yLinesPaddingLeft}
                style={{
                  stroke:
                    base || (base === undefined && tick === 0)
                      ? baseLineColor
                      : undefined
                }}
              />
              <text {...styles.axisLabel} dy='-3px'>
                {subsup.svg(label || yAxis.axisFormat(tick, last(yLines, i)))}
              </text>
            </g>
          ))}
          {xLines.map(({ tick, label, textAnchor, base }, i) => {
            if (!textAnchor) {
              textAnchor = 'middle'
              if (last(xLines, i)) {
                textAnchor = 'end'
              }
              if (i === 0 && paddingLeft < 20) {
                textAnchor = 'start'
              }
            }
            return (
              <g
                key={`x${tick}`}
                transform={`translate(${x(tick)},${paddingTop +
                  innerHeight +
                  X_TICK_HEIGHT})`}
              >
                <line
                  {...styles.axisLine}
                  y2={
                    -(
                      (maxYLine
                        ? y(y.domain()[0]) - y(maxYLine.tick)
                        : innerHeight) + X_TICK_HEIGHT
                    )
                  }
                  style={{
                    stroke:
                      base || (base === undefined && tick === 0)
                        ? baseLineColor
                        : undefined
                  }}
                />
                <text
                  {...styles.axisLabel}
                  y={5}
                  dy='0.6em'
                  textAnchor={textAnchor}
                >
                  {subsup.svg(label || xAxis.axisFormat(tick, last(xLines, i)))}
                </text>
              </g>
            )
          })}
          <text
            x={paddingLeft + innerWidth}
            y={paddingTop + innerHeight + 28 + X_TICK_HEIGHT}
            textAnchor='end'
            {...styles.axisLabel}
          >
            {props.xUnit}
          </text>
          <rect
            fill='transparent'
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
            }
          />
        </svg>
        {this.renderHover({
          width,
          height,
          xFormat: xAxis.format,
          yFormat: yAxis.format
        })}
        <ColorLegend
          inline
          values={[]
            .concat(
              props.colorLegend &&
                (props.colorLegendValues || colorValues).map(colorValue => ({
                  color: color(colorValue),
                  label: colorValue
                }))
            )
            .filter(Boolean)}
        />
        {children}
      </div>
    )
  }
}

export const propTypes = {
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
  xLines: PropTypes.arrayOf(
    PropTypes.shape({
      tick: PropTypes.number.isRequired,
      label: PropTypes.string,
      base: PropTypes.bool,
      textAnchor: PropTypes.string
    }).isRequired
  ),
  xScale: PropTypes.oneOf(Object.keys(scales)),
  xNumberFormat: PropTypes.string,
  xShowValue: PropTypes.bool.isRequired,
  y: PropTypes.string.isRequired,
  yUnit: PropTypes.string,
  yNice: PropTypes.number,
  yTicks: PropTypes.arrayOf(PropTypes.number),
  yLines: PropTypes.arrayOf(
    PropTypes.shape({
      tick: PropTypes.number.isRequired,
      label: PropTypes.string,
      base: PropTypes.bool
    }).isRequired
  ),
  yScale: PropTypes.oneOf(Object.keys(scales)),
  yNumberFormat: PropTypes.string,
  yShowValue: PropTypes.bool.isRequired,
  numberFormat: PropTypes.string.isRequired,
  opacity: PropTypes.number.isRequired,
  color: PropTypes.string,
  colorLegend: PropTypes.bool,
  colorLegendValues: PropTypes.arrayOf(PropTypes.string),
  colorRange: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  colorRanges: PropTypes.shape({
    sequential3: PropTypes.array.isRequired,
    discrete: PropTypes.array.isRequired
  }).isRequired,
  colorMap: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  colorSort: sortPropType,
  size: PropTypes.string.isRequired,
  sizeRangeMax: PropTypes.number.isRequired,
  sizeUnit: PropTypes.string,
  sizeNumberFormat: PropTypes.string,
  sizeShowValue: PropTypes.bool.isRequired,
  label: PropTypes.string.isRequired,
  inlineLabel: PropTypes.string,
  inlineLabelPosition: PropTypes.string,
  inlineSecondaryLabel: PropTypes.string,
  detail: PropTypes.string,
  tLabel: PropTypes.func.isRequired,
  description: PropTypes.string
}

ScatterPlot.propTypes = propTypes

ScatterPlot.defaultProps = {
  x: 'value',
  y: 'value',
  xScale: 'linear',
  xShowValue: true,
  yScale: 'linear',
  yShowValue: true,
  opacity: 1,
  numberFormat: 's',
  colorLegend: true,
  paddingTop: 15,
  paddingRight: 1,
  paddingBottom: 50,
  paddingLeft: 30,
  size: 'size',
  sizeRangeMax: 4,
  label: 'label',
  heightRatio: 1,
  sizeShowValue: false
}

export default ScatterPlot
