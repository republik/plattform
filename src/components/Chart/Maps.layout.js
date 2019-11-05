import { scaleOrdinal, scaleThreshold, scaleQuantize } from 'd3-scale'
import { geoPath } from 'd3-geo'
import { extent, range, descending } from 'd3-array'
import memoize from 'lodash/memoize'

import {
  getFormat,
  unsafeDatumFn,
  groupBy,
  runSort,
  deduplicate
} from './utils'

export const MARKER_HEIGHT = 20
export const MARKER_RADIUS = 5.5

const PADDING_TOP = MARKER_HEIGHT + 10
const PADDING_BOTTOM = 10
const COLUMN_PADDING = 30

export default (props, geoJson) => {
  const {
    values,
    width,
    mini,
    t,
    tLabel,
    choropleth,
    ignoreMissingFeature,
    missingDataLegend,
    color
  } = props

  let data = values
  if (props.filter) {
    const filter = unsafeDatumFn(props.filter)
    data = data.filter(filter)
  }
  data = data.map(d => {
    const value = +d.value
    return {
      datum: d,
      value: value,
      empty: !value && !d[props.color],
      featureId: String(d[props.feature])
    }
  })
  const marker = props.shape === 'marker'
  if (marker) {
    data.sort((a, b) => descending(a.datum.lat, b.datum.lat))
  }

  const numberFormat = getFormat(props.numberFormat, t)
  let domain
  let colorScale
  let colorAccessor = choropleth ? d => d.value : d => d[color] || 0
  let colorValues
  let colorRange = props.colorRanges[props.colorRange] || props.colorRange

  if (props.color) {
    colorScale = scaleOrdinal()
    colorAccessor = d => d.datum[props.color]
    domain = data.map(colorAccessor).filter(deduplicate)
    colorValues = domain.map(value => ({
      label: tLabel(value),
      value
    }))

    if (!colorRange) {
      colorRange =
        colorValues.length > 3
          ? props.colorRanges.discrete
          : props.colorRanges.sequential3
    }
    colorScale.domain(domain).range(colorRange)
  } else {
    const dataValues = data.map(d => d.value)
    const valuesExtent = props.extent || extent(dataValues)

    if (props.thresholds) {
      colorScale = scaleThreshold()
      domain = props.thresholds
      if (!colorRange) {
        colorRange = props.colorRanges.sequential.slice(0, domain.length + 1)
      }
    } else {
      colorScale = scaleQuantize()
      domain = valuesExtent
    }

    colorScale.domain(domain).range(colorRange || props.colorRanges.sequential)

    colorValues = colorScale.range().map(value => {
      const extent = colorScale.invertExtent(value)
      const safeExtent = [
        extent[0] === undefined ? valuesExtent[0] : extent[0],
        extent[1] === undefined ? valuesExtent[1] : extent[1]
      ]
      return {
        value: safeExtent[0],
        label: `${numberFormat(safeExtent[0])} ${tLabel('bis')} ${numberFormat(
          safeExtent[1]
        )}`
      }
    })
  }

  const projection = props.getProjection()
  const geoPathGenerator = geoPath().projection(projection)
  const projectPoint =
    typeof projection === 'function'
      ? projection
      : coordinates =>
          geoPathGenerator({ type: 'Point', coordinates })
            .split('m')[0]
            .slice(1)
            .split(',')
            .map(d => +d)

  const paddingTop = mini ? 15 : PADDING_TOP
  const paddingBottom = mini ? 0 : PADDING_BOTTOM
  let mapWidth
  let innerHeight

  if (props.height) {
    const height = props.height
    innerHeight = mini ? height - paddingTop - paddingBottom : height
    mapWidth = innerHeight * props.widthRatio
  } else {
    mapWidth = width
    innerHeight = mapWidth * props.heightRatio
  }
  if (geoJson) {
    projection.fitSize([width, innerHeight], geoJson.features)
    const bounds = geoPathGenerator.bounds(geoJson.features)
    mapWidth = bounds[1][0] - bounds[0][0]
    innerHeight = bounds[1][1] - bounds[0][1]
  }

  const columnPadding = mini ? 12 : COLUMN_PADDING
  const possibleColumns = Math.floor(width / (mapWidth + columnPadding))
  const columns =
    possibleColumns >= props.columns
      ? props.columns
      : Math.max(possibleColumns, 1)

  const padding = (width - mapWidth) / 2

  const leftAlign = props.leftAlign || columns > 1 || mini
  if (leftAlign) {
    const projectionTranslate = projection.translate()
    projection.translate([
      projectionTranslate[0] - padding,
      projectionTranslate[1]
    ])
  }

  const colorLegendValues = colorValues
    .map(color => ({
      label: color.label,
      color: colorScale(color.value)
    }))
    .concat(
      missingDataLegend
        ? {
            label: missingDataLegend,
            color: props.missingDataColor
          }
        : []
    )

  const geotiffs = {}
  const geotiff = props.geotiff
  const mapGeotiff = d => {
    let tl = projectPoint(d.bbox[0])
    let br = projectPoint(d.bbox[1])
    return {
      xlinkHref: d.url,
      x: tl[0],
      y: tl[1],
      width: br[0] - tl[0],
      height: br[1] - tl[1]
    }
  }
  if (geotiff) {
    geotiffs[''] = mapGeotiff(geotiff)
  }
  let groupedData
  if (props.columnFilter) {
    groupedData = props.columnFilter.map(
      ({ test, title, geotiff: columnGeotiff }) => {
        const filter = unsafeDatumFn(test)
        geotiffs[title] = mapGeotiff(columnGeotiff)
        return {
          key: title,
          values: data.filter(d => filter(d.datum))
        }
      }
    )
    data = groupedData.reduce((all, group) => all.concat(group.values), [])
  } else {
    groupedData = groupBy(data, d => d.datum[props.column])
  }
  // allow empty data for geotiff
  if (groupedData.length === 0) {
    groupedData = [{ key: '', values: [] }]
  }

  let groups = groupedData.map(g => g.key)
  runSort(props.columnSort, groups)

  const columnHeight = innerHeight + paddingTop + paddingBottom
  const gx = scaleOrdinal()
    .domain(groups)
    .range(range(columns).map(d => d * (mapWidth + columnPadding)))
  const gy = scaleOrdinal()
    .domain(groups)
    .range(
      range(groups.length).map(d => Math.floor(d / columns) * columnHeight)
    )
  const rows = Math.ceil(groups.length / columns)

  const paddingLeft = leftAlign ? 0 : padding
  const mapSpace = (mapWidth + (columns > 1 ? columnPadding : 0)) * columns
  const paddingRight = width - mapSpace - paddingLeft

  let featuresWithPaths = []
  let compositionBorderPath
  if (geoJson) {
    featuresWithPaths = geoJson.features.features.map(feature => {
      return {
        id: String(feature.id),
        path: geoPathGenerator(feature),
        bounds: memoize(() => geoPathGenerator.bounds(feature)),
        properties: feature.properties
      }
    })
    compositionBorderPath =
      geoJson.compositionBorders && geoPathGenerator(geoJson.compositionBorders)

    if (choropleth) {
      groupedData = groupedData.map(({ values, key: groupTitle }) => {
        const groupData = [].concat(values)
        groupData.forEach(d => {
          d.feature = featuresWithPaths.find(f => f.id === d.featureId)
          if (!ignoreMissingFeature && !d.feature) {
            throw new Error(
              `No feature for data ${d.featureId} ${
                groupTitle ? ` (${groupTitle})` : ''
              } ${d.value}`
            )
          }
        })

        featuresWithPaths.forEach(feature => {
          const d = groupData.find(datum => datum.featureId === feature.id)
          if (!d) {
            if (missingDataLegend === undefined) {
              throw new Error(
                `No data for feature ${feature.id} ${
                  groupTitle ? ` (${groupTitle})` : ''
                }`
              )
            }
            groupData.push({
              feature,
              empty: true
            })
          }
        })

        return {
          values: groupData,
          key: groupTitle
        }
      })
    }
  }

  return {
    paddingTop,
    paddingLeft,
    paddingRight,
    mapSpace,
    mapWidth,
    columnHeight,
    rows,
    gx,
    gy,
    projectPoint,
    colorScale,
    colorAccessor,
    domain,
    data,
    groupedData,
    geotiffs,
    featuresWithPaths,
    compositionBorderPath,
    colorLegendValues,
    numberFormat
  }
}
