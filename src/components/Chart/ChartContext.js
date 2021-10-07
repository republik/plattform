import React, { createContext } from 'react'
import PropTypes from 'prop-types'

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

const dataProcesser = {
  TimeBar: timeBarsProcesser,
  Line: linesProcesser,
  Slope: linesProcesser
}

const chartsToUseContext = ['TimeBar', 'Line', 'Slope']

export const ChartContext = createContext()

export const ChartContextProvider = props => {
  if (chartsToUseContext.indexOf(props.type) === -1) {
    return props.children
  }
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
    if (type === 'Line') {
      xFormat = getFormat(
        props.xNumberFormat || props.numberFormat,
        props.tLabel
      )
    }
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
    xNormalizer
  }

  return (
    <ChartContext.Provider value={chartContextObject}>
      {mergedProps.children}
    </ChartContext.Provider>
  )
}

export const defaultProps = {
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
  },
  Slope: {
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
}

const propTypes = {
  groupedData: PropTypes.array.isRequired,
  height: PropTypes.number,
  innerWidth: PropTypes.number,
  groupPosition: PropTypes.shape({
    y: PropTypes.number,
    x: PropTypes.number,
    titleHeight: PropTypes.number
  }),
  y: PropTypes.func.isRequired,
  yAxis: PropTypes.func.isRequired,
  yLayout: PropTypes.shape({
    yCut: PropTypes.string,
    yCutHeight: PropTypes.number,
    yNeedsConnectors: PropTypes.bool,
    yConnectorSize: PropTypes.number
  }),
  paddingLeft: PropTypes.number,
  paddingRight: PropTypes.number,
  columnHeight: PropTypes.number,
  xScaleDomain: PropTypes.shape({
    xDomain: PropTypes.array.isRequired,
    x: PropTypes.func.isRequired
  }).isRequired,
  xValues: PropTypes.array,
  xTicks: PropTypes.array,
  formatXAxis: PropTypes.func,
  xNormalizer: PropTypes.func,
  colorAccessor: PropTypes.func,
  colorValues: PropTypes.array,
  colorLegend: PropTypes.bool,
  colorLegendValues: PropTypes.array,
  yAnnotations: PropTypes.array,
  xAnnotations: PropTypes.array
}

ChartContext.Provider.propTypes = {
  value: PropTypes.shape(propTypes).isRequired
}
