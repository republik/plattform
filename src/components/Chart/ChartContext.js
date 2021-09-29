import React, { createContext, useMemo } from 'react'

import { ascending } from 'd3-array'
import { scaleLinear, scaleBand } from 'd3-scale'
import { timeFormat, timeParse } from '../../lib/timeFormat'

import {
  deduplicate,
  hasValues,
  identityFn,
  xAccessor,
  getDataFilter,
  groupInColumns,
  getColumnLayout
} from './utils'

import {
  insertXDomainGaps,
  normalizeData,
  getAnnotationsXValues,
  processSegments,
  getMax,
  getMin
} from './TimeBars.utils'

// TODO: use padding instead fo axis bottom height
const COLUMN_TITLE_HEIGHT = 24
const AXIS_BOTTOM_HEIGHT = 24
const PADDING_TOP = 24
const COLUMN_PADDING = 20
const PADDING_SIDES = 20

export const ChartContext = createContext()

export const ChartContextProvider = props => {
  const mergedProps = { ...defaultProps[props.type], ...props }
  const {
    values,
    width,
    mini,
    xAnnotations,
    xScale,
    xInterval,
    xIntervalStep,
    domain,
    padding,
    yScaleInvert,
    height: innerHeight
  } = mergedProps

  let xParser = identityFn
  let xParserFormat = identityFn
  let xNormalizer = identityFn
  let xFormat = identityFn
  let xSort = (a, b) => 0
  if (xScale === 'time') {
    xParser = timeParse(mergedProps.timeParse)
    xParserFormat = timeFormat(mergedProps.timeParse)
    xNormalizer = d => xParserFormat(xParser(d))
    xFormat = timeFormat(mergedProps.timeFormat || mergedProps.timeParse)
    xSort = ascending
  } else if (xScale === 'linear') {
    xParser = x => +x
    xParserFormat = x => x.toString()
    xSort = ascending
  }

  let data = values
    .filter(getDataFilter(mergedProps.filter))
    .filter(hasValues)
    .map(normalizeData(mergedProps.x, xNormalizer))

  const groupedData = useMemo(() => {
    return groupInColumns(
      data,
      mergedProps.column,
      mergedProps.columnFilter
    ).map(processSegments)
  })

  const columnTitleHeight = mergedProps.column ? COLUMN_TITLE_HEIGHT : 0
  const columnHeight =
    innerHeight +
    columnTitleHeight +
    (mini ? 0 : PADDING_TOP + AXIS_BOTTOM_HEIGHT)

  const { height, innerWidth, gx, gy } = getColumnLayout(
    mergedProps.columns,
    groupedData,
    width,
    mergedProps.minInnerWidth,
    () => columnHeight,
    mergedProps.columnSort,
    0,
    PADDING_SIDES,
    0,
    PADDING_SIDES,
    COLUMN_PADDING,
    true
  )

  const barRange = yScaleInvert
    ? [AXIS_BOTTOM_HEIGHT + columnTitleHeight, columnHeight - PADDING_TOP]
    : [columnHeight - PADDING_TOP, AXIS_BOTTOM_HEIGHT + columnTitleHeight]

  const y = useMemo(() => {
    let yScale = scaleLinear()
      .domain(domain ? domain : [getMin(groupedData), getMax(groupedData)])
      .range(barRange)
    return domain ? yScale : yScale.nice(3)
  }, [domain, groupedData, barRange])

  const xValues = data
    .map(xAccessor)
    .concat(getAnnotationsXValues(xAnnotations, xNormalizer))
    .filter(deduplicate)
    .map(xParser)
    .sort(xSort)
    .map(xParserFormat)

  const xScaleDomain = useMemo(() => {
    let x = scaleBand()
      .domain(xValues)
      .range([padding, innerWidth - padding])
      .padding(mergedProps.xBandPadding)
      .round(true)

    let xDomain = insertXDomainGaps(
      xValues,
      xInterval,
      mergedProps.x,
      mergedProps.timeParse,
      xIntervalStep,
      xParser,
      xParserFormat,
      x
    )
    return {
      xDomain,
      x: x.domain(xDomain).round(true)
    }
  }, [xValues, innerWidth])

  const colorAccessor = d => d.datum[mergedProps.color]

  const colorValues = []
    .concat(data.map(colorAccessor))
    .concat(mergedProps.colorLegendValues)
    .filter(Boolean)
    .filter(deduplicate)

  const chartContextObject = {
    groupedData,
    xValues,
    height,
    innerWidth,
    y,
    xScaleDomain,
    group: { y: gy, x: gx, titleHeight: columnTitleHeight },
    colorAccessor,
    colorValues,
    formatXAxis: x => xFormat(xParser(x)),
    xNormalizer,
    xSort
  }

  return (
    <ChartContext.Provider value={chartContextObject}>
      {mergedProps.children}
    </ChartContext.Provider>
  )
}

const defaultProps = {
  TimeBar: {
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
}
