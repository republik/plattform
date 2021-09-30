import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { min, max } from 'd3-array'
import { scalePoint, scaleTime, scaleLinear } from 'd3-scale'
import { timeYear } from 'd3-time'
import { useColorContext } from '../Colors/useColorContext'
import { ChartContext } from './ChartContext'
import LineGroup from './LineGroup'

import {
  sansSerifRegular12,
  sansSerifMedium12,
  sansSerifMedium14,
  sansSerifMedium22
} from '../Typography/styles'
import { timeFormat } from '../../lib/timeFormat'

import {
  groupByLines,
  addLabels,
  calculateAndMoveLabelY,
  Y_END_LABEL_SPACE
} from './Lines.utils'

import layout, {
  LABEL_FONT,
  VALUE_FONT,
  Y_GROUP_MARGIN,
  yScales
} from './Lines.layout'

import {
  deduplicate,
  sortPropType,
  sortBy,
  getFormat,
  getColumnLayout,
  unsafeDatumFn,
  calculateAxis
} from './utils'
import { getColorMapper } from './colorMaps'

import ColorLegend from './ColorLegend'

const styles = {
  columnTitle: css({
    ...sansSerifMedium14
  }),
  axisLabel: css({
    ...sansSerifRegular12
  }),
  axisYLine: css({
    strokeWidth: '1px',
    shapeRendering: 'crispEdges'
  }),
  axisXLine: css({
    strokeWidth: '1px',
    shapeRendering: 'crispEdges'
  }),
  annotationLine: css({
    strokeWidth: '1px',
    fillRule: 'evenodd',
    strokeLinecap: 'round',
    strokeDasharray: '1,3',
    strokeLinejoin: 'round'
  }),
  annotationText: css({
    ...sansSerifRegular12
  }),
  annotationValue: css({
    ...sansSerifMedium12
  }),
  value: css({
    ...VALUE_FONT
  }),
  valueMini: css({
    ...sansSerifMedium22
  }),
  label: css({
    ...LABEL_FONT
  }),
  bandLegend: css({
    ...sansSerifRegular12,
    whiteSpace: 'nowrap'
  }),
  bandBar: css({
    display: 'inline-block',
    width: 24,
    height: 11,
    marginBottom: -1,
    borderTopWidth: 4,
    borderBottomWidth: 4,
    borderTopStyle: 'solid',
    borderBottomStyle: 'solid'
  })
}

const LineChart = props => {
  const { width, mini, description, band, bandLegend, endDy } = props

  const {
    data,
    xParser,
    yNeedsConnectors,
    xAccessor,
    y,
    yCut,
    yCutHeight,
    yConnectorSize,
    yAnnotations,
    xAnnotations,
    colorLegend,
    colorLegendValues,
    paddingLeft,
    paddingRight,
    tLabel
  } = layout(props)

  const [colorScheme] = useColorContext()
  const chartContext = React.useContext(ChartContext)

  const yAxis = calculateAxis(
    props.numberFormat,
    tLabel,
    chartContext.y.domain(),
    props.unit,
    {
      ticks: props.yTicks
    }
  )

  let xTicks = props.xTicks && props.xTicks.map(xParser)
  const xValues = data.map(xAccessor).concat(xTicks || [])
  let x
  let xFormat = d => d
  if (props.xScale === 'time') {
    xFormat = timeFormat(props.timeFormat)
    const xTimes = xValues.map(d => d.getTime())
    const domainTime = [min(xTimes), max(xTimes)]
    const domain = domainTime.map(d => new Date(d))
    x = scaleTime().domain(domain)

    if (!xTicks) {
      let yearInteval = Math.round(timeYear.count(domain[0], domain[1]) / 3)

      let time1 = timeYear.offset(domain[0], yearInteval).getTime()
      let time2 = timeYear.offset(domain[1], -yearInteval).getTime()

      xTicks = [
        domainTime[0],
        sortBy(xTimes, d => Math.abs(d - time1))[0],
        sortBy(xTimes, d => Math.abs(d - time2))[0],
        domainTime[1]
      ]
        .filter(deduplicate)
        .map(d => new Date(d))
    }
  } else if (props.xScale === 'linear') {
    const domain = [min(xValues), max(xValues)]
    x = scaleLinear().domain(domain)
    xTicks = xTicks || domain
    xFormat = getFormat(props.xNumberFormat || props.numberFormat, props.tLabel)
  } else {
    const domain = xValues.filter(deduplicate)
    x = scalePoint().domain(domain)
    if (!xTicks && domain.length > 5) {
      let maxIndex = domain.length - 1
      xTicks = [
        domain[0],
        domain[Math.round(maxIndex * 0.33)],
        domain[Math.round(maxIndex * 0.66)],
        domain[maxIndex]
      ].filter(deduplicate)
    } else if (!xTicks) {
      xTicks = domain
    }
  }
  if (mini) {
    xTicks = [xTicks[0], xTicks[xTicks.length - 1]]
  }
  x.range([0, chartContext.innerWidth])

  const visibleColorLegendValues = []
    .concat(props.colorLegend !== false && colorLegend && colorLegendValues)
    .concat(
      !mini &&
        band &&
        bandLegend && {
          label: (
            <span {...styles.bandLegend} {...colorScheme.set('color', 'text')}>
              <span
                {...styles.bandBar}
                {...colorScheme.set('backgroundColor', 'text')}
                {...colorScheme.set('borderTopColor', 'divider')}
                {...colorScheme.set('borderBottomColor', 'divider')}
              />
              {` ${bandLegend}`}
            </span>
          )
        }
    )
    .filter(Boolean)

  return (
    <>
      <div style={{ paddingLeft, paddingRight }}>
        <ColorLegend inline values={visibleColorLegendValues} />
      </div>
      <svg width={width} height={chartContext.height}>
        <desc>{description}</desc>
        {chartContext.groupedData.map(({ values: lines, key }) => {
          return (
            <g
              key={key || 1}
              transform={`translate(${chartContext.group.x(key) +
                paddingLeft},${chartContext.group.y(key)})`}
            >
              <LineGroup
                mini={mini}
                title={key}
                lines={lines}
                x={x}
                xTicks={xTicks}
                xAccessor={xAccessor}
                xFormat={xFormat}
                xUnit={props.xUnit}
                y={chartContext.y}
                yTicks={props.yTicks || yAxis.ticks}
                yAxisFormat={yAxis.axisFormat}
                band={band}
                yCut={yCut}
                yCutHeight={yCutHeight}
                yConnectorSize={yConnectorSize}
                yNeedsConnectors={yNeedsConnectors}
                yAnnotations={yAnnotations}
                xAnnotations={xAnnotations}
                endDy={endDy}
                width={chartContext.innerWidth}
                paddingRight={paddingRight}
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
  width: PropTypes.number.isRequired,
  mini: PropTypes.bool,
  x: PropTypes.string.isRequired,
  xUnit: PropTypes.string,
  xScale: PropTypes.oneOf(['time', 'ordinal', 'linear']),
  xNumberFormat: PropTypes.string,
  xSort: sortPropType,
  xTicks: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  ),
  yScale: PropTypes.oneOf(Object.keys(yScales)),
  timeParse: PropTypes.string.isRequired,
  timeFormat: PropTypes.string.isRequired,
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
  labelFilter: PropTypes.string,
  color: PropTypes.string,
  colorSort: sortPropType,
  colorRange: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  colorRanges: PropTypes.shape({
    sequential3: PropTypes.array.isRequired,
    discrete: PropTypes.array.isRequired
  }).isRequired,
  colorMap: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  colorLegend: PropTypes.bool,
  colorLegendValues: PropTypes.arrayOf(PropTypes.string),
  category: PropTypes.string,
  band: PropTypes.string,
  bandLegend: PropTypes.string,
  numberFormat: PropTypes.string.isRequired,
  zero: PropTypes.bool.isRequired,
  filter: PropTypes.string,
  startValue: PropTypes.bool.isRequired,
  endLabel: PropTypes.bool.isRequired,
  endLabelWidth: PropTypes.number,
  endDy: PropTypes.string.isRequired,
  minInnerWidth: PropTypes.number.isRequired,
  columns: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  paddingTop: PropTypes.number,
  paddingRight: PropTypes.number,
  paddingLeft: PropTypes.number,
  unit: PropTypes.string,
  yNice: PropTypes.number,
  yTicks: PropTypes.arrayOf(PropTypes.number),
  yAnnotations: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.number.isRequired,
      unit: PropTypes.string,
      label: PropTypes.string,
      x: PropTypes.string,
      dy: PropTypes.string,
      showValue: PropTypes.bool
    })
  ),
  xAnnotations: PropTypes.arrayOf(
    PropTypes.shape({
      valuePrefix: PropTypes.string,
      value: PropTypes.number.isRequired,
      unit: PropTypes.string,
      label: PropTypes.string,
      x: PropTypes.string,
      x1: PropTypes.string,
      x2: PropTypes.string,
      position: PropTypes.oneOf(['top', 'bottom']),
      showValue: PropTypes.bool
    })
  ),
  tLabel: PropTypes.func.isRequired,
  description: PropTypes.string
}

LineChart.propTypes = propTypes

export const Line = props => <LineChart {...props} />

Line.defaultProps = {
  x: 'year',
  xScale: 'time',
  yScale: 'linear',
  timeParse: '%Y',
  timeFormat: '%Y',
  numberFormat: '.0%',
  zero: true,
  unit: '',
  startValue: false,
  endValue: true,
  endLabel: true,
  endDy: '0.3em',
  minInnerWidth: 110,
  columns: 1,
  height: 240,
  yNice: 3
}

export const Slope = props => <LineChart {...props} />

Slope.defaultProps = {
  x: 'year',
  xScale: 'ordinal',
  yScale: 'linear',
  timeParse: '%Y',
  timeFormat: '%Y',
  numberFormat: '.0%',
  zero: true,
  unit: '',
  startValue: true,
  endValue: true,
  endLabel: false,
  endDy: '0.3em',
  minInnerWidth: 90,
  columns: 2,
  height: 240,
  yNice: 3
}

// Additional Info for Docs
// - Slope just has different default props
Slope.base = 'Line'
