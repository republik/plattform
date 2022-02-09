import { scaleLinear, scaleBand } from 'd3-scale'
import { groupInColumns, getColumnLayout, calculateAxis } from './utils'

import {
  insertXDomainGaps,
  processSegments,
  getMax,
  getMin,
  getXTicks,
} from './TimeBars.utils'

import {
  COLUMN_TITLE_HEIGHT,
  AXIS_BOTTOM_HEIGHT,
  PADDING_TOP,
  COLUMN_PADDING,
  PADDING_SIDES,
} from './Layout.constants'

export const timeBarsProcesser = ({
  props,
  data,
  colorValues,
  xValuesUnformatted,
  xFormat,
  xParser,
  xParserFormat,
  xNormalizer,
}) => {
  const groupedData = groupInColumns(
    data,
    props.column,
    props.columnFilter,
  ).map(processSegments)

  const paddingTop =
    props.yScaleInvert || props.xUnit
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
    true,
  )

  let y = scaleLinear()
    .domain(
      props.domain ? props.domain : [getMin(groupedData), getMax(groupedData)],
    )
    .range(barRange)

  if (!props.domain) {
    y.nice(3)
  }

  const x = scaleBand()
    .domain(xValuesUnformatted)
    .range([props.padding, innerWidth - props.padding])
    .padding(props.xBandPadding)
    .round(true)

  const xDomain = insertXDomainGaps(
    xValuesUnformatted,
    props.xInterval,
    props.x,
    props.timeParse,
    props.xIntervalStep,
    xParser,
    xParserFormat,
    x,
  )

  x.domain(xDomain).round(true)

  const xTicks = getXTicks(props.xTicks, xValuesUnformatted, xNormalizer, x)

  const yAxis = calculateAxis(
    props.numberFormat,
    props.tLabel,
    y.domain(),
    props.unit,
    {
      ticks: props.yTicks,
    },
  )

  return {
    groupedData,
    height,
    innerWidth,
    paddingRight: 0,
    paddingLeft: 0,
    groupPosition: { y: gy, x: gx, titleHeight: columnTitleHeight },
    xAxis: {
      scale: x,
      domain: xDomain,
      ticks: xTicks,
      format: xFormat,
      axisFormat: (x) => xFormat(xParser(x)),
    },
    yAxis: {
      ...yAxis,
      scale: y,
    },
    colorValuesForLegend: colorValues,
  }
}
