import React from 'react'
import PropTypes from 'prop-types'

import ColorLegend from './ColorLegend'
import { scaleSqrt } from 'd3-scale'
import { ascending, max } from 'd3-array'
import {
  calculateAxis,
  runSort,
  deduplicate,
  sortPropType,
  get3EqualDistTicks,
  getFormat,
  groupInColumns,
  getColumnLayout,
  xAccessor,
  yAccessor,
} from './utils'
import { getColorMapper } from './colorMaps'
import {
  aggregateValues,
  getPlot,
  tickAccessor,
  scales,
} from './ScatterPlots.utils'
import ScatterPlotGroup from './ScatterPlotGroup'
import { defaultProps } from './ChartContext'

const COLUMN_PADDING = 28
const COLUMN_TITLE_HEIGHT = 24

const ScatterPlot = ({
  values,
  width,
  height: userHeight,
  heightRatio,
  x,
  xUnit,
  xNice,
  xTicks,
  xLines,
  xScale,
  xNumberFormat,
  xShowValue,
  y,
  yUnit,
  yNice,
  yTicks,
  yLines,
  yScale,
  yNumberFormat,
  yShowValue,
  numberFormat,
  opacity,
  color,
  colorLegend,
  colorLegendValues,
  colorRange,
  colorRanges,
  colorMap,
  colorSort,
  colorDarkMapping,
  pointSize,
  sizeRangeMax,
  sizeUnit,
  sizeNumberFormat,
  sizeShowValue,
  label,
  inlineLabel,
  inlineLabelPosition,
  inlineSecondaryLabel,
  detail,
  tLabel,
  description,
  paddingTop,
  paddingRight,
  paddingBottom,
  paddingLeft,
  tooltipLabel,
  tooltipBody,
  column,
  columnSort,
  columnFilter,
  columns,
  minInnerWidth,
  annotations,
  allowCanvasRendering,
  ...props
}) => {
  const data = values
    .filter((d) => d[x] && d[x].length > 0 && d[y] && d[y].length > 0)
    .map((d) => {
      const sizeDataColumn = pointSize || props.size || 'size'
      const dSize = d[sizeDataColumn]
      return {
        datum: d,
        x: +d[x],
        y: +d[y],
        size: dSize === undefined ? 1 : +d[sizeDataColumn] || 0,
      }
    })

  const groupedData = groupInColumns(data, column, columnFilter)

  const columnTitleHeight = column ? COLUMN_TITLE_HEIGHT : 0
  const { height, innerWidth, innerHeight, gx, gy } = getColumnLayout(
    columns,
    groupedData,
    width - paddingLeft - paddingRight,
    minInnerWidth,
    (innerWidth) =>
      (userHeight || innerWidth * heightRatio) + columnTitleHeight,
    columnSort,
    paddingTop,
    paddingRight + COLUMN_PADDING / 2,
    paddingBottom,
    paddingLeft + COLUMN_PADDING / 2,
    COLUMN_PADDING,
    true,
  )

  // setup x axis
  const xValues = aggregateValues(data, xAccessor, xTicks, xLines)
    .concat(annotations.map((annotation) => annotation.x1))
    .concat(annotations.map((annotation) => annotation.x2))
  const plotX = getPlot(
    xScale,
    xValues,
    [paddingLeft, innerWidth + paddingLeft],
    xNice,
    innerWidth,
  )
  const xAxis = calculateAxis(
    xNumberFormat || numberFormat,
    tLabel,
    plotX.domain(),
    undefined,
    {
      ticks: xLines ? xLines.map(tickAccessor) : xTicks,
    },
  ) // xUnit is rendered separately
  let plotXLines =
    xLines ||
    (
      xTicks || (xScale === 'log' ? get3EqualDistTicks(plotX) : xAxis.ticks)
    ).map((tick) => ({ tick }))
  // ensure highest value is last: the last value is labelled with the unit
  plotXLines = plotXLines.slice().sort((a, b) => ascending(a.tick, b.tick))

  // setup y axis
  const yValues = aggregateValues(data, yAccessor, yTicks, yLines)
    .concat(annotations.map((annotation) => annotation.y1))
    .concat(annotations.map((annotation) => annotation.y2))
  const plotY = getPlot(
    yScale,
    yValues,
    [innerHeight + paddingTop, paddingTop + columnTitleHeight],
    yNice,
    innerHeight,
  )
  const yAxis = calculateAxis(
    yNumberFormat || numberFormat,
    tLabel,
    plotY.domain(),
    tLabel(yUnit),
    {
      ticks: yLines ? yLines.map(tickAccessor) : yTicks,
    },
  )
  const plotYLines =
    yLines ||
    (yTicks || (yScale === 'log' ? get3EqualDistTicks(plotY) : yAxis.ticks))
      .map((tick) => ({ tick }))
      // ensure highest value is last: the last value is labled with the unit
      .sort((a, b) => ascending(a.tick, b.tick))
  const maxYLine = plotYLines[plotYLines.length - 1]

  const colorAccessor = (d) => d.datum[color]
  const colorValues = []
    .concat(data.map(colorAccessor))
    .concat(colorLegendValues)
    .filter(deduplicate)
    .filter(Boolean)
  runSort(colorSort, colorValues)

  const colorMapper = getColorMapper(
    { colorMap, colorRanges, colorRange },
    colorValues,
  )

  const yLinesPaddingLeft = paddingLeft < 2 ? paddingLeft : 0

  const showColorLegend = color !== column
  const displayedColorLegendValues = showColorLegend
    ? []
        .concat(
          colorLegend &&
            (colorLegendValues || colorValues).map((colorValue) => ({
              color: colorMapper(colorValue),
              label: colorValue,
            })),
        )
        .filter(Boolean)
    : []

  const rSize = scaleSqrt()
    .domain([0, max(data, (d) => d.size)])
    .range([
      0,
      props.sizeRange // backwards compatible, sizeRangeMax has default value
        ? props.sizeRange[1]
        : sizeRangeMax,
    ])

  const contextBoxProps = {
    tooltipLabel,
    tooltipBody,
    label,
    yShowValue,
    xShowValue,
    sizeShowValue,
    detail,
    yUnit,
    xUnit,
    sizeUnit,
    sizeFormat: getFormat(sizeNumberFormat || numberFormat, tLabel),
  }

  return (
    <>
      <ColorLegend inline values={displayedColorLegendValues} />
      <div style={{ position: 'relative', width, height }}>
        {groupedData.map(({ values, key }) => {
          const filterByColumn = (d) => !d.column || d.column === key
          return (
            <div
              key={key || 1}
              style={{ position: 'absolute', left: gx(key), top: gy(key) }}
            >
              <ScatterPlotGroup
                values={values}
                plotX={plotX}
                plotY={plotY}
                rSize={rSize}
                description={description}
                title={key}
                inlineLabel={inlineLabel}
                inlineSecondaryLabel={inlineSecondaryLabel}
                inlineLabelPosition={inlineLabelPosition}
                plotXLines={plotXLines.filter(filterByColumn)}
                plotYLines={plotYLines.filter(filterByColumn)}
                opacity={opacity}
                width={innerWidth}
                height={innerHeight}
                paddingTop={paddingTop}
                paddingLeft={paddingLeft}
                paddingRight={paddingRight}
                paddingBottom={paddingBottom}
                yLinesPaddingLeft={yLinesPaddingLeft}
                xAxis={xAxis}
                yAxis={yAxis}
                maxYLine={maxYLine}
                getColor={(d) => colorMapper(colorAccessor(d))}
                xUnit={xUnit}
                annotations={annotations.filter(filterByColumn)}
                contextBoxProps={contextBoxProps}
                // canvas does not support dark mapping yet
                allowCanvasRendering={allowCanvasRendering && !colorDarkMapping}
              />
            </div>
          )
        })}
      </div>
    </>
  )
}

export const propTypes = {
  values: PropTypes.array.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number,
  heightRatio: PropTypes.number,
  x: PropTypes.string.isRequired,
  xUnit: PropTypes.string,
  xNice: PropTypes.number,
  xTicks: PropTypes.arrayOf(PropTypes.number),
  xLines: PropTypes.arrayOf(
    PropTypes.shape({
      column: PropTypes.string,
      tick: PropTypes.number.isRequired,
      label: PropTypes.string,
      base: PropTypes.bool,
      textAnchor: PropTypes.string,
    }).isRequired,
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
      column: PropTypes.string,
      tick: PropTypes.number.isRequired,
      label: PropTypes.string,
      base: PropTypes.bool,
    }).isRequired,
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
    discrete: PropTypes.array.isRequired,
  }).isRequired,
  colorMap: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  colorSort: sortPropType,
  pointSize: PropTypes.string.isRequired,
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
  description: PropTypes.string,
  paddingTop: PropTypes.number.isRequired,
  paddingRight: PropTypes.number.isRequired,
  paddingBottom: PropTypes.number.isRequired,
  paddingLeft: PropTypes.number.isRequired,
  tooltipLabel: PropTypes.string,
  tooltipBody: PropTypes.string,
  column: PropTypes.string,
  columnSort: sortPropType,
  columnFilter: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      test: PropTypes.string.isRequired,
    }),
  ),
  columns: PropTypes.number.isRequired,
  minInnerWidth: PropTypes.number.isRequired,
  annotations: PropTypes.arrayOf(
    PropTypes.shape({
      column: PropTypes.string,
      x1: PropTypes.string.isRequired,
      x2: PropTypes.string.isRequired,
      y1: PropTypes.string.isRequired,
      y2: PropTypes.string.isRequired,
      label: PropTypes.string,
    }).isRequired,
  ).isRequired,
}

ScatterPlot.defaultProps = defaultProps.ScatterPlot

ScatterPlot.propTypes = propTypes

const ScatterPlotWithDefaultProps = (props) => (
  <ScatterPlot {...defaultProps.ScatterPlot} {...props} />
)

export default ScatterPlotWithDefaultProps
