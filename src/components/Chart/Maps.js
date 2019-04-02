import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { scaleOrdinal } from 'd3-scale'
import { symbol, symbolSquare, symbolCircle } from 'd3-shape'
import { geoIdentity, geoMercator, geoEqualEarth } from 'd3-geo'
import ColorLegend from './ColorLegend'
import layout, { MARKER_HEIGHT, MARKER_RADIUS } from './Maps.layout'
import fetch from 'isomorphic-unfetch'
import { css } from 'glamor'
import memoize from 'lodash/memoize'
import { feature as topojsonFeature, mesh as topojsonMesh } from 'topojson'

import Loader from '../Loader'

import ContextBox, { ContextBoxValue } from './ContextBox'

import {
  sansSerifMedium14
} from '../Typography/styles'

import colors from '../../theme/colors'

const FEATURE_BG = '#E0E0E0'

const styles = {
  columnTitle: css({
    ...sansSerifMedium14,
    fill: colors.text
  }),
  interactivePath: css({
    userSelect: 'none',
    WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)'
  }),
}

const symbolShapes = {
  square: symbolSquare,
  circle: symbolCircle
}
const shapes = Object.keys(symbolShapes).concat('marker')

const Points = ({data, colorScale, colorAccessor, project, shape, sizes, domain}) => {
  const marker = shape === 'marker'
  let symbolPath
  if (!marker) {
    const size = scaleOrdinal().domain(domain).range(sizes)
    symbolPath = symbol()
      .type(symbolShapes[shape])
      .size(d => size(colorAccessor(d)))
  }

  return (
    <g>
      {data.map((d, i) => {
        const color = colorScale(colorAccessor(d))
        let pos = project([d.datum.lon || d.datum.x, d.datum.lat || d.datum.y])
        if (marker) {
          pos = pos.map(Math.round)
        }
        return (
          <g key={i} transform={`translate(${pos.join(',')})`}>
            {marker && <circle cy={-MARKER_HEIGHT} r={MARKER_RADIUS} fill={color} stroke='white' strokeWidth='1' />}
            {marker && <line y2={-MARKER_HEIGHT} stroke={color} strokeWidth='2' shapeRendering='crispEdges' />}
            {!marker && (
              <path d={symbolPath(d)} fill={color} />
            )}
          </g>
        )
      })}
    </g>
  )
}

Points.propTypes = {
  data: PropTypes.array,
  colorScale: PropTypes.func.isRequired,
  colorAccessor: PropTypes.func.isRequired,
  project: PropTypes.func.isRequired,
  shape: PropTypes.oneOf(shapes).isRequired,
  domain: PropTypes.array,
  sizes: PropTypes.arrayOf(PropTypes.number)
}

// for synchronous access in constructor
const fetchJsonCacheData = new Map()
// memoize loading promise to avoid parallel double fetching
const fetchJson = memoize(url =>
  fetch(url)
    .then(response => response.json())
    .then(data => {
      fetchJsonCacheData.set(url, data)
      return data
    })
)

const getStateFromFeaturesData = (features, data) => {
  const geoJsonFeatures = topojsonFeature(data, data.objects[features.object])

  return {
    loading: false,
    geoJson: {
      features: geoJsonFeatures,
      compositionBorders: features.compositionBorders &&
        topojsonMesh(data, data.objects[features.compositionBorders])
    }
  }
}

export class GenericMap extends Component {
  constructor(props) {
    super(props)
    this.state = props.features && fetchJsonCacheData.has(props.features.url)
      ? getStateFromFeaturesData(
        props.features,
        fetchJsonCacheData.get(props.features.url)
      )
      : { loading: !!props.features }
    this.state.layout = layout(props, this.state.geoJson)
  }
  componentDidMount() {
    const { features } = this.props
    if (features) {
      fetchJson(features.url)
        .then(data => {
          this.setState(getStateFromFeaturesData(features, data))
        })
        .catch(error => {
          this.setState({ loading: false, error })
        })
    }
  }
  componentDidUpdate (prevProps, prevState) {
    if (prevProps !== this.props || prevState.geoJson !== this.state.geoJson) {
      this.setState({
        layout: layout(this.props, this.state.geoJson)
      })
    }
  }
  componentWillUnmount () {
    fetchJsonCacheData.clear()
    fetchJson.cache.clear()
  }
  renderTooltips() {
    const props = this.props
    const {
      width,
      tLabel,
      missingDataLegend
    } = props

    const {
      paddingTop,
      gx,
      gy,
      groupedData,
      numberFormat
    } = this.state.layout

    const { hoverFeature, title } = this.state

    return !!hoverFeature && groupedData.map(({ values: groupData, key: groupTitle }) => {
      return groupData.filter(datum => datum.feature === hoverFeature).map((d, i) => {
        const [[x0, y0], [x1]] = d.feature.bounds()
        return (
          <ContextBox
            key={d.feature.id}
            orientation='top'
            x={gx(groupTitle) + x0 + (x1 - x0) / 2}
            y={gy(groupTitle) + paddingTop + y0 - 15}
            contextWidth={width}>
            <ContextBoxValue
              label={title === groupTitle
                ? hoverFeature.properties.name
                : tLabel(groupTitle)}>
              {groupTitle && title === groupTitle && <Fragment>
                {tLabel(groupTitle)}<br />
              </Fragment>}
              {d.empty ? missingDataLegend : `${numberFormat(d.value)} ${props.unit}`}
            </ContextBoxValue>
          </ContextBox>
        )
      })
    })
  }
  render() {
    const { props, state } = this
    const {
      width,
      children,
      mini,
      tLabel,
      description,
      choropleth,
      colorLegendSize,
      missingDataColor
    } = props
    const {
      loading, error, geoJson
    } = state

    const {
      paddingTop,
      paddingLeft,
      mapSpace,
      mapWidth,
      columnHeight,
      rows,
      gx,
      gy,
      data,
      projectPoint,
      colorScale,
      colorAccessor,
      domain,
      groupedData,
      geotiffs,
      featuresWithPaths,
      compositionBorderPath,
      colorLegendValues
    } = this.state.layout

    let legendStyle
    if (mapSpace * colorLegendSize >= 110 || mini) {
      legendStyle = {
        position: 'absolute',
        top: mini ? 12 : paddingTop,
        left: paddingLeft + mapSpace * (1 - colorLegendSize) + 10
      }
    } else {
      legendStyle = {paddingLeft: paddingLeft}
    }

    const { hoverFeature } = this.state
    const hasTooltips = !!hoverFeature && choropleth
    const hasGeoJson = !!geoJson

    return (
      <div style={{position: 'relative'}}>
        <svg width={width} height={columnHeight * rows}>
          <desc>{description}</desc>
            {
              groupedData.map(({ values: groupData, key: title }) => {
                const geotiff = geotiffs[title]
                return (
                  <g key={title || 1} transform={`translate(${gx(title)},${gy(title)})`}>
                    <text
                      dy='1.5em' x={paddingLeft + (mapWidth / 2)}
                      textAnchor='middle'
                      {...styles.columnTitle}>
                      {tLabel(title)}
                    </text>
                    <g transform={`translate(0,${paddingTop})`}>
                      {
                        !choropleth && featuresWithPaths.map((feature) => {
                          return (
                            <path key={feature.id}
                              fill={FEATURE_BG}
                              stroke='white'
                              strokeWidth={1}
                              d={feature.path} />
                          )
                        })
                      }
                      {
                        choropleth && hasGeoJson && groupData.map(d => {
                          const {feature} = d
                          if (!feature) {
                            return null
                          }
                          let fill
                          if (d.empty) {
                            fill = missingDataColor
                          } else {
                            fill = colorScale(colorAccessor(d))
                          }
                          return (
                            <path key={feature.id}
                              fill={fill}
                              d={feature.path}
                              {...styles.interactivePath}
                              onTouchStart={() => this.setState({hoverFeature: feature, title})}
                              onTouchEnd={() => this.setState({hoverFeature: undefined, title: undefined})}
                              onMouseEnter={() => this.setState({hoverFeature: feature, title})}
                              onMouseLeave={() => this.setState({hoverFeature: undefined, title: undefined})} />
                          )
                        })
                      }
                      {
                        hasTooltips && featuresWithPaths
                          .filter(feature => feature.id === hoverFeature.id)
                          .map(feature => (
                            <path key={`stroke-${feature.id}`}
                              fill='none'
                              pointerEvents='none'
                              stroke='black'
                              strokeWidth={1}
                              d={feature.path} />
                          ))
                      }
                      {
                        geotiff && (
                          <image {...geotiff} />
                        )
                      }
                      {compositionBorderPath &&
                        <path
                          fill='none'
                          stroke='black'
                          strokeWidth={1}
                          d={compositionBorderPath} />}
                      {props.points && (
                        <Points
                          data={data}
                          colorScale={colorScale}
                          colorAccessor={colorAccessor}
                          domain={domain}
                          project={projectPoint}
                          shape={props.shape}
                          sizes={props.sizes} />
                      )}
                    </g>
                  </g>
                )
              })
            }
        </svg>
        {(!hasGeoJson || !!error) && (
          <div style={{
            position: 'absolute',
            left: paddingLeft,
            top: paddingTop,
            width: mapSpace
          }}>
            <Loader loading={loading} error={error} />
          </div>
        )}
        <div>
          <div style={legendStyle}>
            {!!props.geotiffLegendTitle && (
              <ColorLegend
                title={tLabel(props.geotiffLegendTitle)}
                values={props.geotiffLegend} />
            )}
            {!!props.colorLegend && <ColorLegend
              title={tLabel(props.legendTitle)}
              shape={props.shape}
              values={colorLegendValues} />}
          </div>
          {children}
        </div>
        {hasTooltips && this.renderTooltips()}
      </div>
    )
  }
}

const geotiffShape = PropTypes.shape({
  url: PropTypes.string.isRequired,
  bbox: PropTypes.arrayOf(
    PropTypes.arrayOf(PropTypes.array.isRequired)
  )
})
const featuresShape = PropTypes.shape({
  object: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired
})

GenericMap.propTypes = {
  children: PropTypes.node,
  values: PropTypes.array.isRequired,
  width: PropTypes.number.isRequired,
  // full width map, dynamic height
  heightRatio: PropTypes.number.isRequired,
  // static height
  height: PropTypes.number,
  // inner map width ratio to size canvas until geo data is loaded
  widthRatio: PropTypes.number,
  leftAlign: PropTypes.bool,
  mini: PropTypes.bool,
  column: PropTypes.string,
  columnSort: PropTypes.oneOf(['none', 'descending']),
  columnFilter: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    test: PropTypes.string.isRequired,
    geotiff: geotiffShape
  })),
  columns: PropTypes.number.isRequired,
  thresholds: PropTypes.arrayOf(PropTypes.number),
  extent: PropTypes.arrayOf(PropTypes.number),
  colorLegend: PropTypes.bool.isRequired,
  colorLegendSize: PropTypes.number.isRequired,
  colorRange: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  colorRanges: PropTypes.shape({
    sequential3: PropTypes.array.isRequired,
    discrete: PropTypes.array.isRequired,
    sequential: PropTypes.array.isRequired
  }).isRequired,
  shape: PropTypes.oneOf(shapes).isRequired,
  sizes: PropTypes.arrayOf(PropTypes.number),
  features: featuresShape,
  geotiff: geotiffShape,
  geotiffLegendTitle: PropTypes.string,
  geotiffLegend: PropTypes.arrayOf(PropTypes.shape({
    color: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired
  })),
  legendTitle: PropTypes.string,
  unit: PropTypes.string,
  numberFormat: PropTypes.string.isRequired,
  filter: PropTypes.string,
  points: PropTypes.bool.isRequired,
  choropleth: PropTypes.bool.isRequired,
  feature: PropTypes.string,
  missingDataLegend: PropTypes.string,
  missingDataColor: PropTypes.string.isRequired,
  ignoreMissingFeature: PropTypes.bool.isRequired,
  tLabel: PropTypes.func.isRequired,
  description: PropTypes.string,
  ordinalAccessor: PropTypes.string
}

GenericMap.defaultProps = {
  numberFormat: 's',
  columns: 1,
  unit: '',
  heightRatio: 1,
  colorLegend: true,
  colorLegendSize: 0.2,
  points: false,
  choropleth: false,
  missingDataColor: colors.disabled,
  ignoreMissingFeature: false,
  feature: 'feature',
  shape: 'circle',
  sizes: [10],
  getProjection: () => geoEqualEarth()
}

export const ProjectedMap = props => <GenericMap {...props} />

ProjectedMap.defaultProps = {
  getProjection: () => geoIdentity()
}

ProjectedMap.base = 'GenericMap'

export const SwissMap = props => <GenericMap {...props} />

SwissMap.defaultProps = {
  getProjection: () => geoMercator().rotate([-7.439583333333333, -46.95240555555556]),
  heightRatio: 0.63
}

SwissMap.base = 'GenericMap'
