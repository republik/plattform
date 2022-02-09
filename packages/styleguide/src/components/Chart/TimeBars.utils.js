import * as d3Intervals from 'd3-time'
import { deduplicate, groupBy, xAccessor } from './utils'
import { max, min } from 'd3-array'

export const intervals = Object.keys(d3Intervals)
  .filter((key) => key.match(/^time/) && key !== 'timeInterval')
  .reduce((all, key) => {
    all[key.replace(/^time/, '').toLowerCase()] = d3Intervals[key]
    return all
  }, {})

export const getXTicks = (userTicks, xValues, xNormalizer, x) => {
  if (userTicks) {
    return userTicks.map(xNormalizer)
  }
  // 12px a average number width
  return x.step() >= xValues[0].length * 12
    ? xValues
    : [xValues[0], xValues[xValues.length - 1]].filter(deduplicate)
}

export const getBaselines = (xDomain, x, width) => {
  const xDomainLast = xDomain[xDomain.length - 1]
  const barWidth = x.bandwidth()
  const barStep = x.step()
  const barPadding = barStep - barWidth
  return xDomain.reduce((lines, xValue) => {
    let previousLine = lines[lines.length - 1]
    let x1 = previousLine ? previousLine.x2 : 0
    let x2 = xValue === xDomainLast ? width : x(xValue) + barStep
    const gap = xValue.split('|')[0] === 'GAP'
    if (gap) {
      x2 -= barPadding
    }

    if (previousLine && previousLine.gap === gap) {
      previousLine.x2 = x2
    } else {
      lines.push({
        x1,
        x2,
        gap,
      })
    }
    return lines
  }, [])
}

const getIntervals = (xInterval, xProp, timeParse) =>
  intervals[xInterval] ||
  (xProp === 'year' && timeParse === '%Y' && intervals.year)

const insertXGaps = (
  xValues,
  intervals,
  xIntervalStep,
  xParser,
  xParserFormat,
  x,
) => {
  const gapsNeeded = Math.max(
    Math.ceil(
      // at least 26 px
      26 / Math.max(x.bandwidth(), 1),
    ),
    2, // at least 2 bars
  )
  return xValues.reduce((values, value, index, all) => {
    values.push(value)
    const next = intervals.offset(xParser(value), xIntervalStep)
    if (all.indexOf(xParserFormat(next)) === -1 && index !== all.length - 1) {
      for (let i = 0; i < gapsNeeded; i++) {
        values.push(`GAP|${value}|${i}`)
      }
    }
    return values
  }, [])
}

export const insertXDomainGaps = (
  xValues,
  xInterval,
  xProp,
  timeParse,
  xIntervalStep,
  xParser,
  xParserFormat,
  x,
) => {
  const intervals = getIntervals(xInterval, xProp, timeParse)
  return intervals
    ? insertXGaps(xValues, intervals, xIntervalStep, xParser, xParserFormat, x)
    : xValues
}

const sumSegments = (sum, segment) => sum + segment.value

const mergeSegments = ({ values: segments, key: x }) => ({
  segments,
  up: segments.filter((segment) => segment.value > 0).reduce(sumSegments, 0),
  down: segments.filter((segment) => segment.value < 0).reduce(sumSegments, 0),
  x,
})

export const processSegments = (data) => ({
  bars: groupBy(data.values, xAccessor).map(mergeSegments),
  key: data.key,
})

const getGroupMin = (group) => min(group.bars, (d) => d.down)

const getGroupMax = (group) => max(group.bars, (d) => d.up)

export const getMin = (groupedData) => {
  return min([0].concat(groupedData.map(getGroupMin)))
}

export const getMax = (groupedData) => max(groupedData.map(getGroupMax))
