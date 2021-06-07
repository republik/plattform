import * as d3Intervals from 'd3-time'
import { deduplicate } from './utils'

export const intervals = Object.keys(d3Intervals)
  .filter(key => key.match(/^time/) && key !== 'timeInterval')
  .reduce((all, key) => {
    all[key.replace(/^time/, '').toLowerCase()] = d3Intervals[key]
    return all
  }, {})

export const normalizeData = (x, xNormalizer) => d => ({
  datum: d,
  x: xNormalizer(d[x]),
  value: +d.value
})

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
        gap
      })
    }
    return lines
  }, [])
}

const getInterval = (xInterval, xProp, timeParse) =>
  intervals[xInterval] ||
  (xProp === 'year' && timeParse === '%Y' && intervals.year)

const getIntervalDomain = (
  xValues,
  interval,
  xIntervalStep,
  xParser,
  xParserFormat,
  x
) => {
  const gapsNeeded = Math.max(
    Math.ceil(
      // at least 26 px
      26 / Math.max(x.bandwidth(), 1)
    ),
    2 // at least 2 bars
  )
  return xValues.reduce((values, value, index, all) => {
    values.push(value)
    const next = interval.offset(xParser(value), xIntervalStep)
    if (all.indexOf(xParserFormat(next)) === -1 && index !== all.length - 1) {
      for (let i = 0; i < gapsNeeded; i++) {
        values.push(`GAP|${value}|${i}`)
      }
    }
    return values
  }, [])
}

export const getXDomain = (
  xValues,
  xInterval,
  xProp,
  timeParse,
  xIntervalStep,
  xParser,
  xParserFormat,
  x
) => {
  const interval = getInterval(xInterval, xProp, timeParse)
  return interval
    ? getIntervalDomain(
        xValues,
        interval,
        xIntervalStep,
        xParser,
        xParserFormat,
        x
      )
    : xValues
}

export const sumSegments = (sum, segment) => sum + segment.value

export const getAnnotationsXValues = (annotations, xNormalizer) =>
  annotations
    .reduce(
      (years, annotation) =>
        years.concat(annotation.x, annotation.x1, annotation.x2),
      []
    )
    .filter(Boolean)
    .map(xNormalizer) // ensure format
