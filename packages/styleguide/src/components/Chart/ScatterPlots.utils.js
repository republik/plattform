import { extent } from 'd3-array'
import { scaleLinear, scaleLog } from 'd3-scale'

export const scales = {
  linear: scaleLinear,
  log: scaleLog,
}

export const tickAccessor = (d) => d.tick

export const aggregateValues = (data, accessor, xTicks = [], xLines = []) =>
  data.map(accessor).concat(xTicks).concat(xLines.map(tickAccessor))

const getNice = (nice, plotDimension) =>
  nice === undefined
    ? Math.min(Math.max(Math.round(plotDimension / 150), 3), 5)
    : nice

export const getPlot = (scale, values, range, nice, plotDimension) => {
  const plotScale = scales[scale]().domain(extent(values)).range(range)
  const niceValue = getNice(nice, plotDimension)
  if (niceValue) {
    plotScale.nice(niceValue)
  }
  return plotScale
}
