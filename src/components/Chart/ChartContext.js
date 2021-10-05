import React, { createContext } from 'react'

import { ascending } from 'd3-array'
import { timeFormat, timeParse } from '../../lib/timeFormat'

import {
  deduplicate,
  hasValues,
  identityFn,
  xAccessor,
  getDataFilter,
  getFormat
} from './utils'

import { normalizeData, getAnnotationsXValues } from './TimeBars.utils'

import { timeBarsProcesser } from './TimeBars.context'
import { linesProcesser } from './Lines.context'

import { categorizeData } from './Lines.utils'

export const ChartContext = createContext()

export const ChartContextProvider = props => {
  const mergedProps = { ...defaultProps[props.type], ...props }
  const { type, values, xAnnotations, xScale } = mergedProps

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
    xFormat = getFormat(props.xNumberFormat || props.numberFormat, props.tLabel)
  }

  const data = values
    .filter(getDataFilter(mergedProps.filter))
    .filter(hasValues)
    .map(normalizeData(mergedProps.x, type === 'Line' ? xParser : xNormalizer))
    .map(categorizeData(mergedProps.category))

  const colorAccessor = mergedProps.color
    ? d => d.datum[mergedProps.color]
    : d => d.category

  const colorValues = []
    .concat(data.map(colorAccessor))
    .concat(mergedProps.colorLegendValues)
    .filter(Boolean)
    .filter(deduplicate)

  const xTicksFromProps = props.xTicks && props.xTicks.map(xParser)

  const xValuesUnformatted = data
    .map(xAccessor)
    .concat(
      type === 'TimeBar'
        ? getAnnotationsXValues(xAnnotations, xNormalizer)
        : xTicksFromProps || []
    )
    .filter(deduplicate)

  const processedData = dataProcesser[type]({
    props: mergedProps,
    data,
    colorAccessor,
    colorValues,
    xValuesUnformatted,
    xParser,
    xParserFormat,
    xSort,
    xNormalizer
  })

  const chartContextObject = {
    ...processedData,
    colorAccessor,
    colorValues,
    formatXAxis:
      mergedProps.type === 'TimeBar' ? x => xFormat(xParser(x)) : xFormat,
    xNormalizer,
    xParser,
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
  TimeBar: timeBarsProcesser,
  Line: linesProcesser
}

const chartsToUseContext = ['TimeBar', 'Line']

// ChartContextGenerator über dem Provider und dort dann den switch reinmachen

// LineChart.context.js

// proptypes für context, alles reinnehmen, was required ist

// eigentlich immer const und nicht let
