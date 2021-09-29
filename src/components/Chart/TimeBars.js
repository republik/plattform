import PropTypes from 'prop-types'
import React from 'react'
import { ascending } from 'd3-array'
import { calculateAxis, sortPropType } from './utils'
import { getColorMapper } from './colorMaps'
import ColorLegend from './ColorLegend'
import TimeBarGroup from './TimeBarGroup'
import { intervals } from './TimeBars.utils'
import XAxis from './XAxis'
import { ChartContext } from './ChartContext'

const PADDING_TOP = 24

const TimeBarChart = props => {
  const {
    width,
    tLabel,
    description,
    yAnnotations,
    xAnnotations,
    xTicks,
    xUnit,
    yScaleInvert,
    height: innerHeight
  } = props

  const chartContextValue = React.useContext(ChartContext)

  chartContextValue.groupedData.forEach(group => {
    group.bars.forEach(bar => {
      let upValue = 0
      let upPos = chartContextValue.y(0)
      let downValue = 0
      let downPos = chartContextValue.y(0)
      bar.segments.forEach(segment => {
        const isPositive = yScaleInvert ? segment.value < 0 : segment.value > 0
        const baseValue = isPositive ? upValue : downValue
        const y0 = chartContextValue.y(baseValue)
        const y1 = chartContextValue.y(baseValue + segment.value)
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
  })

  const yAxis = calculateAxis(
    props.numberFormat,
    tLabel,
    chartContextValue.y.domain(),
    tLabel(props.unit),
    {
      ticks: props.yTicks
    }
  )
  const yTicks = (props.yTicks || yAxis.ticks).sort(ascending)

  const color = getColorMapper(props, chartContextValue.colorValues)

  const colorLegendValues = []
    .concat(
      props.colorLegend &&
        (props.colorLegendValues || chartContextValue.colorValues).map(
          colorValue => ({
            color: color(colorValue),
            label: tLabel(colorValue)
          })
        )
    )
    .filter(Boolean)

  const xAxis = (
    <XAxis
      xTicks={xTicks}
      width={chartContextValue.innerWidth}
      xValues={chartContextValue.xValues}
      xNormalizer={chartContextValue.xNormalizer}
      x={chartContextValue.xScaleDomain.x}
      xDomain={chartContextValue.xScaleDomain.xDomain}
      format={chartContextValue.formatXAxis}
      xUnit={xUnit}
      strong={chartContextValue.y.domain()[0] !== 0}
      yScaleInvert={yScaleInvert}
    />
  )

  return (
    <>
      <ColorLegend inline values={colorLegendValues} />
      <svg width={width} height={chartContextValue.height}>
        <desc>{description}</desc>
        {chartContextValue.groupedData.map(({ bars, key }) => {
          return (
            <g
              key={key || 1}
              transform={`translate(${chartContextValue.gx(
                key
              )},${chartContextValue.gy(key)})`}
            >
              <TimeBarGroup
                bars={bars}
                title={key}
                xAnnotations={xAnnotations}
                yAnnotations={yAnnotations}
                yTicks={yTicks}
                x={chartContextValue.xScaleDomain.x}
                y={chartContextValue.y}
                xNormalizer={chartContextValue.xNormalizer}
                yAxis={yAxis}
                width={chartContextValue.innerWidth}
                xAxis={xAxis}
                xAxisPos={
                  yScaleInvert
                    ? PADDING_TOP + chartContextValue.columnTitleHeight
                    : innerHeight +
                      PADDING_TOP +
                      chartContextValue.columnTitleHeight
                }
                tLabel={tLabel}
                color={d => color(chartContextValue.colorAccessor(d))}
                yScaleInvert={yScaleInvert}
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
  xUnit: PropTypes.string,
  numberFormat: PropTypes.string.isRequired,
  filter: PropTypes.string,
  tLabel: PropTypes.func.isRequired,
  description: PropTypes.string,
  column: PropTypes.string,
  columnSort: sortPropType,
  columnFilter: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      test: PropTypes.string.isRequired
    })
  ),
  columns: PropTypes.number.isRequired,
  minInnerWidth: PropTypes.number.isRequired,
  yScaleInvert: PropTypes.bool
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
  xUnit: '',
  colorLegend: true,
  xIntervalStep: 1,
  yAnnotations: [],
  xAnnotations: [],
  columns: 1,
  minInnerWidth: 240
}

export default TimeBarChart
