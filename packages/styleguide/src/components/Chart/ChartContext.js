import React, { createContext } from 'react'
import PropTypes from 'prop-types'

import { timeFormat, timeParse } from '../../lib/timeFormat'
import { getColorMapper } from './colorMaps'
import { geoIdentity, geoMercator, geoEqualEarth } from 'd3-geo'

import {
  deduplicate,
  identityFn,
  xAccessor,
  getDataFilter,
  getFormat,
  subsup,
  runSort,
  isValuePresent,
} from './utils'

import { timeBarsProcesser } from './TimeBars.context'
import { linesProcesser } from './Lines.context'

import {
  categorizeData,
  normalizeData,
  getAnnotationsXValues,
} from './ChartContext.utils'

const dataProcesser = {
  TimeBar: timeBarsProcesser,
  Line: linesProcesser,
  Slope: linesProcesser,
}

const chartsToUseContext = ['TimeBar', 'Line', 'Slope']

export const ChartContext = createContext()

export const ChartContextProvider = (plainProps) => {
  if (chartsToUseContext.indexOf(plainProps.type) === -1) {
    return plainProps.children
  }
  const props = { ...defaultProps[plainProps.type], ...plainProps }
  const { type, values, xAnnotations, xScale } = props

  let xParser = identityFn
  let xParserFormat = identityFn
  let xFormat = identityFn
  if (xScale === 'time') {
    xParser = timeParse(props.timeParse)
    xParserFormat = timeFormat(props.timeParse)
    xFormat = timeFormat(props.timeFormat || props.timeParse)
  } else if (xScale === 'linear') {
    xParser = (x) => +x
    xFormat = (x) => `${x}`
    xParserFormat = (x) => x.toString()
    if (type === 'Line') {
      xFormat = getFormat(
        props.xNumberFormat || props.numberFormat,
        props.tLabel,
      )
    }
  }
  let xNormalizer = xParser
  let xCompareAccessor = identityFn
  if (type === 'TimeBar') {
    // time bar always uses a band scale and needs strings on the x axis
    xNormalizer = (d) => xParserFormat(xParser(d)).toString()
    xCompareAccessor = xParser
  }

  const data = values
    .filter(getDataFilter(props.filter))
    .filter(
      props.area
        ? (d) =>
            isValuePresent(d.value) || isValuePresent(d[`${props.area}_lower`])
        : (d) => isValuePresent(d.value),
    )
    .map(normalizeData(props.x, xNormalizer, props.area))
    .map(categorizeData(props.category))

  const shouldXSort = props.xSort || xScale === 'time' || xScale === 'linear'
  if (shouldXSort) {
    runSort(props.xSort, data, (d) => xCompareAccessor(xAccessor(d)))
  }

  const colorAccessor = props.color
    ? (d) => d.datum[props.color]
    : (d) => d.category

  const colorValues = []
    .concat(data.map(colorAccessor))
    .concat(props.colorLegendValues)
    .filter(Boolean)
    .filter(deduplicate)

  const color = getColorMapper(props, colorValues)

  const xValuesUnformatted = data
    .map(xAccessor)
    .concat(
      props.xLines || props.xTicks
        ? (props.xLines?.map((d) => d.tick) || props.xTicks).map(xNormalizer)
        : [],
    )
    .concat(getAnnotationsXValues(xAnnotations, xNormalizer))
    .filter(deduplicate)
  if (shouldXSort) {
    runSort(props.xSort, xValuesUnformatted, xCompareAccessor)
  }

  const processedData = dataProcesser[type]({
    props: props,
    data,
    colorAccessor,
    color,
    colorValues,
    xValuesUnformatted,
    xFormat,
    xParser,
    xParserFormat,
    xNormalizer,
  })

  const colorLegendValues =
    props.colorLegend !== false
      ? (props.colorLegendValues || processedData.colorValuesForLegend).map(
          (colorValue) => ({
            color: color(colorValue),
            label: subsup(colorValue),
          }),
        )
      : []

  const chartContextObject = {
    ...processedData,
    colorAccessor,
    color,
    colorLegendValues,
    xNormalizer,
  }

  return (
    <ChartContext.Provider value={chartContextObject}>
      {props.children}
    </ChartContext.Provider>
  )
}

const defaultPropsBar = {
  columns: 1,
  minInnerWidth: 140,
  barStyle: 'small',
  numberFormat: 's',
  sort: 'ascending',
}

const defaultPropsMap = {
  numberFormat: 's',
  columns: 1,
  unit: '',
  heightRatio: 1,
  colorLegend: true,
  colorLegendSize: 0.16,
  colorLegendMinWidth: 80,
  colorLegendPosition: 'right',
  points: false,
  pointAttributes: [],
  choropleth: false,
  missingDataColor: 'divider',
  ignoreMissingFeature: false,
  feature: 'feature',
  shape: 'circle',
  sizeRangeMax: 10,
  getProjection: () => geoEqualEarth().rotate([-10, 0]),
  opacity: 0.6,
  highlightedColor: '#c40046',
}

export const defaultProps = {
  TimeBar: {
    x: 'year',
    xScale: 'time',
    xBandPadding: 0.25,
    timeParse: '%Y',
    timeFormat: '%Y',
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
    minInnerWidth: 240,
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
    yNice: 3,
    strokeWidth: 3,
    strokeWidthHighlighted: 6,
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
    yNice: 3,
  },
  Bar: defaultPropsBar,
  Lollipop: {
    ...defaultPropsBar,
    barStyle: 'lollipop',
  },
  ScatterPlot: {
    x: 'value',
    y: 'value',
    xScale: 'linear',
    xShowValue: true,
    yScale: 'linear',
    yShowValue: true,
    opacity: 1,
    numberFormat: 's',
    colorLegend: true,
    paddingTop: 15,
    paddingRight: 1,
    paddingBottom: 50,
    paddingLeft: 30,
    sizeRangeMax: 4,
    label: 'label',
    heightRatio: 1,
    sizeShowValue: false,
    columns: 1,
    minInnerWidth: 240,
    annotations: [],
  },
  GenericMap: defaultPropsMap,
  ProjectedMap: {
    ...defaultPropsMap,
    getProjection: () => geoIdentity(),
  },
  SwissMap: {
    ...defaultPropsMap,
    getProjection: () =>
      geoMercator().rotate([-7.439583333333333, -46.95240555555556]),
    heightRatio: 0.63,
  },
  Hemicycle: {
    color: 'label',
    group: 'year',
    inlineLabelThreshold: 10,
    padding: 0,
    colorMap: 'swissPartyColors',
  },
  Table: {
    numberFormat: 's',
    tableColumns: [],
  },
}

const axisPropType = PropTypes.shape({
  scale: PropTypes.func.isRequired,
  domain: PropTypes.array.isRequired,
  ticks: PropTypes.array.isRequired,
  format: PropTypes.func.isRequired,
  axisFormat: PropTypes.func.isRequired,
})

const propTypes = {
  groupedData: PropTypes.array.isRequired,
  groupPosition: PropTypes.shape({
    y: PropTypes.func.isRequired,
    x: PropTypes.func.isRequired,
    titleHeight: PropTypes.number, // timebar only
  }).isRequired,
  height: PropTypes.number.isRequired,
  innerWidth: PropTypes.number.isRequired,
  paddingLeft: PropTypes.number.isRequired,
  paddingRight: PropTypes.number.isRequired,
  xAxis: axisPropType.isRequired,
  yAxis: axisPropType.isRequired,
  color: PropTypes.func.isRequired,
  colorAccessor: PropTypes.func.isRequired, // only used by timebar
  colorLegendValues: PropTypes.arrayOf(
    PropTypes.shape({
      color: PropTypes.string.isRequired,
      label: PropTypes.node.isRequired,
    }),
  ).isRequired,
  xNormalizer: PropTypes.func.isRequired, // only used by timebar
  // line only
  columnHeight: PropTypes.number,
  strokeWidth: PropTypes.number,
  strokeWidthHighlighted: PropTypes.number,
  yLayout: PropTypes.shape({
    yCut: PropTypes.string,
    yCutHeight: PropTypes.number,
    yNeedsConnectors: PropTypes.bool,
    yConnectorSize: PropTypes.number,
  }),
  yAnnotations: PropTypes.array,
  xAnnotations: PropTypes.array,
}

ChartContext.Provider.propTypes = {
  value: PropTypes.shape(propTypes).isRequired,
}
