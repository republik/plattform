import React, { createContext, useMemo } from 'react'
import { useColorContext } from '../Colors/useColorContext'

import { ascending, min, max } from 'd3-array'
import { scaleLinear, scaleBand, scaleLog } from 'd3-scale'
import { timeFormat, timeParse } from '../../lib/timeFormat'
import { createTextGauger } from '../../lib/textGauger'

import { getColorMapper } from './colorMaps'
import {
  deduplicate,
  hasValues,
  identityFn,
  xAccessor,
  getDataFilter,
  groupInColumns,
  getColumnLayout,
  unsafeDatumFn,
  calculateAxis,
  runSort,
  subsup
} from './utils'

import {
  insertXDomainGaps,
  normalizeData,
  getAnnotationsXValues,
  processSegments,
  getMax,
  getMin
} from './TimeBars.utils'

import {
  categorizeData,
  groupByLines,
  addLabels,
  calculateAndMoveLabelY
} from './Lines.utils'

import {
  sansSerifMedium12 as VALUE_FONT,
  sansSerifRegular12 as LABEL_FONT
} from '../Typography/styles'

// TODO: use padding instead fo axis bottom height
const COLUMN_TITLE_HEIGHT = 24
const AXIS_BOTTOM_HEIGHT = 24
const PADDING_TOP = 24
const COLUMN_PADDING = 20
const PADDING_SIDES = 20

const AXIS_TOP_HEIGHT = 24
const AXIS_BOTTOM_CUTOFF_HEIGHT = 40
const AXIS_BOTTOM_XUNIT_HEIGHT = 12

const Y_CONNECTOR = 7
const Y_CONNECTOR_PADDING = 4
const Y_LABEL_HEIGHT = 14
const Y_END_LABEL_SPACE = 3 // width of space between label and value
const X_TICK_HEIGHT = 4
const Y_GROUP_MARGIN = 20

const yScales = {
  linear: scaleLinear,
  log: scaleLog
}

const valueAccessor = d => d.value

const appendAnnotations = (values, annotations) =>
  annotations ? values.concat(annotations.map(valueAccessor)) : values

const valueGauger = createTextGauger(VALUE_FONT, {
  dimension: 'width',
  html: true
})
const labelGauger = createTextGauger(LABEL_FONT, {
  dimension: 'width',
  html: true
})

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
    yScaleInvert
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

  const {
    groupedData,
    height,
    innerWidth,
    gx,
    gy,
    columnTitleHeight,
    y
  } = dataProcesser[type](mergedProps, data, colorAccessor, colorValues)

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
  TimeBar: (props, data, colorAccessor, colorValues) => {
    const groupedData = groupInColumns(
      data,
      props.column,
      props.columnFilter
    ).map(processSegments)

    const columnTitleHeight = props.column ? COLUMN_TITLE_HEIGHT : 0

    const columnHeight =
      props.height +
      columnTitleHeight +
      (props.mini ? 0 : PADDING_TOP + AXIS_BOTTOM_HEIGHT)

    const barRange = props.yScaleInvert
      ? [AXIS_BOTTOM_HEIGHT + columnTitleHeight, columnHeight - PADDING_TOP]
      : [columnHeight - PADDING_TOP, AXIS_BOTTOM_HEIGHT + columnTitleHeight]

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

    const y = useMemo(() => {
      let createYScale = scaleLinear()
        .domain(
          props.domain
            ? props.domain
            : [getMin(groupedData), getMax(groupedData)]
        )
        .range(barRange)

      return props.domain ? createYScale : createYScale.nice(3)
    }, [props.domain, groupedData, barRange])

    return {
      groupedData,
      height,
      innerWidth,
      gx,
      gy,
      y,
      columnTitleHeight
    }
  },
  Line: (props, data, colorAccessor, colorValues) => {
    let groupedData = groupInColumns(data, props.column, props.columnFilter)

    // if we have logScale, we have to force Zero
    const logScale = props.yScale === 'log'
    const forceZero = !logScale && props.zero

    let yCut
    if (!forceZero) {
      yCut = 'Achse gekürzt'
    }
    if (logScale) {
      yCut = 'Logarithmische Skala'
    }
    const yCutHeight = props.mini ? 25 : AXIS_BOTTOM_CUTOFF_HEIGHT
    const paddingTop =
      AXIS_TOP_HEIGHT +
      (props.column ? COLUMN_TITLE_HEIGHT : 0) +
      (props.paddingTop || 0)
    const paddingBottom =
      AXIS_BOTTOM_HEIGHT +
      (yCut ? yCutHeight : 0) +
      (props.xUnit ? AXIS_BOTTOM_XUNIT_HEIGHT : 0)
    const innerHeight = props.mini
      ? props.height - paddingTop - paddingBottom
      : props.height
    const columnHeight = innerHeight + paddingTop + paddingBottom

    let yValues = data.map(valueAccessor)
    yValues = appendAnnotations(yValues, props.yAnnotations)
    yValues = appendAnnotations(yValues, props.xAnnotations)

    if (props.band) {
      const dataWithBand = data.filter(d => d.datum[`${props.band}_lower`])
      yValues = yValues
        .concat(dataWithBand.map(d => +d.datum[`${props.band}_lower`]))
        .concat(dataWithBand.map(d => +d.datum[`${props.band}_upper`]))
    }
    if (props.yTicks) {
      yValues = yValues.concat(props.yTicks)
    }
    const minValue = min(yValues)

    const y = yScales[props.yScale]()
      .domain([forceZero ? Math.min(0, minValue) : minValue, max(yValues)])
      .range([innerHeight + paddingTop, paddingTop])
    if (props.yNice) {
      y.nice(props.yNice)
    }

    runSort(props.colorSort, colorValues)

    const yAxis = calculateAxis(
      props.numberFormat,
      props.tLabel,
      y.domain(),
      props.unit,
      {
        ticks: props.yTicks
      }
    )
    const { format: yFormat } = yAxis

    const startValue = !props.mini && props.startValue
    const endLabel = !props.mini && props.endLabel && colorValues.length > 0

    let startValueSizes = []
    let endValueSizes = []
    let endLabelSizes = []
    let yNeedsConnectors = false

    const labelFilter = props.labelFilter
      ? unsafeDatumFn(props.labelFilter)
      : () => true

    const color = getColorMapper(props, colorValues)

    const addLabels = (color, colorAccessor, labelFilter, yFormat, y) => ({
      values: line
    }) => {
      const start = line[0]
      const end = line[line.length - 1]
      const label = labelFilter(start.datum)

      const isHighlight = props.highlight
        ? unsafeDatumFn(props.highlight)
        : () => false
      const hasStroke = props.stroke ? unsafeDatumFn(props.stroke) : () => false

      return {
        line,
        start,
        end,
        highlighted: isHighlight(start.datum),
        stroked: hasStroke(start.datum),
        lineColor: color(colorAccessor(start)),
        startValue: label && props.startValue && yFormat(start.value),
        endValue: label && props.endValue && yFormat(end.value),
        endLabel: label && props.endLabel && ` ${colorAccessor(end)}`,
        startY: y(start.value),
        endY: y(end.value)
      }
    }

    groupedData = groupedData
      .map(groupByLines(props.color, props.category))
      .map(({ values: lines, key }) => {
        const linesWithLabels = lines.map(
          addLabels(color, colorAccessor, labelFilter, yFormat, y, props)
        )
        let labelsMoved = 0
        labelsMoved += calculateAndMoveLabelY(linesWithLabels, 'start')
        labelsMoved += calculateAndMoveLabelY(linesWithLabels, 'end')
        yNeedsConnectors =
          yNeedsConnectors || (labelsMoved >= 1 && linesWithLabels.length > 2)

        if (startValue) {
          startValueSizes = startValueSizes.concat(
            linesWithLabels.map(line =>
              line.startValue ? valueGauger(line.startValue) : 0
            )
          )
        }
        if (!props.mini) {
          endValueSizes = endValueSizes.concat(
            linesWithLabels.map(line =>
              line.endValue ? valueGauger(line.endValue) : 0
            )
          )
          if (endLabel) {
            endLabelSizes = endLabelSizes.concat(
              linesWithLabels.map(line =>
                line.endLabel
                  ? labelGauger(line.endLabel) + Y_END_LABEL_SPACE
                  : 0
              )
            )
          }
        }

        return {
          key,
          values: linesWithLabels
        }
      })

    // transform all color values (always visible on small screens) and group titles for display
    const colorValuesForLegend = (
      props.colorLegendValues ||
      data.filter(d => labelFilter(d.datum)).map(colorAccessor)
    )
      .filter(deduplicate)
      .filter(Boolean)
    runSort(props.colorSort, colorValuesForLegend)

    let colorLegend =
      !props.mini &&
      colorValuesForLegend.length > 0 &&
      (!endLabel || props.colorLegend === true)

    const yConnectorSize = yNeedsConnectors
      ? Y_CONNECTOR + Y_CONNECTOR_PADDING * 2
      : Y_CONNECTOR_PADDING * 2

    const whiteSpacePadding =
      groupedData.length > 1 && props.columns > 1 ? 15 : 0
    let paddingLeft = 0
    let paddingRight = 0
    if (!props.mini) {
      const startValueSize = startValue
        ? Math.ceil(max(startValueSizes) + yConnectorSize)
        : 0
      const endValueSize = Math.ceil(max(endValueSizes) + yConnectorSize)
      if (startValue) {
        paddingLeft = paddingRight =
          Math.max(startValueSize, endValueSize) + whiteSpacePadding
      } else {
        paddingRight = endValueSize + whiteSpacePadding
      }
      if (endLabel) {
        const endLabelWidth =
          props.endLabelWidth !== undefined
            ? props.endLabelWidth
            : endValueSize + Math.ceil(max(endLabelSizes))
        // don't show label if too big
        if (
          startValueSize + endLabelWidth >
          props.width - props.minInnerWidth
        ) {
          colorLegend = true
          groupedData.forEach(({ values: lines }) => {
            lines.forEach(line => {
              line.endLabel = false
            })
          })
        } else {
          if (startValue) {
            paddingLeft = startValueSize + whiteSpacePadding
          }
          paddingRight = endLabelWidth + whiteSpacePadding
        }
      }
      if (props.paddingRight !== undefined) {
        paddingRight = props.paddingRight + whiteSpacePadding
      }
      if (props.paddingLeft !== undefined) {
        paddingLeft = props.paddingLeft + whiteSpacePadding
      }
    }

    const { height, innerWidth, gx, gy } = getColumnLayout(
      props.columns,
      groupedData,
      props.width,
      props.minInnerWidth,
      () => columnHeight,
      props.columnSort,
      0,
      paddingRight,
      0,
      paddingLeft,
      Y_GROUP_MARGIN
    )

    return {
      groupedData,
      height,
      innerWidth,
      gx,
      gy,
      y,
      columnTitleHeight: 0
    }
  }
}

const chartsToUseContext = ['TimeBar', 'Line']
