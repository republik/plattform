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
  const mergedProps = { ...defaultProps[props.config.type], ...props }
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
    xParser = timeParse(props.timeParse)
    xParserFormat = timeFormat(props.timeParse)
    xNormalizer = d => xParserFormat(xParser(d))
    xFormat = timeFormat(props.timeFormat || props.timeParse)
    xSort = ascending
  } else if (xScale === 'linear') {
    xParser = x => +x
    xParserFormat = x => x.toString()
    xSort = ascending
  }

  let data = values
    .filter(getDataFilter(props.filter))
    .filter(hasValues)
    .map(normalizeData(props.x, xNormalizer))

  const groupedData = useMemo(() => {
    return groupInColumns(data, props.column, props.columnFilter).map(
      processSegments
    )
  })

  const columnTitleHeight = props.column ? COLUMN_TITLE_HEIGHT : 0
  const columnHeight =
    innerHeight +
    columnTitleHeight +
    (mini ? 0 : PADDING_TOP + AXIS_BOTTOM_HEIGHT)

  // TODO: different handling of gx and gy
  const { height, innerWidth, gx, gy } = getColumnLayout(
    props.columns,
    groupedData,
    width,
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
      .padding(props.xBandPadding)
      .round(true)

    let xDomain = insertXDomainGaps(
      xValues,
      xInterval,
      props.x,
      props.timeParse,
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

  const colorAccessor = d => d.datum[props.color]

  const colorValues = []
    .concat(data.map(colorAccessor))
    .concat(props.colorLegendValues)
    .filter(Boolean)
    .filter(deduplicate)

  const chartContextValue = {
    groupedData,
    xValues,
    height,
    innerWidth,
    gx,
    gy,
    y,
    xScaleDomain,
    columnTitleHeight,
    colorAccessor,
    colorValues,
    formatXAxis: x => xFormat(xParser(x)),
    xNormalizer,
    xSort
  }

  return (
    <ChartContext.Provider value={chartContextValue}>
      {props.children}
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
