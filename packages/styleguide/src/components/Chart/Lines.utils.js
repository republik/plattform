import { unsafeDatumFn, sortBy, isValuePresent } from './utils'
import { scaleLinear, scaleLog } from 'd3-scale'
import { createTextGauger } from '../../lib/textGauger'

import {
  sansSerifMedium12 as VALUE_FONT,
  sansSerifRegular12 as LABEL_FONT,
} from '../Typography/styles'

export const yScales = {
  linear: scaleLinear,
  log: scaleLog,
}

export const Y_LABEL_HEIGHT = 14
export const Y_END_LABEL_SPACE = 3 // width of space between label and value

export const groupBy = (array, key) => {
  const keys = []
  const object = array.reduce((o, item, index) => {
    const k = key(item, index) || ''
    if (!o[k]) {
      o[k] = []
      keys.push(k)
    }
    o[k].push(item)
    return o
  }, {})

  return keys.map((k) => ({
    key: k,
    values: object[k],
  }))
}

const groupLines = (color, category) =>
  category ? (d) => d.category : (d) => d.datum[color]

export const groupByLines =
  (color, category) =>
  ({ values, key }) => ({
    key,
    values: groupBy(values, groupLines(color, category)),
  })

const getMiddleOfRange = (field, d) => {
  const lower = +d.datum[`${field}_lower`]
  const upper = +d.datum[`${field}_upper`]
  return lower + (upper - lower) / 2
}

export const addLabels =
  (color, colorAccessor, labelFilter, yFormat, y, props) =>
  ({ values: line }) => {
    const start = line[0]
    const end = line[line.length - 1]
    const label = labelFilter(start.datum)

    const isHighlight = props.highlight
      ? unsafeDatumFn(props.highlight)
      : () => false
    const hasStroke = props.stroke ? unsafeDatumFn(props.stroke) : () => false

    const hasStartValue = isValuePresent(start.value)
    const hasEndValue = isValuePresent(end.value)
    const endLabel = label && props.endLabel && colorAccessor(end)

    return {
      line,
      start,
      end,
      highlighted: isHighlight(start.datum),
      stroked: hasStroke(start.datum),
      lineColor: color(colorAccessor(start)),
      startValue:
        label && props.startValue && hasStartValue && yFormat(start.value),
      endValue: label && props.endValue && hasEndValue && yFormat(end.value),
      endLabel,
      startY: hasStartValue ? y(start.value) : undefined,
      endY: hasEndValue
        ? y(end.value)
        : props.area && end.datum[`${props.area}_lower`]
        ? y(getMiddleOfRange(props.area, end))
        : undefined,
    }
  }

export const calculateAndMoveLabelY = (linesWithLayout, property) => {
  let labelsMoved = 0
  let lastY = -Infinity
  sortBy(
    linesWithLayout.filter(
      (line) => line[`${property}Value`] || line[`${property}Label`],
    ),
    (line) => line[`${property}Y`],
  ).forEach((line) => {
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

export const valueAccessor = (d) => d.value

export const appendAnnotations = (values, annotations) =>
  annotations ? values.concat(annotations.map(valueAccessor)) : values

export const valueGauger = createTextGauger(VALUE_FONT, {
  dimension: 'width',
  html: true,
})
export const labelGauger = createTextGauger(LABEL_FONT, {
  dimension: 'width',
  html: true,
})
