import React, { createContext, useMemo } from 'react'

import { ascending, min, max } from 'd3-array'
import { scaleLinear, scaleBand, scaleLog } from 'd3-scale'
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

import { categorizeData } from './Lines.utils'

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
    type,
    values,
    width,
    mini,
    xAnnotations,
    yAnnotations,
    xScale,
    yScale,
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

  const columnTitleHeight = mergedProps.column ? COLUMN_TITLE_HEIGHT : 0
  const columnHeight =
    innerHeight +
    columnTitleHeight +
    (mini ? 0 : PADDING_TOP + AXIS_BOTTOM_HEIGHT)

  let data = values
    .filter(getDataFilter(mergedProps.filter))
    .filter(hasValues)
    .map(normalizeData(mergedProps.x, type === 'Line' ? xParser : xNormalizer))
    .map(categorizeData(mergedProps.category))

  const groupedData = dataProcesser[type](mergedProps, data)

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

  // if we have logScale, we have to force Zero
  const logScale = yScale === 'log'
  const forceZero = !logScale && props.zero

  const yScales = {
    linear: scaleLinear,
    log: scaleLog
  }

  const valueAccessor = d => d.value

  const appendAnnotations = (values, annotations) =>
    annotations ? values.concat(annotations.map(valueAccessor)) : values

  let yValues = data.map(valueAccessor)
  yValues = appendAnnotations(yValues, yAnnotations)
  yValues = appendAnnotations(yValues, xAnnotations)

  const minValue = min(yValues)

  const y = useMemo(() => {
    let createYScale =
      type === 'TimeBar'
        ? scaleLinear()
            .domain(
              domain ? domain : [getMin(groupedData), getMax(groupedData)]
            )
            .range(barRange)
        : yScales[yScale]()
            .domain([
              forceZero ? Math.min(0, minValue) : minValue,
              max(yValues)
            ])
            .range(barRange)
    return domain ? createYScale : createYScale.nice(3)
  }, [domain, groupedData, barRange])

  // const y = yScales[props.yScale]()
  //   .domain([forceZero ? Math.min(0, minValue) : minValue, max(yValues)])
  //   .range([innerHeight + paddingTop, paddingTop])
  // if (props.yNice) {
  //   y.nice(props.yNice)
  // }

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
  }, [
    xValues,
    innerWidth,
    mergedProps.timeParse,
    mergedProps.x,
    mergedProps.xBandPadding,
    padding,
    xInterval,
    xIntervalStep,
    xParser,
    xParserFormat
  ])

  const colorAccessor = props.color
    ? d => d.datum[props.color]
    : d => d.category

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
  },
  Line: {
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
}

const dataProcesser = {
  TimeBar: (props, data) => {
    return groupInColumns(data, props.column, props.columnFilter).map(
      processSegments
    )
  },
  Line: (props, data) => {
    return groupInColumns(data, props.column, props.columnFilter)
  }
}

const chartsToUseContext = ['TimeBar', 'Line']
