import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'

import { scaleLinear, scaleOrdinal } from 'd3-scale'
import { max, min } from 'd3-array'

import { sansSerifRegular12, sansSerifMedium14 } from '../Typography/styles'
import { fontFamilies } from '../../theme/fonts'
import colors from '../../theme/colors'
import { underline } from '../../lib/styleMixins'

import {
  calculateAxis,
  groupBy,
  runSort,
  sortPropType,
  transparentAxisStroke,
  circleFill,
  deduplicate,
  unsafeDatumFn,
  subsup,
  baseLineColor,
  getTextColor
} from './utils'
import ColorLegend from './ColorLegend'

import { getColorMapper } from './colorMaps'

const COLUMN_PADDING = 20
const COLUMN_TITLE_HEIGHT = 30
const BAR_LABEL_HEIGHT = 15
const AXIS_BOTTOM_HEIGHT = 20
const AXIS_BOTTOM_PADDING = 8
const X_TICK_TEXT_MARGIN = 0
const LOLLIPOP_PADDING = 7 // half of max pop height

const BAR_STYLES = {
  lollipop: {
    highlighted: {
      marginTop: 4,
      height: 6,
      stroke: 4,
      popHeight: 14,
      marginBottom: 16
    },
    normal: {
      marginTop: 4,
      height: 3,
      stroke: 3,
      popHeight: 13,
      marginBottom: 9
    }
  },
  small: {
    highlighted: {
      marginTop: 0,
      height: 24,
      marginBottom: 16
    },
    normal: {
      marginTop: 0,
      height: 16,
      marginBottom: 9
    }
  },
  large: {
    highlighted: {
      marginTop: 0,
      height: 40,
      marginBottom: 40
    },
    normal: {
      marginTop: 0,
      height: 24,
      marginBottom: 16
    }
  },
  inline: {
    withSecondary: {
      marginTop: 0,
      height: 50,
      marginBottom: 9,
      fontSize: 16,
      secondaryFontSize: 12,
      inlineTop: 6
    },
    normal: {
      marginTop: 0,
      height: 20,
      marginBottom: 9,
      fontSize: 12,
      inlineTop: 2
    }
  }
}

const last = (array, index) => array.length - 1 === index

const styles = {
  groupTitle: css({
    ...sansSerifMedium14,
    fill: colors.text
  }),
  barLabel: css({
    ...sansSerifRegular12,
    fill: colors.text
  }),
  barLabelLink: css({
    ...underline,
    '@media (hover)': {
      ':hover': {
        fill: colors.lightText
      }
    }
  }),
  inlineLabel: css({
    fontFamily: fontFamilies.sansSerifRegular,
    fontWeight: 'normal'
  }),
  axisLabel: css({
    ...sansSerifRegular12,
    fill: colors.lightText
  }),
  axisXLine: css({
    stroke: transparentAxisStroke,
    strokeWidth: '1px',
    shapeRendering: 'crispEdges'
  }),
  bandLegend: css({
    whiteSpace: 'nowrap'
  }),
  bandBar: css({
    display: 'inline-block',
    width: 24,
    height: 8,
    backgroundColor: colors.divider,
    borderRadius: '4px'
  })
}

const BarChart = props => {
  const {
    values,
    width,
    mini,
    children,
    tLabel,
    description,
    band,
    bandLegend,
    showBarValues,
    inlineValue,
    inlineValueUnit,
    inlineLabel,
    inlineSecondaryLabel,
    inlineLabelPosition,
    link
  } = props

  const possibleColumns = Math.floor(
    width / (props.minInnerWidth + COLUMN_PADDING)
  )
  const columns =
    possibleColumns >= props.columns
      ? props.columns
      : Math.max(possibleColumns, 1)
  const columnWidth =
    Math.floor((width - COLUMN_PADDING * (columns - 1)) / columns) - 1

  // filter and map data to clean objects
  let data = values
  if (props.filter) {
    const filter = unsafeDatumFn(props.filter)
    data = data.filter(filter)
  }
  data = data
    .filter(d => d.value && d.value.length > 0)
    .map(d => ({
      datum: d,
      label: d[props.y],
      value: +d.value
    }))
  // compute category
  if (props.category) {
    const categorize = unsafeDatumFn(props.category)
    data.forEach(d => {
      d.category = categorize(d.datum)
    })
  }
  // sort by value (default lowest on top)
  runSort(props.sort, data, d => d.value)

  // group data into columns
  let groupedData
  if (props.columnFilter) {
    groupedData = props.columnFilter.map(({ test, title }) => {
      const filter = unsafeDatumFn(test)
      return {
        key: title,
        values: data.filter(d => filter(d.datum))
      }
    })
    data = groupedData.reduce((all, group) => all.concat(group.values), [])
  } else {
    groupedData = groupBy(data, d => d.datum[props.column])
  }
  runSort(props.columnSort, groupedData, d => d.key)

  // compute colors
  const colorAccessor = props.color
    ? d => d.datum[props.color]
    : d => d.category
  let colorValues = []
    .concat(data.map(colorAccessor))
    .concat(props.colorLegendValues)
    .filter(Boolean)
    .filter(deduplicate)
  runSort(props.colorSort, colorValues)

  const color = getColorMapper(props, colorValues)

  const highlight = props.highlight
    ? unsafeDatumFn(props.highlight)
    : () => false

  const inlineBarStyle = !!inlineValue || !!inlineLabel

  // first layout run, set y position
  const barStyle = inlineBarStyle
    ? BAR_STYLES.inline
    : BAR_STYLES[props.barStyle]
  groupedData = groupedData.map(({ values: groupData, key: title }) => {
    let gY = 0
    if (title) {
      gY += COLUMN_TITLE_HEIGHT
    }

    let firstBarY
    let stackedBars = groupBy(groupData, d => d.label)
    let marginBottom = 0
    const bars = stackedBars.map(({ values: segments }) => {
      const first = segments[0]
      const style = inlineBarStyle
        ? barStyle[
            first.datum[inlineSecondaryLabel] ? 'withSecondary' : 'normal'
          ]
        : barStyle[highlight(first.datum) ? 'highlighted' : 'normal']

      gY += marginBottom
      let labelY = gY
      if (first.label) {
        gY += BAR_LABEL_HEIGHT
      }
      gY += style.marginTop
      let y = gY
      if (firstBarY === undefined) {
        firstBarY = gY
      }

      gY += style.height
      marginBottom = style.marginBottom

      let barSegments = segments
      runSort(props.colorSort, barSegments, colorAccessor)

      return {
        labelY,
        y,
        style,
        height: style.height,
        segments: barSegments,
        first,
        max: barSegments.reduce(
          (sum, segment) => sum + Math.max(0, segment.value),
          0
        ),
        min: barSegments.reduce(
          (sum, segment) => sum + Math.min(0, segment.value),
          0
        )
      }
    })

    return {
      title,
      bars,
      max: max(bars, bar => bar.max),
      min: min(bars, bar => bar.min),
      height: gY,
      firstBarY
    }
  })

  // setup x scale
  const xDomain = props.domain || [
    Math.min(0, min(groupedData.map(d => d.min).concat(props.xTicks || []))),
    Math.max(0, max(groupedData.map(d => d.max).concat(props.xTicks || [])))
  ]
  const x = scaleLinear()
    .domain(xDomain)
    .range([0, columnWidth])
  if (!props.domain) {
    x.nice(3)
  }

  const xAxis = calculateAxis(
    props.numberFormat,
    tLabel,
    x.domain(),
    undefined,
    {
      ticks: props.xTicks
    }
  )

  // stack bars
  groupedData.forEach(group => {
    group.bars.forEach(bar => {
      const xZero = x(0)
      let xPosPositiv = xZero
      let xPosNegativ = xZero
      bar.segments.forEach((d, i) => {
        d.color = color(colorAccessor(d))
        const size = x(d.value) - xZero
        d.x = size > 0 ? Math.floor(xPosPositiv) : Math.ceil(xPosNegativ + size)

        d.width =
          Math.ceil(Math.abs(size)) + (size && last(bar.segments, i) ? 1 : 0)
        if (size > 0) {
          xPosPositiv += size
        } else {
          xPosNegativ += size
        }
      })
    })
  })

  const xTicks = props.xTicks || (showBarValues ? [] : xAxis.ticks)
  const hasXTicks = !inlineValue && !!xTicks.length

  const isLollipop = props.barStyle === 'lollipop'

  // rows and columns
  let yPos = 0
  groupBy(groupedData, (d, i) => Math.floor(i / columns)).forEach(
    ({ values: groups }) => {
      const height = max(groups.map(d => d.height))

      groups.forEach((group, column) => {
        group.groupHeight = height
        group.y = yPos
        group.x = column * (columnWidth + COLUMN_PADDING)
      })

      yPos +=
        height +
        (hasXTicks ? AXIS_BOTTOM_HEIGHT : 0) +
        (isLollipop ? LOLLIPOP_PADDING : 0)
    }
  )

  const highlightZero = xTicks.indexOf(0) !== -1 && xTicks[0] !== 0

  const colorLegendValues = []
    .concat(
      props.colorLegend &&
        (props.colorLegendValues || colorValues).map(colorValue => ({
          color: color(colorValue),
          label: colorValue
        }))
    )
    .concat(
      !mini &&
        band &&
        bandLegend && {
          label: (
            <span {...styles.bandLegend}>
              <span {...styles.bandBar} />
              {` ${bandLegend}`}
            </span>
          )
        }
    )
    .filter(Boolean)

  return (
    <>
      <svg width={width} height={yPos}>
        <desc>{description}</desc>
        {groupedData.map(group => {
          return (
            <g
              key={`group${group.title || 1}`}
              transform={`translate(${group.x},${group.y})`}
            >
              <text dy='1.5em' {...styles.groupTitle}>
                {group.title}
              </text>
              {group.bars.map(bar => {
                const href = bar.first.datum[link]
                let barLabel = (
                  <text
                    {...styles.barLabel}
                    {...(href && styles.barLabelLink)}
                    y={bar.labelY}
                    dy='0.9em'
                    x={x(0) + (highlightZero ? (bar.max <= 0 ? -2 : 2) : 0)}
                    textAnchor={bar.max <= 0 ? 'end' : 'start'}
                  >
                    {subsup.svg(bar.first.label)}
                  </text>
                )
                if (href) {
                  // disable a11y rule because it does not understand that this a tag is an svg tag
                  // eslint-disable-next-line jsx-a11y/anchor-is-valid
                  barLabel = <a xlinkHref={href}>{barLabel}</a>
                }
                return (
                  <g key={`bar${bar.y}`}>
                    {barLabel}
                    {bar.segments.map((segment, i) => {
                      const isLast = last(bar.segments, i)
                      const valueTextStartAnchor =
                        (segment.value >= 0 && isLast) ||
                        (segment.value < 0 && i !== 0)
                      const inlineFill = getTextColor(segment.color)
                      const isLastSegment = isLast && i !== 0

                      const inlinePos =
                        segment.datum[inlineLabelPosition] ||
                        (segment.value >= 0
                          ? isLastSegment
                            ? 'right'
                            : 'left'
                          : isLastSegment
                          ? 'left'
                          : 'right')
                      let iTextAnchor = 'middle'
                      let iXOffset = segment.width / 2
                      if (inlinePos === 'right') {
                        iTextAnchor = 'end'
                        iXOffset = segment.width - 5
                      }
                      if (inlinePos === 'left') {
                        iTextAnchor = 'start'
                        iXOffset = 5
                      }

                      return (
                        <g key={`seg${i}`} transform={`translate(0,${bar.y})`}>
                          <rect
                            x={segment.x}
                            fill={segment.color}
                            width={segment.width}
                            height={bar.height}
                          />
                          {(inlineValue || inlineLabel) && (
                            <Fragment>
                              <text
                                {...styles.inlineLabel}
                                x={segment.x + iXOffset}
                                y={bar.style.inlineTop}
                                dy='1em'
                                fontSize={bar.style.fontSize}
                                fill={inlineFill}
                                textAnchor={iTextAnchor}
                              >
                                {subsup.svg(
                                  [
                                    inlineValue && xAxis.format(segment.value),
                                    inlineValueUnit && inlineValueUnit,
                                    inlineLabel && segment.datum[inlineLabel]
                                  ].join(' ')
                                )}
                              </text>
                              {inlineSecondaryLabel && (
                                <text
                                  {...styles.inlineLabel}
                                  x={segment.x + iXOffset}
                                  y={
                                    bar.style.inlineTop + bar.style.fontSize + 5
                                  }
                                  dy='1em'
                                  fontSize={bar.style.secondaryFontSize}
                                  fill={inlineFill}
                                  textAnchor={iTextAnchor}
                                >
                                  {subsup.svg(
                                    segment.datum[inlineSecondaryLabel]
                                  )}
                                </text>
                              )}
                            </Fragment>
                          )}
                          {isLollipop && band && (
                            <rect
                              rx={bar.style.popHeight / 2}
                              ry={bar.style.popHeight / 2}
                              x={x(+segment.datum[`${band}_lower`])}
                              y={bar.height / 2 - bar.style.popHeight / 2}
                              width={
                                x(+segment.datum[`${band}_upper`]) -
                                x(+segment.datum[`${band}_lower`])
                              }
                              height={bar.style.popHeight}
                              fill={segment.color}
                              fillOpacity='0.3'
                            />
                          )}
                          {isLollipop && (
                            <circle
                              cx={segment.x + segment.width - 1}
                              cy={bar.height / 2}
                              r={
                                Math.floor(
                                  bar.style.popHeight - bar.style.stroke / 2
                                ) / 2
                              }
                              fill={circleFill}
                              stroke={segment.color}
                              strokeWidth={bar.style.stroke}
                            />
                          )}
                          {showBarValues && (
                            <text
                              {...styles.barLabel}
                              x={
                                valueTextStartAnchor
                                  ? segment.x +
                                    segment.width +
                                    4 +
                                    (isLollipop ? 8 : 0)
                                  : segment.x +
                                    (segment.value >= 0 ? segment.width : 0) -
                                    4
                              }
                              textAnchor={
                                valueTextStartAnchor ? 'start' : 'end'
                              }
                              y={bar.height / 2}
                              dy='.35em'
                            >
                              {xAxis.format(segment.value)}
                            </text>
                          )}
                        </g>
                      )
                    })}
                  </g>
                )
              })}
              {hasXTicks && (
                <g
                  transform={`translate(0,${group.groupHeight +
                    AXIS_BOTTOM_PADDING})`}
                >
                  {xTicks.map((tick, i) => {
                    let textAnchor = 'middle'
                    const isLast = last(xTicks, i)
                    if (isLast) {
                      textAnchor = 'end'
                    }
                    if (i === 0) {
                      textAnchor = 'start'
                    }
                    const highlightTick = tick === 0 && highlightZero
                    return (
                      <g
                        key={`tick${tick}`}
                        transform={`translate(${x(tick)},0)`}
                      >
                        <line
                          {...styles.axisXLine}
                          y1={
                            -AXIS_BOTTOM_PADDING -
                            group.groupHeight +
                            group.firstBarY -
                            (isLollipop ? LOLLIPOP_PADDING : 0)
                          }
                          y2={
                            -AXIS_BOTTOM_PADDING +
                            (isLollipop ? LOLLIPOP_PADDING : 0)
                          }
                          style={{
                            stroke: highlightTick ? baseLineColor : undefined
                          }}
                        />
                        <text
                          {...styles.axisLabel}
                          y={
                            X_TICK_TEXT_MARGIN +
                            (isLollipop ? LOLLIPOP_PADDING : 0)
                          }
                          dy='0.6em'
                          textAnchor={textAnchor}
                          style={{
                            fill: highlightTick ? colors.text : undefined
                          }}
                        >
                          {xAxis.axisFormat(tick, isLast)}
                        </text>
                      </g>
                    )
                  })}
                </g>
              )}
            </g>
          )
        })}
      </svg>
      <div
        style={{ marginTop: !hasXTicks && colorLegendValues.length ? 3 : 0 }}
      >
        <ColorLegend inline values={colorLegendValues} />
        {children}
      </div>
    </>
  )
}

export const propTypes = {
  children: PropTypes.node,
  values: PropTypes.array.isRequired,
  width: PropTypes.number.isRequired,
  mini: PropTypes.bool,
  domain: PropTypes.array,
  y: PropTypes.string,
  xTicks: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number])),
  barStyle: PropTypes.oneOf(Object.keys(BAR_STYLES)),
  band: PropTypes.string,
  bandLegend: PropTypes.string,
  sort: sortPropType,
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
  color: PropTypes.string,
  colorRange: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  colorMap: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  colorSort: sortPropType,
  colorLegend: PropTypes.bool,
  colorLegendValues: PropTypes.arrayOf(PropTypes.string),
  colorRanges: PropTypes.shape({
    diverging2: PropTypes.array.isRequired,
    sequential3: PropTypes.array.isRequired,
    discrete: PropTypes.array.isRequired
  }).isRequired,
  category: PropTypes.string,
  numberFormat: PropTypes.string.isRequired,
  filter: PropTypes.string,
  minInnerWidth: PropTypes.number.isRequired,
  columns: PropTypes.number.isRequired,
  inlineValue: PropTypes.bool,
  inlineValueUnit: PropTypes.string,
  inlineLabel: PropTypes.string,
  inlineSecondaryLabel: PropTypes.string,
  inlineLabelPosition: PropTypes.string,
  tLabel: PropTypes.func.isRequired,
  description: PropTypes.string,
  showBarValues: PropTypes.bool
}

BarChart.propTypes = propTypes

BarChart.defaultProps = {
  columns: 1,
  minInnerWidth: 140,
  barStyle: 'small',
  numberFormat: 's'
}

export const Lollipop = props => <BarChart {...props} />

Lollipop.defaultProps = {
  barStyle: 'lollipop'
}

// Lollipop has additional default props
Lollipop.wrap = 'Bar'

export default BarChart
