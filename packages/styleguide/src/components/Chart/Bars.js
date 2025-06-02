import React, { Fragment, useMemo } from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'

import { scaleLinear } from 'd3-scale'
import { max, min } from 'd3-array'

import { sansSerifRegular12, sansSerifMedium14 } from '../Typography/styles'
import { fontFamilies } from '../../theme/fonts'
import { underline } from '../../lib/styleMixins'
import { useColorContext } from '../Colors/useColorContext'
import { defaultProps } from './ChartContext'

import { sansSerifRegular12 as LABEL_FONT } from '../Typography/styles'
import {
  calculateAxis,
  groupBy,
  runSort,
  sortPropType,
  deduplicate,
  unsafeDatumFn,
  subsup,
  getTextColor,
  isLastItem,
} from './utils'
import ColorLegend from './ColorLegend'
import { createTextGauger } from '../../lib/textGauger'

import { getColorMapper } from './colorMaps'

const COLUMN_PADDING = 20
const COLUMN_TITLE_HEIGHT = 30
const BAR_LABEL_HEIGHT = 15
const AXIS_HEIGHT = 20
const LOLLIPOP_PADDING = 7 // half of max pop height

const BAR_STYLES = {
  lollipop: {
    highlighted: {
      marginTop: 4,
      height: 6,
      stroke: 4,
      popHeight: 14,
      marginBottom: 16,
    },
    normal: {
      marginTop: 4,
      height: 3,
      stroke: 3,
      popHeight: 13,
      marginBottom: 9,
    },
  },
  small: {
    highlighted: {
      marginTop: 0,
      height: 24,
      marginBottom: 16,
    },
    normal: {
      marginTop: 0,
      height: 16,
      marginBottom: 9,
    },
  },
  large: {
    highlighted: {
      marginTop: 0,
      height: 40,
      marginBottom: 40,
    },
    normal: {
      marginTop: 0,
      height: 24,
      marginBottom: 16,
    },
  },
  inline: {
    withSecondary: {
      marginTop: 0,
      height: 50,
      marginBottom: 9,
      fontSize: 16,
      secondaryFontSize: 12,
      inlineTop: 6,
    },
    normal: {
      marginTop: 0,
      height: 20,
      marginBottom: 9,
      fontSize: 12,
      inlineTop: 2,
    },
  },
}

const styles = {
  groupTitle: css({
    ...sansSerifMedium14,
  }),
  barLabel: css({
    ...sansSerifRegular12,
  }),
  barLabelLink: css({
    ...underline,
  }),
  inlineLabel: css({
    fontFamily: fontFamilies.sansSerifRegular,
    fontWeight: 'normal',
  }),
  axisLabel: css({
    ...sansSerifRegular12,
  }),
  axisXLine: css({
    strokeWidth: '1px',
    shapeRendering: 'crispEdges',
  }),
  bandLegend: css({
    whiteSpace: 'nowrap',
  }),
  bandBar: css({
    display: 'inline-block',
    width: 24,
    height: 8,
    borderRadius: '4px',
  }),
}

const labelGauger = createTextGauger(LABEL_FONT, {
  dimension: 'width',
  html: true,
})

const BarChart = (_props) => {
  const props = { ...defaultProps.Bar, ..._props }
  const {
    values,
    width,
    mini,
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
    link,
    unit,
  } = props
  const [colorScheme] = useColorContext()
  const possibleColumns = Math.floor(
    width / (props.minInnerWidth + COLUMN_PADDING),
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
    .filter((d) => d.value && d.value.length > 0)
    .map((d) => ({
      datum: d,
      label: d[props.y],
      value: +d.value,
    }))
  // compute category
  if (props.category) {
    const categorize = unsafeDatumFn(props.category)
    data.forEach((d) => {
      d.category = categorize(d.datum)
    })
  }
  // sort by value (default lowest on top)
  runSort(props.sort, data, (d) => d.value)

  // group data into columns
  let groupedData
  if (props.columnFilter) {
    groupedData = props.columnFilter.map(({ test, title }) => {
      const filter = unsafeDatumFn(test)
      return {
        key: title,
        values: data.filter((d) => filter(d.datum)),
      }
    })
    data = groupedData.reduce((all, group) => all.concat(group.values), [])
  } else {
    groupedData = groupBy(data, (d) => d.datum[props.column])
  }
  runSort(props.columnSort, groupedData, (d) => d.key)

  const skipYLabels = props.y === props.color && groupedData.length > 1

  // compute colors
  const colorAccessor = props.color
    ? (d) => d.datum[props.color]
    : (d) => d.category
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
    let stackedBars = groupBy(groupData, (d) => d.label)
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
      if (!skipYLabels && first.label) {
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
        sumPositiv: barSegments.reduce(
          (sum, segment) => sum + Math.max(0, segment.value),
          0,
        ),
        sumNegative: barSegments.reduce(
          (sum, segment) => sum + Math.min(0, segment.value),
          0,
        ),
      }
    })

    return {
      title,
      bars,
      maxPositiv: max(bars, (bar) => bar.sumPositiv),
      minNegative: min(bars, (bar) => bar.sumNegative),
      height: gY,
      firstBarY,
    }
  })

  // setup x scale
  const xDomain = props.domain || [
    Math.min(
      0,
      min(groupedData.map((d) => d.minNegative).concat(props.xTicks || [])),
    ),
    Math.max(
      0,
      max(groupedData.map((d) => d.maxPositiv).concat(props.xTicks || [])),
    ),
  ]
  const x = scaleLinear().domain(xDomain).range([0, columnWidth])
  if (!props.domain) {
    x.nice(3)
  }

  const xAxis = calculateAxis(
    props.numberFormat,
    tLabel,
    x.domain(),
    undefined,
    {
      ticks: props.xTicks,
    },
  )

  const xTicks = props.xTicks || (showBarValues ? [] : xAxis.ticks)
  const hasXTicks = !inlineValue && !!xTicks.length

  const xZero = x(0)
  const xLastTick = hasXTicks && x(xTicks[xTicks.length - 1])

  // stack bars
  groupedData.forEach((group) => {
    group.bars.forEach((bar) => {
      let xPosPositive = xZero
      let xPosNegative = xZero
      bar.segments.forEach((d, i) => {
        d.color = color(colorAccessor(d))
        const size = x(d.value) - xZero
        d.x =
          size > 0 ? Math.floor(xPosPositive) : Math.floor(xPosNegative + size)

        d.width = Math.ceil(Math.abs(size))
        // snap last to last xTick if within one pixel
        if (
          xLastTick &&
          isLastItem(bar.segments, i) &&
          Math.abs(xLastTick - d.x - d.width) === 1
        ) {
          d.width += xLastTick - d.x - d.width
        }

        if (size > 0) {
          xPosPositive += size
        } else {
          xPosNegative += size
        }
        const isLast = isLastItem(bar.segments, i)
        d.valueTextStartAnchor =
          (d.value >= 0 && isLast) || (d.value < 0 && i !== 0)
        const isLastSegment = isLast && i !== 0

        d.inlineLabel = [
          inlineValue && xAxis.format(d.value),
          inlineValueUnit && inlineValueUnit,
          inlineLabel && d.datum[inlineLabel],
        ].join(' ')
        d.inlineLabelTextWidth = d.inlineLabel ? labelGauger(d.inlineLabel) : 0
        const needsInlineTextShift = d.width <= d.inlineLabelTextWidth

        d.inlinePos =
          d.datum[inlineLabelPosition] ||
          (d.value >= 0
            ? isLastSegment && !needsInlineTextShift
              ? 'right'
              : 'left'
            : isLastSegment && !needsInlineTextShift
            ? 'left'
            : 'right')

        d.shiftInlineText = isLast && needsInlineTextShift

        if (d.inlinePos === 'right') {
          d.iTextAnchor = 'end'
          d.iXOffset = d.width - 5
          if (d.shiftInlineText) {
            d.iXOffset = -5
          }
        } else if (d.inlinePos === 'left') {
          d.iTextAnchor = 'start'
          d.iXOffset = 5
          if (d.shiftInlineText) {
            d.iXOffset = d.width + 5
          }
        } else {
          d.iTextAnchor = 'middle'
          d.iXOffset = d.width / 2
        }
      })
      bar.xPosPositive = xPosPositive
      bar.xPosNegative = xPosNegative
    })
  })

  const isLollipop = props.barStyle === 'lollipop'

  // rows and columns
  let yPos = 0
  groupBy(groupedData, (d, i) => Math.floor(i / columns)).forEach(
    ({ values: groups }) => {
      const height = max(groups.map((d) => d.height))

      groups.forEach((group, column) => {
        group.groupHeight = height
        group.y = yPos
        group.x = column * (columnWidth + COLUMN_PADDING)
      })

      yPos +=
        height +
        (hasXTicks ? AXIS_HEIGHT : 0) +
        (isLollipop ? LOLLIPOP_PADDING : 0)
    },
  )

  const highlightZero = xTicks.indexOf(0) !== -1 && xTicks[0] !== 0

  const colorLegendValues = []
    .concat(
      (props.colorLegend || skipYLabels) &&
        (props.colorLegendValues || colorValues).map((colorValue) => ({
          color: color(colorValue),
          label: colorValue,
        })),
    )
    .concat(
      !mini &&
        band &&
        bandLegend && {
          label: (
            <span {...styles.bandLegend}>
              <span
                {...styles.bandBar}
                {...colorScheme.set('backgroundColor', 'divider')}
              />
              {` ${bandLegend}`}
            </span>
          ),
        },
    )
    .filter(Boolean)

  const barLabelLinkHoverRule = useMemo(
    () =>
      css({
        '@media (hover)': {
          ':hover': {
            fill: colorScheme.getCSSColor('textSoft'),
          },
        },
      }),
    [colorScheme],
  )

  return (
    <>
      <ColorLegend inline values={colorLegendValues} />
      <svg width={width} height={yPos}>
        <desc>{description}</desc>
        {groupedData.map((group) => {
          return (
            <g
              key={`group${group.title || 1}`}
              transform={`translate(${group.x},${
                group.y + (hasXTicks ? AXIS_HEIGHT : 0)
              })`}
            >
              <text
                dy='1.5em'
                y={hasXTicks ? -AXIS_HEIGHT : 0}
                {...styles.groupTitle}
                {...colorScheme.set('fill', 'text')}
              >
                {group.title}
              </text>
              {group.bars.map((bar) => {
                const href = bar.first.datum[link]
                const hasNegativeValues = bar.xPosNegative !== xZero
                const hasPositiveValues = bar.xPosPositive !== xZero
                let barLabel = skipYLabels ? null : (
                  <text
                    {...styles.barLabel}
                    {...colorScheme.set('fill', 'text')}
                    {...(href && barLabelLinkHoverRule)}
                    y={bar.labelY}
                    dy='0.9em'
                    x={
                      x(0) +
                      (highlightZero
                        ? hasPositiveValues && hasNegativeValues
                          ? 0
                          : hasPositiveValues
                          ? 2
                          : -2
                        : 0)
                    }
                    textAnchor={
                      hasPositiveValues && hasNegativeValues
                        ? 'middle'
                        : hasPositiveValues
                        ? 'start'
                        : 'end'
                    }
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
                    {bar.segments
                      .sort((a, b) => {
                        if (
                          !inlineLabel ||
                          (a.datum[inlineLabel] && b.datum[inlineLabel]) ||
                          (!a.datum[inlineLabel] && !b.datum[inlineLabel])
                        ) {
                          return 0
                        }
                        return a.datum[inlineLabel] ? 1 : -1
                      })
                      .map((segment, i) => (
                        <g key={`seg${i}`} transform={`translate(0,${bar.y})`}>
                          <rect
                            x={segment.x}
                            {...colorScheme.set(
                              'fill',
                              segment.color,
                              'charts',
                            )}
                            width={segment.width}
                            height={bar.height}
                          />
                          {(inlineValue || inlineLabel) && (
                            <Fragment>
                              <text
                                {...styles.inlineLabel}
                                x={segment.x + segment.iXOffset}
                                y={bar.style.inlineTop}
                                dy='1em'
                                fontSize={bar.style.fontSize}
                                {...colorScheme.set(
                                  'fill',
                                  segment.shiftInlineText
                                    ? 'text'
                                    : getTextColor(segment.color),
                                )}
                                textAnchor={segment.iTextAnchor}
                              >
                                {subsup.svg(segment.inlineLabel)}
                              </text>
                              {inlineSecondaryLabel && (
                                <text
                                  {...styles.inlineLabel}
                                  x={segment.x + segment.iXOffset}
                                  y={
                                    bar.style.inlineTop + bar.style.fontSize + 5
                                  }
                                  dy='1em'
                                  fontSize={bar.style.secondaryFontSize}
                                  {...colorScheme.set(
                                    'fill',
                                    segment.shiftInlineText
                                      ? 'text'
                                      : getTextColor(segment.color),
                                  )}
                                  textAnchor={segment.iTextAnchor}
                                >
                                  {subsup.svg(
                                    segment.datum[inlineSecondaryLabel],
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
                              {...colorScheme.set(
                                'fill',
                                segment.color,
                                'charts',
                              )}
                              height={bar.style.popHeight}
                              fillOpacity='0.3'
                            />
                          )}
                          {isLollipop && (
                            <circle
                              cx={
                                segment.x +
                                (segment.value >= 0 ? segment.width - 1 : 0)
                              }
                              cy={bar.height / 2}
                              r={
                                Math.floor(
                                  bar.style.popHeight - bar.style.stroke / 2,
                                ) / 2
                              }
                              {...colorScheme.set('fill', 'textInverted')}
                              {...colorScheme.set(
                                'stroke',
                                segment.color,
                                'charts',
                              )}
                              strokeWidth={bar.style.stroke}
                            />
                          )}
                        </g>
                      ))}
                    {showBarValues && (
                      <>
                        {bar.sumNegative && (
                          <text
                            {...styles.barLabel}
                            {...colorScheme.set('fill', 'text')}
                            x={bar.xPosNegative - 6 - (isLollipop ? 8 : 0)}
                            textAnchor='end'
                            y={bar.y + bar.height / 2}
                            dy='.35em'
                          >
                            {xAxis.format(bar.sumNegative)} {unit}
                          </text>
                        )}
                        {bar.sumPositiv && (
                          <text
                            {...styles.barLabel}
                            {...colorScheme.set('fill', 'text')}
                            x={bar.xPosPositive + 6 + (isLollipop ? 8 : 0)}
                            textAnchor='start'
                            y={bar.y + bar.height / 2}
                            dy='.35em'
                          >
                            {xAxis.format(bar.sumPositiv)} {unit}
                          </text>
                        )}
                      </>
                    )}
                  </g>
                )
              })}
              {hasXTicks && (
                <g
                  transform={`translate(0,${
                    group.title ? COLUMN_TITLE_HEIGHT : 0
                  })`}
                >
                  {xTicks.map((tick, i) => {
                    let textAnchor = 'middle'
                    const isLast = isLastItem(xTicks, i)
                    if (isLast) {
                      textAnchor = 'end'
                    }
                    if (i === 0) {
                      textAnchor = 'start'
                    }
                    const highlightTick = tick === 0 && highlightZero
                    return (
                      <g
                        data-axis
                        key={`tick${tick}`}
                        transform={`translate(${x(tick)},0)`}
                      >
                        <line
                          {...styles.axisXLine}
                          {...colorScheme.set('stroke', 'text')}
                          style={{
                            opacity: highlightTick ? 1 : 0.17,
                          }}
                          y1={0}
                          y2={group.groupHeight}
                        />
                        <text
                          {...styles.axisLabel}
                          {...(highlightTick
                            ? colorScheme.set('fill', 'text')
                            : colorScheme.set('fill', 'textSoft'))}
                          y={0}
                          dy='-0.5em'
                          textAnchor={textAnchor}
                        >
                          {xAxis.axisFormat(tick, isLast)} {isLast && unit}
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
    </>
  )
}

export const propTypes = {
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
      test: PropTypes.string.isRequired,
    }),
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
    discrete: PropTypes.array.isRequired,
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
  showBarValues: PropTypes.bool,
  unit: PropTypes.string,
}

BarChart.propTypes = propTypes

export const Lollipop = (props) => (
  <BarChart {...defaultProps.Lollipop} {...props} />
)

// Lollipop has additional default props
Lollipop.wrap = 'Bar'

export default BarChart
