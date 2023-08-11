import {
  FormatSpecifier,
  formatLocale,
  formatSpecifier,
  precisionFixed,
} from 'd3-format'
import { ascending, descending, max as d3Max, range, Primitive } from 'd3-array'
import { rgb } from 'd3-color'
import React, { createElement, Fragment } from 'react'
import PropTypes from 'prop-types'
import { scaleOrdinal } from 'd3-scale'

/**
 * Group items by a key function
 * @param array items to group
 * @param key function to generate key for grouping
 * @returns array of objects with key and values
 */
export function groupBy<T>(
  array: T[],
  key: (item: T, index: number) => string | undefined,
): {
  key: string
  values: T[]
}[] {
  const keys: string[] = []

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

export const sortPropType = PropTypes.oneOf(['none', 'ascending', 'descending'])

export const runSort = (cmd, array, accessor = (d) => d) => {
  if (cmd !== 'none') {
    const compare = cmd === 'descending' ? descending : ascending
    const original = [].concat(array)
    array.sort(
      (a, b) =>
        compare(accessor(a), accessor(b)) ||
        ascending(original.indexOf(a), original.indexOf(b)), // stable sort
    )
  }
}

/**
 * Sort items by the accessor function
 * @param array items to sort
 * @param accessor function to access the value to sort by
 * @returns sorted array
 */
export function sortBy<T>(array: T[], accessor: (item: T) => Primitive): T[] {
  return [].concat(array).sort(
    (a, b) =>
      ascending(accessor(a), accessor(b)) ||
      ascending(array.indexOf(a), array.indexOf(b)), // stable sort
  )
}

const thousandSeparator = '\u2019'
export const swissNumbers = formatLocale({
  decimal: ',',
  thousands: thousandSeparator,
  grouping: [3],
  currency: ['CHF\u00a0', ''],
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  minus: '\u2212',
  percent: '\u2009%',
})

/**
 * Format a number with a suffix if it is too large.
 * @param tLabel function to get a label
 * @param baseValue value to get the suffix for
 * @returns formated value and suffix
 */
function formatPow(
  tLabel: (arg0: string) => string,
  baseValue: number,
): {
  scale: (arg0: number) => number
  suffix: string
} {
  const decimalFormat = swissNumbers.format('.0f')
  const [n] = decimalFormat(baseValue).split('.')

  if (n.length > 9) {
    return {
      scale: (value) => value / Math.pow(10, 9),
      suffix: tLabel(' Mrd.'),
    }
  } else if (n.length > 6) {
    return {
      scale: (value) => value / Math.pow(10, 6),
      suffix: tLabel(' Mio.'),
    }
  } else {
    return {
      scale: (value) => value,
      suffix: '',
    }
  }
}

/**
 * Format large numbers
 * @param tLabel function to get a label
 * @param precision comma precision
 * @param pow helper to get the suffix for large numbers
 * @param type format type {@type FormatSpecifier['type']}
 * @returns function to format a number
 */
const sFormat = (
  tLabel: (arg0: string) => string,
  precision = 4,
  pow: ReturnType<typeof formatPow> = undefined,
  type: FormatSpecifier['type'] = 'r',
): ((arg0: number) => string) => {
  const numberFormat4 = swissNumbers.format('d')
  const numberFormat5 = swissNumbers.format(',d')
  const numberFormat = (value) => {
    if (String(Math.abs(Math.round(value))).length > 4) {
      return numberFormat5(value)
    }
    return numberFormat4(value)
  }
  // we only round suffixed values to precision
  const numberFormatWithSuffix4 = swissNumbers.format(`.${precision}${type}`)
  const numberFormatWithSuffix5 = swissNumbers.format(`,.${precision}${type}`)
  const numberFormatWithSuffix = (value) => {
    if (String(Math.abs(Math.round(value))).length > 4) {
      return numberFormatWithSuffix5(value)
    }
    return numberFormatWithSuffix4(value)
  }
  return (value) => {
    const fPow = pow || formatPow(tLabel, value)
    if (fPow.suffix) {
      return numberFormatWithSuffix(fPow.scale(value)) + fPow.suffix
    }
    return numberFormat(fPow.scale(value))
  }
}

/**
 * Get formater for numbers
 * Up to 4 digits don't use a thousand separator
 * @param numberFormat format of the resulting number
 * @param tLabel function to get a label
 * @returns function to format a number
 */
export function getFormat(
  numberFormat: string,
  tLabel: (arg0: string) => string,
): (arg0: number) => string {
  const specifier: FormatSpecifier = formatSpecifier(numberFormat)

  if (specifier.type === 's') {
    return sFormat(tLabel, specifier.precision)
  }
  if (specifier.comma) {
    const numberFormat5 = swissNumbers.format(specifier.toString())
    specifier.comma = false
    const numberFormat4 = swissNumbers.format(specifier.toString())
    return (value) => {
      if (String(Math.abs(Math.round(value))).length > 4) {
        return numberFormat5(value)
      }
      return numberFormat4(value)
    }
  }
  return swissNumbers.format(specifier.toString())
}

export function last<T>(array: T[], index: number): boolean {
  return array.length - 1 === index
}

/**
 * Calculate ticks, format, axisFormat and domain
 * @param numberFormat format of the resulting number
 * @param tLabel function to get a label
 * @param domain min and max value of the axis
 * @param unit unit of the axis
 * @param ticks predefined ticks
 * @returns ticks, format, axisFormat and domain
 */
export function calculateAxis(
  numberFormat: string,
  tLabel: (arg0: string) => string,
  domain: [number, number],
  unit = '',
  { ticks: predefinedTicks }: { ticks?: number[] } = {},
): {
  ticks: number[]
  format: (value: number) => string
  axisFormat: (value: number, isLast: boolean) => string
  domain: [number, number]
} {
  const [min, max] = domain
  const step = (max - min) / 2
  const ticks = predefinedTicks || [
    min,
    min < 0 && max > 0 ? 0 : min + step,
    max,
  ]
  const format = swissNumbers.format

  const specifier = formatSpecifier(numberFormat)
  const formatter = getFormat(numberFormat, tLabel)
  let regularFormat
  let lastFormat: ReturnType<typeof getFormat>
  if (specifier.type === '%') {
    const fullStep = +(ticks[1] * 100).toFixed(specifier.precision)
    const fullMax = +(max * 100).toFixed(specifier.precision)
    specifier.precision = precisionFixed(
      fullStep - Math.floor(fullStep) || fullMax - Math.floor(fullMax),
    )
    lastFormat = format(specifier.toString())
    specifier.type = 'f'
    const regularFormatInner = format(specifier.toString())
    regularFormat = (value) => regularFormatInner(value * 100)
  } else if (specifier.type === 's') {
    const magnitude = d3Max([max - (min > 0 ? min : 0), min].map(Math.abs))
    const pow = formatPow(tLabel, Math.max(0, min) + magnitude / 2)
    specifier.precision = precisionFixed(
      ticks.reduce(
        (precision, value) =>
          precision || pow.scale(value) - Math.floor(pow.scale(value)),
        0,
      ),
    )

    lastFormat = sFormat(tLabel, specifier.precision, pow, 'f')
    regularFormat = sFormat(
      tLabel,
      specifier.precision,
      { scale: pow.scale, suffix: '' },
      'f',
    )
  } else {
    specifier.precision = d3Max(
      ticks.map((tick, i) =>
        Math.max(
          i && precisionFixed(tick - ticks[i - 1]),
          precisionFixed(tick - Math.floor(tick)),
        ),
      ),
    )
    lastFormat = regularFormat = getFormat(specifier.toString(), () => '')
  }
  const axisFormat = (value: number, isLast: boolean): string =>
    isLast ? `${lastFormat(value)} ${unit}` : regularFormat(value)

  return {
    ticks,
    format: formatter,
    axisFormat,
    domain,
  }
}

// TODO
export const get3EqualDistTicks = (scale) => {
  const range = scale.range()
  return [
    scale.invert(range[0]),
    scale.invert(range[0] + (range[1] - range[0]) / 2),
    scale.invert(range[1]),
  ]
}

// TODO
const subSupSplitter = (createTag) => {
  return (input) => {
    if (!input) {
      return input
    }

    return String(input)
      .split(/(<sub>|<sup>)([^<]+)<\/su[bp]>/g)
      .reduce((elements, text, i) => {
        if (text === '<sub>' || text === '<sup>') {
          elements.nextElement = text.replace('<', '').replace('>', '')
        } else {
          if (elements.nextElement) {
            elements.push(
              createTag(elements.nextElement, elements.nextElement + i, text),
            )
            elements.nextElement = null
          } else {
            elements.push(text)
          }
        }
        return elements
      }, [])
  }
}

// TODO
export const subsup = subSupSplitter((tag, key, text) =>
  createElement(tag, { key }, text),
)
subsup.svg = subSupSplitter((tag, key, text) => {
  const dy = tag === 'sub' ? '0.25em' : '-0.5em'
  return (
    <Fragment key={key}>
      <tspan dy={dy} fontSize='75%'>
        {text}
      </tspan>
      {/* reset dy: https://stackoverflow.com/a/33711370 */}
      {/* adds a zero width space */}
      <tspan dy={tag === 'sub' ? `-${dy}` : dy.slice(1)} fontSize='75%'>
        {'\u200b'}
      </tspan>
    </Fragment>
  )
})

export const transparentAxisStroke = 'rgba(0,0,0,0.17)'
export const circleFill = '#fff'

export function deduplicate<T>(d: T, i: number, all: T[]): boolean {
  return all.indexOf(d) === i
}

// This is unsafe
// - all props that are passed to unsafeDatumFn should not be user defined
//   currently: filter, columnFilter.test, category, highlight
// eslint-disable-next-line no-new-func
export const unsafeDatumFn = (code) => new Function('datum', `return ${code}`)

export const getTextColor = (bgColor) => {
  const color = rgb(bgColor)
  const yiq = (color.r * 299 + color.g * 587 + color.b * 114) / 1000
  return yiq >= 128 ? 'black' : 'white'
}

export const xAccessor = <T,>(d: { x: T }): T => d.x

export const yAccessor = <T,>(d: { y: T }): T => d.y

export const isValuePresent = <T,>(value: T | null | undefined): boolean =>
  value?.toString()?.length > 0

export const identityFn = <T,>(x: T): T => x

export const getDataFilter = (userFilter) =>
  userFilter ? unsafeDatumFn(userFilter) : identityFn

export const groupInColumns = (data, column, columnFilter) =>
  columnFilter
    ? columnFilter
        .map(({ test, title }) => {
          const filter = unsafeDatumFn(test)
          return {
            key: title,
            values: data.filter((d) => filter(d.datum)),
          }
        })
        .reduce((all, group) => all.concat(group.values), [])
    : groupBy(data, (d) => d.datum[column])

const getColumnCount = (
  itemCount,
  userColumns,
  width,
  minWidth,
  paddingLeft,
  paddingRight,
  skipRowPadding,
) => {
  const possibleColumns = Math.floor(
    (width + (skipRowPadding ? paddingLeft + paddingRight : 0)) /
      (minWidth + paddingLeft + paddingRight),
  )
  let columns = userColumns
  if (possibleColumns < userColumns) {
    columns = Math.max(possibleColumns, 1)
    // decrease columns if it does not lead to new rows
    // e.g. four items, 4 desired columns, 3 possible => go with 2 columns
    if (
      Math.ceil(itemCount / columns) === Math.ceil(itemCount / (columns - 1))
    ) {
      columns -= 1
    }
  }
  return columns
}

const xTranslateFn = (groups, columns, innerWidth, paddingLeft, paddingRight) =>
  scaleOrdinal()
    .domain(groups)
    .range(
      range(columns).map((d) => {
        return d * (innerWidth + paddingRight + paddingLeft)
      }),
    )

const yTranslateFn = (groups, columns, columnHeight, columnMargin) =>
  scaleOrdinal()
    .domain(groups)
    .range(
      range(groups.length).map((d) => {
        const row = Math.floor(d / columns)
        return row * columnHeight + row * columnMargin
      }),
    )

export const getColumnLayout = (
  userColumns,
  groupedData,
  width,
  minWidth,
  getHeight,
  columnSort,
  paddingTop,
  paddingRight,
  paddingBottom,
  paddingLeft,
  columnMargin,
  skipRowPadding,
) => {
  const itemCount = groupedData.length
  const columns = getColumnCount(
    itemCount,
    userColumns,
    width,
    minWidth,
    paddingLeft,
    paddingRight,
    skipRowPadding,
  )
  const rows = Math.ceil(itemCount / columns)
  // account for start and end of columns missing padding when skipping row padding
  const innerWidth =
    Math.floor(
      (width -
        (paddingLeft + paddingRight) *
          (skipRowPadding ? columns - 1 : columns)) /
        columns,
    ) - 1
  const innerHeight = getHeight(innerWidth)
  const columnHeight = innerHeight + paddingBottom + paddingTop
  const height = rows * columnHeight + (rows - 1) * columnMargin

  const groups = groupedData.map((g) => g.key)
  runSort(columnSort, groups)
  const gx = xTranslateFn(
    groups,
    columns,
    innerWidth,
    paddingLeft,
    paddingRight,
  )
  const gy = yTranslateFn(groups, columns, columnHeight, columnMargin)

  return { height, innerWidth, innerHeight, gx, gy }
}

// get last item from array
export function isLastItem<T>(array: T[], index: number): boolean {
  return array.length - 1 === index
}

export const textAlignmentDict = {
  left: 'start',
  center: 'middle',
  right: 'end',
}
