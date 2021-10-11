import { scaleLinear, scaleBand } from 'd3-scale'
import { groupInColumns, getColumnLayout } from './utils'

import {
  insertXDomainGaps,
  processSegments,
  getMax,
  getMin,
  getXTicks
} from './TimeBars.utils'

import {
  COLUMN_TITLE_HEIGHT,
  AXIS_BOTTOM_HEIGHT,
  PADDING_TOP,
  COLUMN_PADDING,
  PADDING_SIDES
} from './Layout.constants'

export const timeBarsProcesser = ({
  props,
  data,
  xValuesUnformatted,
  xParser,
  xParserFormat,
  xSort,
  xNormalizer
}) => {
  const groupedData = groupInColumns(
    data,
    props.column,
    props.columnFilter
  ).map(processSegments)

  const paddingTop = props.yScaleInvert
    ? PADDING_TOP + PADDING_TOP / 2
    : PADDING_TOP

  const columnTitleHeight = props.column ? COLUMN_TITLE_HEIGHT : 0

  const columnHeight =
    props.height +
    columnTitleHeight +
    (props.mini ? 0 : paddingTop + AXIS_BOTTOM_HEIGHT)

  const barRange = props.yScaleInvert
    ? [paddingTop + columnTitleHeight, columnHeight - AXIS_BOTTOM_HEIGHT]
    : [columnHeight - paddingTop, AXIS_BOTTOM_HEIGHT + columnTitleHeight]

  const { height, innerWidth, gx, gy } = getColumnLayout(
    props.columns,
    groupedData,
    props.width,
    props.minInnerWidth,
    () => columnHeight,
    props.columnSort,
    0,
    PADDING_SIDES,
    0,
    PADDING_SIDES,
    COLUMN_PADDING,
    true
  )

  let y = scaleLinear()
    .domain(
      props.domain ? props.domain : [getMin(groupedData), getMax(groupedData)]
    )
    .range(barRange)

  if (!props.domain) {
    y.nice(3)
  }

  const xValues = xValuesUnformatted
    .map(xParser)
    .sort(xSort)
    .map(xParserFormat)

  const x = scaleBand()
    .domain(xValues)
    .range([props.padding, innerWidth - props.padding])
    .padding(props.xBandPadding)
    .round(true)

  const xDomain = insertXDomainGaps(
    xValues,
    props.xInterval,
    props.x,
    props.timeParse,
    props.xIntervalStep,
    xParser,
    xParserFormat,
    x
  )

  x.domain(xDomain).round(true)

  const xTicks = getXTicks(props.xTicks, xValues, xNormalizer, x)

  return {
    groupedData,
    height,
    innerWidth,
    groupPosition: { y: gy, x: gx, titleHeight: columnTitleHeight },
    y,
    x,
    xDomain,
    xValues,
    xTicks
  }
}
