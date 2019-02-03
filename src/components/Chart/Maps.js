import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { scaleOrdinal } from 'd3-scale'
import { symbol, symbolSquare, symbolCircle } from 'd3-shape'
import { geoMercator } from 'd3-geo'
import ColorLegend from './ColorLegend'
import layout, { MARKER_HEIGHT, MARKER_RADIUS } from './Maps.layout'
import fetch from 'isomorphic-unfetch'
import { css } from 'glamor'
import memoize from 'lodash/memoize'
import { feature as topojsonFeature } from 'topojson'

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

const Points = ({data, colorScale, colorAccessor, projection, shape, sizes, domain}) => {
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
        let pos = projection([d.datum.lon, d.datum.lat])
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
  projection: PropTypes.func.isRequired,
  shape: PropTypes.oneOf(shapes).isRequired,
  domain: PropTypes.array,
  sizes: PropTypes.arrayOf(PropTypes.number)
}


const fetchJson = memoize(url =>
  fetch(url).then(response => response.json())
)
const fetchFeature = memoize(feature =>
  fetchJson(feature.url)
    .then(data => topojsonFeature(data, data.objects[feature.object]))
)

class GenericMap extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: true
    }
    this.state.layout = layout(props)
  }
  componentDidMount() {
    const { features } = this.props
    if (features) {
      fetchFeature(features)
        .then(data => {
          this.setState({
            loading: false,
            features: data
          })
        })
        .catch(error => {
          this.setState({ loading: false, error })
        })
    }
  }
  componentDidUpdate (prevProps, prevState) {
    if (prevProps !== this.props || prevState.features !== this.state.features) {
      this.setState({
        layout: layout(this.props, this.state.features)
      })
    }
  }
  componentWillUnmount () {
    fetchFeature.cache.clear()
    fetchJson.cache.clear()
  }
  renderTooltips() {
    const props = this.props
    const {
      width,
      tLabel
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
              {`${numberFormat(d.value)} ${props.unit}`}
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
      ignoreMissing
    } = props
    const {
      loading, error, features
    } = state

    const {
      paddingTop,
      paddingLeft,
      paddingRight,
      mapSpace,
      mapWidth,
      columnHeight,
      rows,
      gx,
      gy,
      data,
      projection,
      colorScale,
      colorAccessor,
      domain,
      groupedData,
      geotiffs,
      featuresWithPaths,
      colorLegendValues
    } = this.state.layout

    let legendStyle
    if (paddingRight >= 110 || mini) {
      legendStyle = {
        position: 'absolute',
        top: mini ? 12 : 80,
        left: paddingLeft + mapSpace
      }
    } else {
      legendStyle = {paddingLeft: paddingLeft}
    }

    const { hoverFeature } = this.state
    const hasTooltips = !!hoverFeature && choropleth
    const hasGeoJson = !!features

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
                            fill = ignoreMissing ? colors.disabled : 'red'
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
                      {props.points && (
                        <Points
                          data={data}
                          colorScale={colorScale}
                          colorAccessor={colorAccessor}
                          domain={domain}
                          projection={projection}
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
  // inner map width ratio to size canvas until geo data is loaded
  widthRatio: PropTypes.number.isRequired,
  leftAlign: PropTypes.bool,
  mini: PropTypes.bool,
  height: PropTypes.number.isRequired,
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
  legendTitle: PropTypes.string.isRequired,
  unit: PropTypes.string,
  numberFormat: PropTypes.string.isRequired,
  filter: PropTypes.string,
  points: PropTypes.bool.isRequired,
  choropleth: PropTypes.bool.isRequired,
  feature: PropTypes.string,
  ignoreMissing: PropTypes.bool.isRequired,
  tLabel: PropTypes.func.isRequired,
  description: PropTypes.string,
  ordinalAccessor: PropTypes.string
}

GenericMap.defaultProps = {
  numberFormat: 's',
  columns: 1,
  height: 290,
  widthRatio: 1,
  unit: '',
  colorLegend: true,
  points: false,
  choropleth: false,
  ignoreMissing: false,
  feature: 'feature',
  shape: 'circle',
  sizes: [10]
}

export const SwissMap = props => <GenericMap {...props} />

SwissMap.defaultProps = {
  getProjection: () => geoMercator().rotate([-7.439583333333333, -46.95240555555556]),
  choropleth: true,
  widthRatio: 1.57
}
