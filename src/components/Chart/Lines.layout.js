import { timeParse } from 'd3-time-format'
import { scaleLinear, scaleOrdinal } from 'd3-scale'
import { min, max } from 'd3-array'

import { createTextGauger } from '../../lib/textGauger'

import {
  calculateAxis,
  subsup,
  runSort,
  groupBy,
  deduplicate,
  unsafeDatumFn
} from './utils'

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
const AXIS_BOTTOM_HEIGHT = 24
const AXIS_BOTTOM_CUTOFF_HEIGHT = 40

export const Y_CONNECTOR = 6
export const Y_CONNECTOR_PADDING = 4
const Y_END_LABEL_SPACE = 3 // width of space between label and value

const valueGauger = createTextGauger(VALUE_FONT, {dimension: 'width', html: true})
const labelGauger = createTextGauger(LABEL_FONT, {dimension: 'width', html: true})

export default (props) => {
  const {
    values,
    mini,
    yAnnotations
  } = props
  let data = values
  if (props.filter) {
    const filter = unsafeDatumFn(props.filter)
    data = data.filter(filter)
  }
  let xParser = x => x
  if (props.xScale === 'time') {
    xParser = timeParse(props.timeParse)
  }
  data = data.filter(d => d.value && d.value.length > 0).map(d => ({
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
    groupedData = props.columnFilter.map(({test, title}) => {
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
  const lineGroup =  props.category ? d => d.category : d => d.datum[props.color]

  const yCutHeight = mini ? 25 : AXIS_BOTTOM_CUTOFF_HEIGHT
  const paddingTop = AXIS_TOP_HEIGHT + (props.column ? COLUMN_TITLE_HEIGHT : 0)
  const paddingBottom = AXIS_BOTTOM_HEIGHT + (props.zero ? 0 : yCutHeight)
  const innerHeight = mini ? props.height - paddingTop - paddingBottom : props.height
  const columnHeight = innerHeight + paddingTop + paddingBottom

  let yValues = data.map(d => d.value)
  if (yAnnotations) {
    yValues = yValues.concat(yAnnotations.map(d => d.value))
  }
  if (props.yTicks) {
    yValues = yValues.concat(props.yTicks)
  }
  const minValue = min(yValues)
  const y = scaleLinear()
    .domain([
      props.zero ? Math.min(0, minValue) : minValue,
      max(yValues)
    ])
    .nice(props.yNice)
    .range([innerHeight + paddingTop, paddingTop])
  const colorAccessor = props.color ? d => d.datum[props.color] : d => d.category
  const colorValues = data.map(colorAccessor).filter(deduplicate).filter(Boolean)
  runSort(props.colorSort, colorValues)

  let colorRange = props.colorRanges[props.colorRange] || props.colorRange
  if (!colorRange) {
    colorRange = colorValues.length > 3 ? props.colorRanges.discrete : props.colorRanges.sequential3
  }
  const color = scaleOrdinal(colorRange).domain(colorValues)

  const {unit, t} = props
  let yCut
  if (!props.zero) {
    yCut = t('styleguide/charts/y-cut')
  }
  const yAxis = calculateAxis(props.numberFormat, t, y.domain(), unit)
  const {format: yFormat} = yAxis

  const startValue = !mini && props.startValue
  const endLabel = !mini && props.endLabel && colorValues.length > 0

  let startValueSizes = []
  let endValueSizes = []
  let endLabelSizes = []

  const highlight = props.highlight ? unsafeDatumFn(props.highlight) : () => false
  const stroke = props.stroke ? unsafeDatumFn(props.stroke) : () => false
  const labelFilter = props.labelFilter ? unsafeDatumFn(props.labelFilter) : () => true
  groupedData = groupedData
    .map(({values, key}) => ({
      key,
      values: groupBy(values, lineGroup)
    }))
    .map(({values: lines, key}) => {
      const linesWithLabels = lines.map(({values: line}) => {
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
          endValue: label && yFormat(end.value),
          endLabel: label && endLabel && ` ${colorAccessor(end)}`
        }
      })

      if (startValue) {
        startValueSizes = startValueSizes.concat(
          linesWithLabels.map(line => line.startValue ? valueGauger(line.startValue) : 0)
        )
      }
      if (!mini) {
        endValueSizes = endValueSizes.concat(
          linesWithLabels.map(line => line.endValue ? valueGauger(line.endValue) : 0)
        )
        if (endLabel) {
          endLabelSizes = endLabelSizes.concat(
            linesWithLabels.map(line => line.endLabel ? labelGauger(line.endLabel) + Y_END_LABEL_SPACE : 0)
          )
        }
      }

      return {
        key,
        values: linesWithLabels
      }
    })

  let colorLegend = !mini && colorValues.length > 0 && !endLabel
  let paddingLeft = 0
  let paddingRight = 0

  const whiteSpacePadding = groupedData.length > 1 && props.columns > 1 ? 15 : 0

  if (!mini) {
    const yConnectorSize = Y_CONNECTOR + Y_CONNECTOR_PADDING * 2
    const startValueSize = startValue ?
      Math.ceil(max(startValueSizes) + yConnectorSize) :
      0
    const endValueSize = Math.ceil(max(endValueSizes) + yConnectorSize)
    if (startValue) {
      paddingLeft = paddingRight = Math.max(startValueSize, endValueSize) + whiteSpacePadding
    } else {
      paddingRight = endValueSize + whiteSpacePadding
    }
    if (endLabel) {
      const endLabelSize = Math.ceil(max(endLabelSizes))
      if (startValueSize + endValueSize + endLabelSize > props.width - props.minInnerWidth) {
        colorLegend = true
        groupedData.forEach(({values: lines}) => {
          lines.forEach(line => {
            line.endLabel = false
          })
        })
      } else {
        if (startValue) {
          paddingLeft = startValueSize + whiteSpacePadding
        }
        paddingRight = endValueSize + endLabelSize + whiteSpacePadding
      }
    }
  }

  // transform all color values (always visible on small screens) and group titles for display
  const colorValuesForLegend = data
    .filter(d => labelFilter(d.datum))
    .map(colorAccessor)
    .filter(deduplicate)
    .filter(Boolean)
  runSort(props.colorSort, colorValuesForLegend)

  const colorLegendValues = colorValuesForLegend.map(value => ({
    color: color(value),
    label: subsup(value)
  }))

  const translatedYAnnotations = (yAnnotations || []).map(d => ({
    formattedValue: yFormat(d.value),
    ...d,
    label: d.label,
    x: d.x ? xParser(d.x) : undefined
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
    yAnnotations: translatedYAnnotations,
    colorLegend,
    colorLegendValues,
    paddingLeft,
    paddingRight,
    columnHeight
  }
}
