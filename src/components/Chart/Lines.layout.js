import { timeParse } from 'd3-time-format'
import { scaleLinear, scaleLog } from 'd3-scale'
import { min, max } from 'd3-array'

import { createTextGauger } from '../../lib/textGauger'

import {
  calculateAxis,
  subsup,
  runSort,
  groupBy,
  deduplicate,
  unsafeDatumFn,
  sortBy,
  hasValues,
  identityFn,
  xAccessor,
  getDataFilter,
  groupInColumns
} from './utils'

import { getColorMapper } from './colorMaps'

import {
  sansSerifMedium12 as VALUE_FONT,
  sansSerifRegular12 as LABEL_FONT
} from '../Typography/styles'
export {
  sansSerifMedium12 as VALUE_FONT,
  sansSerifRegular12 as LABEL_FONT
} from '../Typography/styles'

const COLUMN_TITLE_HEIGHT = 24
const AXIS_TOP_HEIGHT = 24
export const AXIS_BOTTOM_HEIGHT = 24
const AXIS_BOTTOM_CUTOFF_HEIGHT = 40
const AXIS_BOTTOM_XUNIT_HEIGHT = 12

export const Y_CONNECTOR = 7
export const Y_CONNECTOR_PADDING = 4
export const Y_LABEL_HEIGHT = 14
const Y_END_LABEL_SPACE = 3 // width of space between label and value

const valueGauger = createTextGauger(VALUE_FONT, {
  dimension: 'width',
  html: true
})
const labelGauger = createTextGauger(LABEL_FONT, {
  dimension: 'width',
  html: true
})

export const yScales = {
  linear: scaleLinear,
  log: scaleLog
}

const calculateAndMoveLabelY = (linesWithLayout, property) => {
  let labelsMoved = 0
  let lastY = -Infinity
  sortBy(
    linesWithLayout.filter(
      line => line[`${property}Value`] || line[`${property}Label`]
    ),
    line => line[`${property}Y`]
  ).forEach(line => {
    let labelY = line[`${property}Y`]
    let nextY = lastY + Y_LABEL_HEIGHT
    if (nextY > labelY) {
      labelY = nextY
      labelsMoved += 1
    }
    line[`${property}LabelY`] = lastY = labelY
  })
  return labelsMoved
}

const getXParser = (xScale, userTimeParse) => {
  if (xScale === 'time') {
    return timeParse(userTimeParse)
  } else if (xScale === 'linear') {
    return x => +x
  }
  return identityFn
}

const categorizeData = category => d => {
  if (category) {
    const categorize = unsafeDatumFn(category)
    return {
      ...d,
      category: categorize(d.datum)
    }
  }
  return d
}

const parseData = (x, xParser) => d => ({
  datum: d,
  x: xParser(d[x]),
  value: +d.value
})

const valueAccessor = d => d.value

const appendAnnotations = (values, annotations) =>
  annotations ? values.concat(annotations.map(valueAccessor)) : values

const groupLines = (color, category) =>
  category ? d => d.category : d => d.datum[color]

const groupByLines = (color, category) => ({ values, key }) => ({
  key,
  values: groupBy(values, groupLines(color, category))
})

export default props => {
  const { values, mini, yAnnotations, xAnnotations, tLabel, band } = props
  const xParser = getXParser(props.xScale, props.timeParse)

  let data = values
    .filter(getDataFilter(props.filter))
    .filter(hasValues)
    .map(parseData(props.x, xParser))
    .map(categorizeData(props.category))

  runSort(props.xSort, data, xAccessor)

  let groupedData = groupInColumns(data, props.column, props.columnFilter)

  const logScale = props.yScale === 'log'
  const forceZero = !logScale && props.zero

  let yCut
  if (!forceZero) {
    yCut = tLabel('Achse gekürzt')
  }
  if (logScale) {
    yCut = tLabel('Logarithmische Skala')
  }
  const yCutHeight = mini ? 25 : AXIS_BOTTOM_CUTOFF_HEIGHT
  const paddingTop =
    AXIS_TOP_HEIGHT +
    (props.column ? COLUMN_TITLE_HEIGHT : 0) +
    (props.paddingTop || 0)
  const paddingBottom =
    AXIS_BOTTOM_HEIGHT +
    (yCut ? yCutHeight : 0) +
    (props.xUnit ? AXIS_BOTTOM_XUNIT_HEIGHT : 0)
  const innerHeight = mini
    ? props.height - paddingTop - paddingBottom
    : props.height
  const columnHeight = innerHeight + paddingTop + paddingBottom

  let yValues = data.map(valueAccessor)
  yValues = appendAnnotations(yValues, yAnnotations)
  yValues = appendAnnotations(yValues, xAnnotations)

  if (band) {
    const dataWithBand = data.filter(d => d.datum[`${band}_lower`])
    yValues = yValues
      .concat(dataWithBand.map(d => +d.datum[`${band}_lower`]))
      .concat(dataWithBand.map(d => +d.datum[`${band}_upper`]))
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
  const colorAccessor = props.color
    ? d => d.datum[props.color]
    : d => d.category
  const colorValues = []
    .concat(data.map(colorAccessor))
    .concat(props.colorLegendValues)
    .filter(deduplicate)
    .filter(Boolean)
  runSort(props.colorSort, colorValues)

  const color = getColorMapper(props, colorValues)

  const yAxis = calculateAxis(
    props.numberFormat,
    tLabel,
    y.domain(),
    props.unit,
    {
      ticks: props.yTicks
    }
  )
  const { format: yFormat } = yAxis

  const startValue = !mini && props.startValue
  const endLabel = !mini && props.endLabel && colorValues.length > 0

  let startValueSizes = []
  let endValueSizes = []
  let endLabelSizes = []
  let yNeedsConnectors = false

  const labelFilter = props.labelFilter
    ? unsafeDatumFn(props.labelFilter)
    : () => true

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
      if (!mini) {
        endValueSizes = endValueSizes.concat(
          linesWithLabels.map(line =>
            line.endValue ? valueGauger(line.endValue) : 0
          )
        )
        if (endLabel) {
          endLabelSizes = endLabelSizes.concat(
            linesWithLabels.map(line =>
              line.endLabel ? labelGauger(line.endLabel) + Y_END_LABEL_SPACE : 0
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
    !mini &&
    colorValuesForLegend.length > 0 &&
    (!endLabel || props.colorLegend === true)

  const yConnectorSize = yNeedsConnectors
    ? Y_CONNECTOR + Y_CONNECTOR_PADDING * 2
    : Y_CONNECTOR_PADDING * 2

  const whiteSpacePadding = groupedData.length > 1 && props.columns > 1 ? 15 : 0
  let paddingLeft = 0
  let paddingRight = 0
  if (!mini) {
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
      if (startValueSize + endLabelWidth > props.width - props.minInnerWidth) {
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

  const colorLegendValues = colorValuesForLegend.map(value => ({
    color: color(value),
    label: subsup(value)
  }))

  const translatedYAnnotations = (yAnnotations || []).map(d => ({
    formattedValue: yFormat(d.value),
    ...d,
    x: d.x ? xParser(d.x) : undefined
  }))
  const translatedXAnnotations = (xAnnotations || []).map(d => ({
    formattedValue: yFormat(d.value),
    ...d,
    x: d.x ? xParser(d.x) : undefined,
    x1: d.x1 ? xParser(d.x1) : undefined,
    x2: d.x2 ? xParser(d.x2) : undefined,
    labelSize: d.label ? labelGauger(d.label) : 0
  }))

  return {
    data,
    groupedData,
    xParser,
    xAccessor,
    y,
    yAxis,
    yCut,
    yCutHeight,
    yConnectorSize,
    yNeedsConnectors,
    yAnnotations: translatedYAnnotations,
    xAnnotations: translatedXAnnotations,
    colorLegend,
    colorLegendValues,
    paddingLeft,
    paddingRight,
    columnHeight
  }
}
