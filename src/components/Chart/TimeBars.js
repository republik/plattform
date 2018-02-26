import PropTypes from 'prop-types'
import React from 'react'
import { css } from 'glamor'

import { max, min, ascending } from 'd3-array'
import { scaleLinear, scaleOrdinal, scaleBand } from 'd3-scale'

import { sansSerifRegular12, sansSerifMedium12 } from '../Typography/styles'
import colors from '../../theme/colors'

import {
  calculateAxis,
  sortBy,
  groupBy,
  deduplicate,
  transparentAxisStroke,
  circleFill,
  unsafeDatumFn
} from './utils'

import ColorLegend from './ColorLegend'

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
  data = data.filter(d => d.value && d.value.length > 0).map(d => {
    return {
      datum: d,
      year: +d.year,
      value: +d.value
    }
  })
  data = sortBy(data, d => d.value).reverse()

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

  const bars = groupBy(data, d => d.year).map(({values: group, key: year}) => {
    const segments = group

    return {
      segments,
      sum: segments.reduce(
        (sum, segment) => sum + segment.value,
        0
      ),
      year
    }
  })

  const innerHeight = props.height - (mini ? paddingTop + AXIS_BOTTOM_HEIGHT : 0)
  const y = scaleLinear()
    .domain(props.domain ? props.domain : [
      Math.min(0, min(bars, d => d.sum)),
      max(bars, d => d.sum)
    ])
    .range([innerHeight, 0])

  if (!props.domain) {
    y.nice(3)
  }

  bars.forEach(group => {
    let stackValue = 0
    let yPos = y(0)
    group.segments.forEach(segment => {
      let y0 = y(stackValue)
      let y1 = y(stackValue + segment.value)
      const positiv = y1 <= y0
      const size = Math.abs(y0 - y1)
      if (positiv) {
        yPos -= size
      }
      segment.y = yPos
      segment.height = size
      if (!positiv) {
        yPos += size
      }
      stackValue += segment.value
    })
  })

  const yAxis = calculateAxis(props.numberFormat, t, y.domain(), tLabel(props.unit))
  const yTicks = props.yTicks || yAxis.ticks

  const xYears = data
    .map(d => d.year)
    .concat(
      xAnnotations
        .reduce(
          (years, annotation) => years.concat(
            annotation.x, annotation.x1, annotation.x2
          ),
          []
        )
        .filter(Boolean)
        .map(d => +d)
    )
    .filter(deduplicate)
    .sort(ascending)

  const xPadding = props.padding
  const x = scaleBand()
    .domain(xYears)
    .range([xPadding, width - xPadding])
    .padding(0.25)
    .round(true)

  const gapsNeeded = Math.ceil(Math.max(26 / x.bandwidth(), 2))

  const xDomain = xYears.reduce(
    (years, year) => {
      years.push(year)
      if (
        xYears.indexOf(year + 1) === -1 &&
        year !== xYears[xYears.length - 1]
      ) {
        for (let i = 0; i < gapsNeeded; i++) {
          years.push(`G${i} ${year}`)
        }
      }
      return years
    },
    []
  )

  x.domain(xDomain).round(true)

  const barWidth = x.bandwidth()
  const barStep = x.step()
  const barPadding = barStep - barWidth

  let xTicks = props.xTicks
  if (!xTicks) {
    if (barStep >= 50) {
      xTicks = xYears
    } else {
      xTicks = xYears.filter(year =>
        // edge years
        xYears.indexOf(year + 1) === -1 ||
        xYears.indexOf(year - 1) === -1
      ).filter(deduplicate)
    }
  }

  const xDomainLast = xDomain[xDomain.length - 1]
  const baseLines = xDomain.reduce(
    (lines, year) => {
      let previousLine = lines[lines.length - 1]
      let x1 = previousLine ? previousLine.x2 : 0
      let x2 = year === xDomainLast ? width : x(year) + barStep
      const gap = year[0] === 'G'
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
                      {tick}
                    </text>
                  </g>
                )
              })
            }
          </g>
          {
            xAnnotations.filter(annotation => annotation.ghost).map((annotation, i) => (
              <rect key={`ghost-${i}`}
                x={x(+annotation.x)}
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
                <g key={bar.year} transform={`translate(${x(bar.year)},0)`}>
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
                {i > 0 && <line {...styles.axisYLine} x2={width}/>}
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
                <circle r='3.5' cx={annotation.x ? x(+annotation.x) : 4} {...styles.annotationCircle} />
                <text x={width} textAnchor='end' dy={annotation.dy || '-0.4em'} {...styles.annotationText}>{tLabel(annotation.label)} {yAxis.format(annotation.value)}</text>
              </g>
            ))
          }
          {
            xAnnotations.map((annotation, i) => {
              const range = annotation.x1 !== undefined && annotation.x2 !== undefined
              const x1 = range ? x(+annotation.x1) : x(+annotation.x)
              const x2 = range ? x(+annotation.x2) + barWidth : x1 + Math.max(barWidth, 8)
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
  xTicks: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number])),
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
  numberFormat: 's',
  height: 240,
  padding: 50,
  unit: '',
  colorLegend: true,
  yAnnotations: [],
  xAnnotations: []
}

export default TimeBarChart
