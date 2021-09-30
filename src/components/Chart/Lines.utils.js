import { unsafeDatumFn, sortBy } from './utils'

export const Y_LABEL_HEIGHT = 14
export const Y_END_LABEL_SPACE = 3 // width of space between label and value

export const categorizeData = category => d => {
  if (category) {
    const categorize = unsafeDatumFn(category)
    return {
      ...d,
      category: categorize(d.datum)
    }
  }
  return d
}

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

  return keys.map(k => ({
    key: k,
    values: object[k]
  }))
}

const groupLines = (color, category) =>
  category ? d => d.category : d => d.datum[color]

export const groupByLines = (color, category) => ({ values, key }) => ({
  key,
  values: groupBy(values, groupLines(color, category))
})

export const addLabels = (
  color,
  colorAccessor,
  labelFilter,
  yFormat,
  y,
  highlight,
  stroke,
  startValue,
  endValue,
  endLabel
) => ({ values: line }) => {
  const start = line[0]
  const end = line[line.length - 1]
  const label = labelFilter(start.datum)

  const isHighlight = highlight ? unsafeDatumFn(highlight) : () => false
  const hasStroke = stroke ? unsafeDatumFn(stroke) : () => false

  return {
    line,
    start,
    end,
    highlighted: isHighlight(start.datum),
    stroked: hasStroke(start.datum),
    lineColor: color(colorAccessor(start)),
    startValue: label && startValue && yFormat(start.value),
    endValue: label && endValue && yFormat(end.value),
    endLabel: label && endLabel && ` ${colorAccessor(end)}`,
    startY: y(start.value),
    endY: y(end.value)
  }
}

export const calculateAndMoveLabelY = (linesWithLayout, property) => {
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
