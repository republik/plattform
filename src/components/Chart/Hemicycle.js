import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import partition from 'lodash/partition'
import ColorLegend from './ColorLegend'
import { sum } from 'd3-array'

import {
  sansSerifMedium12,
  sansSerifMedium14,
  sansSerifRegular12,
  sansSerifRegular14,
} from '../Typography/styles'
import { onlyS } from '../../theme/mediaQueries'
import colors from '../../theme/colors'

import { arc as d3arc } from 'd3-shape'
import { getTextColor } from './utils'

const styles = {
  axis: css({
    ...sansSerifRegular12,
    fill: colors.lightText,
  }),
  labelStrong: css({
    ...sansSerifMedium14,
    [onlyS]: {
      ...sansSerifMedium12,
    },
  }),
  label: css({
    ...sansSerifRegular14,
    [onlyS]: {
      ...sansSerifRegular12,
    },
  }),
}

const arc = d3arc()

const MAX_ARC = Math.PI

const calcSectorAngles = (vals = []) => {
  const total = sum(vals, d => +d.value)
  return vals.reduce((acc, cur, i) => {
    const deltaAngle = (MAX_ARC / total) * cur.value
    const startAngle = acc[i - 1] ? acc[i - 1][1] : -MAX_ARC / 2
    const endAngle = startAngle + deltaAngle
    acc.push([startAngle, endAngle, cur.label])
    return acc
  }, [])
}

const Hemicycle = ({
  values,
  width,
  unit,
  inlineLabelThreshold,
  middleAnnotation,
  padding,
  group,
  color,
  colorMaps,
  colorMap,
}) => {
  const margins = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  }

  const legendColorMap = colorMaps[colorMap] || colorMap

  const primaryGroupLabel = values.length > 0 && values[0][group]

  const labelheight = 18
  const sidePadding = width * 0.01 * padding
  const w = width - margins.left - margins.right - sidePadding
  const height = (w >> 1) + (primaryGroupLabel ? 3 : 2) * labelheight // radius of circle + group label + space for top label/value
  const h = height - margins.top - margins.bottom

  const [primaryVals, secondaryVals] = partition(
    values,
    v => v[group] === primaryGroupLabel,
  )
  const secondaryGroupLabel =
    secondaryVals.length > 0 && secondaryVals[0][group]

  const primaryValsTotal = sum(primaryVals, d => +d.value)

  const primaryAngles = calcSectorAngles(primaryVals)
  const secondaryAngles = calcSectorAngles(secondaryVals)

  const hemicycleWidth = w
  const hemicycleHeight = hemicycleWidth >> 1
  const outerRadiusPrimary = hemicycleHeight
  const innerRadiusPrimary = hemicycleHeight >> 1
  const outerRadiusSecondary = hemicycleHeight * 0.4
  const innerRadiusSecondary = hemicycleHeight * 0.3
  const hemicycleOffset = hemicycleHeight + 2 * labelheight

  return (
    <div>
      <svg height={height} width={width}>
        <g transform={`translate(${width >> 1},0)`}>
          <line
            x1={0}
            x2={0}
            y1={0}
            y2={
              h +
              labelheight -
              (secondaryAngles.length > 0
                ? innerRadiusSecondary
                : innerRadiusPrimary)
            }
            stroke={'rgba(0,0,0,0.17)'}
          />
          {middleAnnotation && (
            <text
              {...styles.axis}
              x={5}
              y={0}
              alignmentBaseline="hanging"
            >
              {middleAnnotation}
            </text>
          )}
        </g>
        <g
          transform={`translate(${(margins.left + sidePadding) >>
            1},${margins.top})`}
        >
          <g transform={`translate(${w >> 1},${hemicycleOffset})`}>
            {primaryAngles.map(d => {
              const datum = primaryVals.find(g => g.label === d[2])
              const fill = legendColorMap[datum[color].toUpperCase()]
              return (
                <>
                  <path
                    fill={fill}
                    d={arc({
                      outerRadius: outerRadiusPrimary,
                      innerRadius: innerRadiusPrimary,
                      startAngle: d[0],
                      endAngle: d[1] + 0.001,
                    })}
                  />
                </>
              )
            })}
            {primaryAngles
              .filter(
                (d, i) =>
                  primaryVals[i].value >= inlineLabelThreshold,
              )
              .map(d => {
                const isMajorParty =
                  Math.abs(d[1] - d[0]) > MAX_ARC / 10
                const datum = primaryVals.find(g => g.label === d[2])
                const fill =
                  legendColorMap[datum[color].toUpperCase()]
                const x =
                  hemicycleHeight *
                  (isMajorParty ? 0.75 : 1.1) *
                  Math.sin((d[0] + d[1]) / 2)
                const y = Math.max(
                  -hemicycleOffset,
                  -hemicycleHeight *
                    (isMajorParty ? 0.75 : 1.15) *
                    Math.cos((d[0] + d[1]) / 2),
                )

                const textAnchor =
                  isMajorParty || Math.abs(d[0] + d[1] / 2) < 0.5
                    ? 'middle'
                    : d[0] < 0
                    ? 'end'
                    : 'start'

                return (
                  <g transform={`translate(${x},${y})`}>
                    <text
                      {...styles.label}
                      x={0}
                      y={0}
                      textAnchor={textAnchor}
                      alignmentBaseline="hanging"
                      fill={
                        isMajorParty ? getTextColor(fill) : '#000'
                      }
                    >
                      {d[2]}
                    </text>
                    <text
                      {...styles.label}
                      x={0}
                      y={labelheight * 0.9}
                      textAnchor={textAnchor}
                      alignmentBaseline="hanging"
                      fill={
                        isMajorParty ? getTextColor(fill) : '#000'
                      }
                    >
                      {datum.value}
                    </text>
                  </g>
                )
              })}
            {secondaryAngles.map(d => {
              const datum = secondaryVals.find(g => g.label === d[2])
              const fill = legendColorMap[datum[color].toUpperCase()]
              return (
                <>
                  <path
                    fill={fill}
                    d={arc({
                      outerRadius: outerRadiusSecondary,
                      innerRadius: innerRadiusSecondary,
                      startAngle: d[0],
                      endAngle: d[1] + 0.001,
                    })}
                  />
                </>
              )
            })}
          </g>
          <text
            {...styles.labelStrong}
            x={0}
            y={h}
            textAnchor="start"
          >
            {primaryGroupLabel}
          </text>
          <text
            {...styles.labelStrong}
            x={hemicycleWidth * 0.3}
            y={h}
            textAnchor="start"
          >
            {secondaryGroupLabel}
          </text>
          <text
            {...styles.label}
            x={hemicycleWidth >> 1}
            y={h - labelheight}
            textAnchor="middle"
          >
            {`${primaryValsTotal} ${unit || ''}`}
          </text>
        </g>
      </svg>
      <div style={{ width, marginTop: 5 }}>
        <ColorLegend
          inline
          values={primaryVals
            .filter(v => v.value < inlineLabelThreshold)
            .map(v => ({
              color: legendColorMap[v[color].toUpperCase()],
              label: `${v.label}: ${v.value}`,
            }))}
        />
      </div>
    </div>
  )
}

Hemicycle.propTypes = {
  width: PropTypes.number.isRequired,
  unit: PropTypes.string,
  padding: PropTypes.number,
  inlineLabelThreshold: PropTypes.number,
  middleAnnotation: PropTypes.string,
  group: PropTypes.string,
  color: PropTypes.string,
  colorMap: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  colorMaps: PropTypes.object.isRequired,
  values: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
    }),
  ).isRequired,
}

Hemicycle.defaultProps = {
  color: 'label',
  group: 'year',
  values: [],
  inlineLabelThreshold: 10,
  padding: 0,
  colorMap: 'swissPartyColors',
}

export default Hemicycle
