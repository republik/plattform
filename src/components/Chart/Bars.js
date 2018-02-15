import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'

import { scaleLinear, scaleOrdinal } from 'd3-scale'
import { max } from 'd3-array'

import { sansSerifRegular12, sansSerifMedium14 } from '../Typography/styles'
import colors from '../../theme/colors'

import {
  calculateAxis, groupBy,
  runSort, sortPropType,
  transparentAxisStroke,
  circleFill,
  deduplicate
} from './utils'
import ColorLegend from './ColorLegend'

const COLUMN_PADDING = 20
const COLUMN_TITLE_HEIGHT = 30
const BAR_LABEL_HEIGHT = 15
const AXIS_BOTTOM_HEIGHT = 20
const AXIS_BOTTOM_PADDING = 8
const X_TICK_HEIGHT = 0
const X_TICK_TEXT_MARGIN = 0

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
  }
}

// This is unsafe
// - all props that are passed to datumFn should not be user defined
//   currently: filter, columnFilter.test, category, highlight
// eslint-disable-next-line no-new-func
const datumFn = code => new Function('datum', `return ${code}`)
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
  axisLabel: css({
    ...sansSerifRegular12,
    fill: colors.lightText
  }),
  axisXLongLine: css({
    stroke: transparentAxisStroke,
    strokeOpacity: 0.6,
    strokeWidth: '1px',
    shapeRendering: 'crispEdges'
  }),
  axisXLine: css({
    stroke: colors.divider,
    strokeWidth: '1px',
    shapeRendering: 'crispEdges'
  }),
  confidenceLegend: css({
    whiteSpace: 'nowrap'
  }),
  confidenceBar: css({
    display: 'inline-block',
    width: 24,
    height: 8,
    backgroundColor: colors.divider,
    borderRadius: '4px'
  })
}

const BarChart = (props) => {
  const {
    values,
    width,
    mini,
    children,
    t,
    description,
    confidence,
    showBarValues
  } = props

  const possibleColumns = Math.floor(width / (props.minInnerWidth + COLUMN_PADDING))
  const columns = possibleColumns >= props.columns ? props.columns : Math.max(possibleColumns, 1)
  const columnWidth = Math.floor((width - (COLUMN_PADDING * (columns - 1))) / columns) - 1

  // filter and map data to clean objects 
  let data = values
  if (props.filter) {
    const filter = datumFn(props.filter)
    data = data.filter(filter)
  }
  data = data.filter(d => d.value && d.value.length > 0).map(d => ({
    datum: d,
    label: d[props.y],
    value: +d.value
  }))
  // compute category
  if (props.category) {
    const categorize = datumFn(props.category)
    data.forEach(d => {
      d.category = categorize(d.datum)
    })
  }
  // sort by value (default lowest on top)
  runSort(props.sort, data, d => d.value)

  // group data into columns
  let groupedData
  if (props.columnFilter) {
    groupedData = props.columnFilter.map(({test, title}) => {
      const filter = datumFn(test)
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
  let colorValues = data.map(colorAccessor)
    .filter(Boolean)
    .filter(deduplicate)
  runSort(props.colorSort, colorValues)
  let colorRange = props.colorRanges[props.colorRange] || props.colorRange
  if (!colorRange) {
    colorRange = colorValues.length > 3 ? props.colorRanges.discrete : props.colorRanges.sequential3
  }
  const color = scaleOrdinal(colorRange).domain(colorValues)

  const highlight = props.highlight
    ? datumFn(props.highlight)
    : () => false

  // first layout run, set y position
  const barStyle = BAR_STYLES[props.barStyle]
  groupedData = groupedData.map(({values: groupData, key: title}) => {
    let gY = 0
    if (title) {
      gY += COLUMN_TITLE_HEIGHT
    }

    let firstBarY
    let stackedBars = groupBy(groupData, d => d.label)
    let marginBottom = 0
    const bars = stackedBars.map(({values: segments}) => {
      const first = segments[0]
      const highlighted = highlight(first.datum)
      const style = barStyle[highlighted ? 'highlighted' : 'normal']

      gY += marginBottom
      let labelY = gY
      gY += BAR_LABEL_HEIGHT
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
        sum: barSegments.reduce(
          (sum, segment) => sum + segment.value,
          0
        )
      }
    })

    return {
      title,
      bars,
      max: max(bars.map(bar => bar.sum)),
      height: gY,
      firstBarY
    }
  })

  // setup x scale
  const x = scaleLinear()
    .domain(props.domain || [0, max(groupedData.map(d => d.max))])
    .range([0, columnWidth])
  if (!props.domain) {
    x.nice(3)
  }
  const xAxis = calculateAxis(props.numberFormat, t, x.domain())

  // stack bars
  groupedData.forEach(group => {
    group.bars.forEach(bar => {
      let xPos = 0
      bar.segments.forEach(d => {
        d.color = color(colorAccessor(d))
        d.x = Math.floor(xPos)
        const size = x(d.value)
        d.width = Math.ceil(size) + 1
        xPos += size
      })
    })
  })

  // rows and columns
  let yPos = 0
  groupBy(groupedData, (d, i) => Math.floor(i / columns)).forEach(({values: groups}) => {
    const height = max(groups.map(d => d.height))

    groups.forEach((group, column) => {
      group.groupHeight = height
      group.y = yPos
      group.x = column * (columnWidth + COLUMN_PADDING)
    })

    yPos += height + AXIS_BOTTOM_HEIGHT
  })

  const isLollipop = props.barStyle === 'lollipop'

  return (
    <div>
      <svg width={width} height={yPos}>
        <desc>{description}</desc>
        {
          groupedData.map(group => {
            return (
              <g key={group.title || 1} transform={`translate(${group.x},${group.y})`}>
                <text dy='1.5em' {...styles.groupTitle}>{group.title}</text>
                {
                  group.bars.map(bar => (
                    <g key={bar.y}>
                      <text {...styles.barLabel} y={bar.labelY} dy='0.9em'>{bar.segments[0].label}</text>
                      {
                        bar.segments.map((segment, i) => (
                          <g key={i} transform={`translate(0,${bar.y})`}>
                            <rect x={segment.x} fill={segment.color} width={segment.width} height={bar.height} />
                            {isLollipop && confidence &&
                              <rect
                                rx={bar.style.popHeight / 2} ry={bar.style.popHeight / 2}
                                x={x(segment.datum[`confidence${confidence}_lower`])}
                                y={(bar.height / 2) - (bar.style.popHeight / 2)}
                                width={x(segment.datum[`confidence${confidence}_upper`]) - x(segment.datum[`confidence${confidence}_lower`])}
                                height={bar.style.popHeight}
                                fill={segment.color}
                                fillOpacity='0.3' />
                            }
                            {isLollipop && <circle
                              cx={segment.x + segment.width}
                              cy={bar.height / 2}
                              r={Math.floor(bar.style.popHeight - (bar.style.stroke / 2)) / 2}
                              fill={circleFill}
                              stroke={segment.color}
                              strokeWidth={bar.style.stroke} />}
                            {showBarValues && (<text
                              {...styles.barLabel}
                              x={segment.x + segment.width + 4}
                              y={bar.height / 2}
                              dy={'.35em'}
                            >
                             {xAxis.format(segment.value)}
                            </text>)}
                          </g>
                        ))
                      }
                    </g>
                  ))
                }
                <g transform={`translate(0,${group.groupHeight + AXIS_BOTTOM_PADDING})`}>
                  {X_TICK_HEIGHT > 0 && 
                    <line {...styles.axisXLine} x2={columnWidth} />}
                  {
                    xAxis.ticks.map((tick, i) => {
                      let textAnchor = 'middle'
                      const isLast = last(xAxis.ticks, i)
                      if (isLast) {
                        textAnchor = 'end'
                      }
                      if (i === 0) {
                        textAnchor = 'start'
                      }
                      return (
                        <g key={tick} transform={`translate(${x(tick)},0)`}>
                          <line {...styles.axisXLongLine} y1={-AXIS_BOTTOM_PADDING - group.groupHeight + group.firstBarY} y2={-AXIS_BOTTOM_PADDING} />
                          {X_TICK_HEIGHT > 0 &&
                            <line {...styles.axisXLine} y2={X_TICK_HEIGHT} />}
                          <text {...styles.axisLabel} y={X_TICK_HEIGHT + X_TICK_TEXT_MARGIN} dy='0.6em' textAnchor={textAnchor}>
                            {xAxis.axisFormat(tick, isLast)}
                          </text>
                        </g>
                      )
                    })
                  }
                </g>
              </g>
            )
          })
        }
      </svg>
      <div>
        <ColorLegend inline values={(
          []
            .concat(props.colorLegend && colorValues.length > 0 && colorValues.map(colorValue => (
              {color: color(colorValue), label: colorValue}
            )))
            .concat(!mini && confidence && {label: (
              <span {...styles.confidenceLegend}>
                <span {...styles.confidenceBar} />
                {` ${t(`styleguide/charts/confidence${confidence}-legend`)}`}
              </span>
            )})
            .filter(Boolean)
        )}/>
        {children}
      </div>
    </div>
  )
}

BarChart.propTypes = {
  children: PropTypes.node,
  values: PropTypes.array.isRequired,
  width: PropTypes.number.isRequired,
  mini: PropTypes.bool,
  domain: PropTypes.array,
  y: PropTypes.string.isRequired,
  barStyle: PropTypes.oneOf(Object.keys(BAR_STYLES)),
  confidence: PropTypes.oneOf([95]),
  sort: sortPropType,
  column: PropTypes.string,
  columnSort: sortPropType,
  columnFilter: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    test: PropTypes.string.isRequired
  })),
  highlight: PropTypes.string,
  stroke: PropTypes.string,
  color: PropTypes.string,
  colorRange: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  colorSort: sortPropType,
  colorLegend: PropTypes.bool,
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
  t: PropTypes.func.isRequired,
  description: PropTypes.string,
  showBarValues: PropTypes.bool
}

BarChart.defaultProps = {
  columns: 1,
  minInnerWidth: 140,
  barStyle: 'small',
  numberFormat: 's'
}

export const Lollipop = props => <BarChart {...props} />

Lollipop.defaultProps = {
  barStyle: 'lollipop',
  confidence: 95
}

export default BarChart
