import React, { createContext } from 'react'
import PropTypes from 'prop-types'

import { ascending } from 'd3-array'
import { timeFormat, timeParse } from '../../lib/timeFormat'
import { getColorMapper } from './colorMaps'

import {
  deduplicate,
  hasValues,
  identityFn,
  xAccessor,
  getDataFilter,
  getFormat,
  runSort,
  subsup,
  unsafeDatumFn
} from './utils'

import { timeBarsProcesser } from './TimeBars.context'
import { linesProcesser } from './Lines.context'

import {
  categorizeData,
  normalizeData,
  getAnnotationsXValues
} from './ChartContext.utils'

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
  // time bar always uses a band scale and needs strings on the x axis
  xNormalizer =
    type === 'TimeBar' ? d => xParserFormat(xParser(d)).toString() : xParser

  const data = values
    .filter(getDataFilter(mergedProps.filter))
    .filter(hasValues)
    .map(normalizeData(mergedProps.x, xNormalizer))
    .map(categorizeData(mergedProps.category))

  const colorAccessor = mergedProps.color
    ? d => d.datum[mergedProps.color]
    : d => d.category

  const colorValues = []
    .concat(data.map(colorAccessor))
    .concat(mergedProps.colorLegendValues)
    .filter(Boolean)
    .filter(deduplicate)

  const color = getColorMapper(props, colorValues)

  const labelFilter = props.labelFilter
    ? unsafeDatumFn(props.labelFilter)
    : () => true

  // transform all color values (always visible on small screens) and group titles for display
  const colorValuesForLegend = (
    props.colorLegendValues ||
    data.filter(d => labelFilter(d.datum)).map(colorAccessor)
  )
    .filter(deduplicate)
    .filter(Boolean)
  runSort(props.colorSort, colorValuesForLegend)

  const colorLegendValues = []
    .concat(
      props.colorLegend &&
        (props.colorLegendValues || colorValues).map(colorValue => ({
          color: color(colorValue),
          label: subsup(colorValue)
        }))
    )
    .filter(Boolean)

  const xValuesUnformatted = data
    .map(xAccessor)
    .concat(props.xTicks ? props.xTicks.map(xNormalizer) : [])
    .concat(getAnnotationsXValues(xAnnotations, xNormalizer))
    .filter(deduplicate)

  const processedData = dataProcesser[type]({
    props: mergedProps,
    data,
    colorAccessor,
    color,
    colorValues,
    colorValuesForLegend,
    xValuesUnformatted,
    xFormat,
    xParser,
    xParserFormat,
    xSort,
    xNormalizer
  })

  const chartContextObject = {
    ...processedData,
    colorAccessor,
    color,
    colorLegendValues,
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

const axisPropType = PropTypes.shape({
  ticks: PropTypes.array.isRequired,
  format: PropTypes.func.isRequired,
  axisFormat: PropTypes.func.isRequired
})

const propTypes = {
  groupedData: PropTypes.array.isRequired,
  groupPosition: PropTypes.shape({
    y: PropTypes.func.isRequired,
    x: PropTypes.func.isRequired,
    titleHeight: PropTypes.number // timebar only
  }).isRequired,
  height: PropTypes.number.isRequired,
  innerWidth: PropTypes.number.isRequired,
  x: PropTypes.func.isRequired,
  xAxis: axisPropType.isRequired,
  xDomain: PropTypes.array.isRequired,
  y: PropTypes.func.isRequired,
  colorLegend: PropTypes.bool,
  colorLegendValues: PropTypes.array,
  // only used by timebar
  colorAccessor: PropTypes.func,
  xNormalizer: PropTypes.func,
  // timebar only
  xValues: PropTypes.array,
  // line only
  paddingLeft: PropTypes.number,
  paddingRight: PropTypes.number,
  columnHeight: PropTypes.number,
  yAxis: axisPropType,
  yLayout: PropTypes.shape({
    yCut: PropTypes.string,
    yCutHeight: PropTypes.number,
    yNeedsConnectors: PropTypes.bool,
    yConnectorSize: PropTypes.number
  }),
  yAnnotations: PropTypes.array,
  xAnnotations: PropTypes.array
}

ChartContext.Provider.propTypes = {
  value: PropTypes.shape(propTypes).isRequired
}
