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
  sortBy
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

const calculateAndMoveLabelY = (linesWithLayout, propery) => {
  let labelsMoved = 0
  let lastY = -Infinity
  sortBy(
    linesWithLayout.filter(
      line => line[`${propery}Value`] || line[`${propery}Label`]
    ),
    line => line[`${propery}Y`]
  ).forEach(line => {
    let labelY = line[`${propery}Y`]
    let nextY = lastY + Y_LABEL_HEIGHT
    if (nextY > labelY) {
      labelY = nextY
      labelsMoved += 1
    }
    line[`${propery}LabelY`] = lastY = labelY
  })
  return labelsMoved
}

export default props => {
  const { values, mini, yAnnotations, xAnnotations, tLabel, band } = props
  let data = values
  if (props.filter) {
    const filter = unsafeDatumFn(props.filter)
    data = data.filter(filter)
  }
  let xParser = x => x
  if (props.xScale === 'time') {
    xParser = timeParse(props.timeParse)
  } else if (props.xScale === 'linear') {
    xParser = x => +x
  }
  data = data
    .filter(d => d.value && d.value.length > 0)
    .map(d => ({
      datum: d,
      x: xParser(d[props.x]),
      value: +d.value
    }))
  if (props.category) {
    const categorize = unsafeDatumFn(props.category)
    data.forEach(d => {
      d.category = categorize(d.datum)
    })
  }
  const xAccessor = d => d.x
  runSort(props.xSort, data, xAccessor)

  let groupedData
  if (props.columnFilter) {
    groupedData = props.columnFilter.map(({ test, title }) => {
      const filter = unsafeDatumFn(test)
      return {
        key: title,
        values: data.filter(d => filter(d.datum))
      }
    })
    data = groupedData.reduce((all, group) => all.concat(group.values), [])
  } else {
    groupedData = groupBy(data, d => d.datum[props.column])
  }
  const lineGroup = props.category ? d => d.category : d => d.datum[props.color]

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

  let yValues = data.map(d => d.value)
  if (yAnnotations) {
    yValues = yValues.concat(yAnnotations.map(d => d.value))
  }
  if (xAnnotations) {
    yValues = yValues.concat(xAnnotations.map(d => d.value))
  }
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

  let colorRange = props.colorRanges[props.colorRange] || props.colorRange
  if (!colorRange) {
    colorRange =
      colorValues.length > 3
        ? props.colorRanges.discrete
        : props.colorRanges.sequential3
  }
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

  const highlight = props.highlight
    ? unsafeDatumFn(props.highlight)
    : () => false
  const stroke = props.stroke ? unsafeDatumFn(props.stroke) : () => false
  const labelFilter = props.labelFilter
    ? unsafeDatumFn(props.labelFilter)
    : () => true
  groupedData = groupedData
    .map(({ values, key }) => ({
      key,
      values: groupBy(values, lineGroup)
    }))
    .map(({ values: lines, key }) => {
      const linesWithLabels = lines.map(({ values: line }) => {
        const start = line[0]
        const end = line[line.length - 1]

        const label = labelFilter(start.datum)

        return {
          line,
          start,
          end,
          highlighted: highlight(start.datum),
          stroked: stroke(start.datum),
          lineColor: color(colorAccessor(start)),
          startValue: label && startValue && yFormat(start.value),
          endValue: label && props.endValue && yFormat(end.value),
          endLabel: label && endLabel && ` ${colorAccessor(end)}`,
          startY: y(start.value),
          endY: y(end.value)
        }
      })
      let labelsMoved = 0
      labelsMoved += calculateAndMoveLabelY(linesWithLabels, 'start')
      labelsMoved += calculateAndMoveLabelY(linesWithLabels, 'end')
      yNeedsConnectors = yNeedsConnectors || labelsMoved > 1

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
  let paddingLeft = 0
  let paddingRight = 0

  const whiteSpacePadding = groupedData.length > 1 && props.columns > 1 ? 15 : 0

  const yConnectorSize = yNeedsConnectors
    ? Y_CONNECTOR + Y_CONNECTOR_PADDING * 2
    : Y_CONNECTOR_PADDING * 2
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
    labelSize: labelGauger(d.label || '')
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
