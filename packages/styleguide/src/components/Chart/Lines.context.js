import { min, max } from 'd3-array'
import { scaleLinear, scaleTime, scalePoint } from 'd3-scale'
import { timeYear } from 'd3-time'

import {
  deduplicate,
  groupInColumns,
  getColumnLayout,
  unsafeDatumFn,
  calculateAxis,
  runSort,
  sortBy,
} from './utils'

import {
  groupByLines,
  calculateAndMoveLabelY,
  yScales,
  valueAccessor,
  appendAnnotations,
  valueGauger,
  labelGauger,
  addLabels,
} from './Lines.utils'

import {
  COLUMN_TITLE_HEIGHT,
  AXIS_BOTTOM_HEIGHT,
  AXIS_TOP_HEIGHT,
  AXIS_BOTTOM_CUTOFF_HEIGHT,
  AXIS_BOTTOM_XUNIT_HEIGHT,
  Y_CONNECTOR,
  Y_CONNECTOR_PADDING,
  Y_GROUP_MARGIN,
  Y_END_LABEL_SPACE,
} from './Layout.constants'

export const linesProcesser = ({
  props,
  data,
  colorAccessor,
  color,
  colorValues,
  xValuesUnformatted,
  xFormat,
  xParser,
}) => {
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
    const dataWithBand = data.filter((d) => d.datum[`${props.band}_lower`])
    yValues = yValues
      .concat(dataWithBand.map((d) => +d.datum[`${props.band}_lower`]))
      .concat(dataWithBand.map((d) => +d.datum[`${props.band}_upper`]))
  }
  if (props.area) {
    const dataWithArea = data.filter((d) => d.datum[`${props.area}_lower`])
    yValues = yValues
      .concat(dataWithArea.map((d) => +d.datum[`${props.area}_lower`]))
      .concat(dataWithArea.map((d) => +d.datum[`${props.area}_upper`]))
  }
  const yTicks = props.yLines ? props.yLines.map((d) => d.tick) : props.yTicks
  if (yTicks) {
    yValues = yValues.concat(yTicks)
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
      ticks: yTicks,
    },
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

  groupedData = groupedData
    .map(groupByLines(props.color, props.category))
    .map(({ values: lines, key }) => {
      const linesWithLabels = lines.map(
        addLabels(color, colorAccessor, labelFilter, yFormat, y, props),
      )
      let labelsMoved = 0
      labelsMoved += calculateAndMoveLabelY(linesWithLabels, 'start')
      labelsMoved += calculateAndMoveLabelY(linesWithLabels, 'end')
      yNeedsConnectors =
        yNeedsConnectors || (labelsMoved >= 1 && linesWithLabels.length > 2)

      if (startValue) {
        startValueSizes = startValueSizes.concat(
          linesWithLabels.map((line) =>
            line.startValue ? valueGauger(line.startValue) : 0,
          ),
        )
      }
      if (!props.mini) {
        endValueSizes = endValueSizes.concat(
          linesWithLabels.map((line) =>
            line.endValue ? valueGauger(line.endValue) : 0,
          ),
        )
        if (endLabel) {
          endLabelSizes = endLabelSizes.concat(
            linesWithLabels.map((line) =>
              line.endLabel
                ? labelGauger(line.endLabel) + Y_END_LABEL_SPACE
                : 0,
            ),
          )
        }
      }

      return {
        key,
        values: linesWithLabels,
      }
    })

  let colorLegend = !endLabel || props.colorLegend === true

  const yConnectorSize = yNeedsConnectors
    ? Y_CONNECTOR + Y_CONNECTOR_PADDING * 2
    : Y_CONNECTOR_PADDING * 2

  const whiteSpacePadding = groupedData.length > 1 && props.columns > 1 ? 15 : 0
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
      if (startValueSize + endLabelWidth > props.width - props.minInnerWidth) {
        colorLegend = true
        groupedData.forEach(({ values: lines }) => {
          lines.forEach((line) => {
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

  const colorValuesForLegend = colorLegend
    ? data
        .filter((d) => labelFilter(d.datum))
        .map(colorAccessor)
        .filter(deduplicate)
        .filter(Boolean)
    : []
  runSort(props.colorSort, colorValuesForLegend)

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
    Y_GROUP_MARGIN,
  )

  let x
  let xTicks = props.xTicks && props.xTicks.map(xParser)
  let xDomain
  if (props.xScale === 'time') {
    const xTimes = xValuesUnformatted.map((d) => d.getTime())
    const domainTime = [min(xTimes), max(xTimes)]
    const domain = domainTime.map((d) => new Date(d))
    x = scaleTime().domain(domain)
    xDomain = domain

    if (!props.xTicks) {
      let yearInteval = Math.round(timeYear.count(domain[0], domain[1]) / 3)

      let time1 = timeYear.offset(domain[0], yearInteval).getTime()
      let time2 = timeYear.offset(domain[1], -yearInteval).getTime()

      xTicks = [
        domainTime[0],
        sortBy(xTimes, (d) => Math.abs(d - time1))[0],
        sortBy(xTimes, (d) => Math.abs(d - time2))[0],
        domainTime[1],
      ]
        .filter(deduplicate)
        .map((d) => new Date(d))
    }
  } else if (props.xScale === 'linear') {
    const domain = [min(xValuesUnformatted), max(xValuesUnformatted)]
    x = scaleLinear().domain(domain)
    xTicks = xTicks || domain
    xDomain = domain
  } else {
    const domain = xValuesUnformatted.filter(deduplicate)
    xDomain = domain
    x = scalePoint().domain(domain)
    if (!xTicks && domain.length > 5) {
      let maxIndex = domain.length - 1
      xTicks = [
        domain[0],
        domain[Math.round(maxIndex * 0.33)],
        domain[Math.round(maxIndex * 0.66)],
        domain[maxIndex],
      ].filter(deduplicate)
    } else if (!xTicks) {
      xTicks = domain
    }
  }
  if (props.mini) {
    xTicks = [xTicks[0], xTicks[xTicks.length - 1]]
  }
  x.range([0, innerWidth])

  const translatedYAnnotations = (props.yAnnotations || []).map((d) => ({
    formattedValue: yFormat(d.value),
    ...d,
    x: d.x ? xParser(d.x) : undefined,
  }))
  const translatedXAnnotations = (props.xAnnotations || []).map((d) => {
    const longestLabel =
      d.label &&
      d.label.split('\n').reduce((a, b) => (a.length > b.length ? a : b))

    return {
      formattedValue: yFormat(d.value),
      ...d,
      x: d.x ? xParser(d.x) : undefined,
      x1: d.x1 ? xParser(d.x1) : undefined,
      x2: d.x2 ? xParser(d.x2) : undefined,
      labelSize: d.label ? labelGauger(longestLabel) : 0,
    }
  })

  return {
    groupedData,
    height,
    innerWidth,
    groupPosition: { y: gy, x: gx },
    yAxis: {
      ...yAxis,
      scale: y,
    },
    xAxis: {
      scale: x,
      domain: xDomain,
      ticks: xTicks,
      format: xFormat,
      axisFormat: xFormat,
    },
    yLayout: { yCut, yCutHeight, yNeedsConnectors, yConnectorSize },
    paddingLeft,
    paddingRight,
    columnHeight,
    yAnnotations: translatedYAnnotations,
    xAnnotations: translatedXAnnotations,
    colorValuesForLegend,
  }
}
