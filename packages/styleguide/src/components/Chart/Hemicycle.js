import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import partition from 'lodash/partition'
import ColorLegend from './ColorLegend'
import { sum } from 'd3-array'
import {
  sansSerifMedium14,
  sansSerifRegular12,
  sansSerifRegular14,
} from '../Typography/styles'

import { arc as d3arc } from 'd3-shape'
import { getTextColor } from './utils'
import { getColorMapper } from './colorMaps'
import { useColorContext } from '../Colors/useColorContext'
import { defaultProps } from './ChartContext'

const styles = {
  axis: css({
    ...sansSerifRegular12,
  }),
  labelStrong: css({
    ...sansSerifMedium14,
  }),
  label: css({
    ...sansSerifRegular14,
  }),
}

const arc = d3arc()

const MAX_ARC = Math.PI

const calcSectorAngles = (vals = []) => {
  const total = sum(vals, (d) => +d.value)
  return vals.reduce((acc, cur, i) => {
    const deltaAngle = (MAX_ARC / total) * cur.value
    const startAngle = acc[i - 1] ? acc[i - 1][1] : -MAX_ARC / 2
    const endAngle = startAngle + deltaAngle
    acc.push([startAngle, endAngle, cur.label])
    return acc
  }, [])
}

const Hemicycle = (props) => {
  const {
    values,
    width,
    unit,
    inlineLabelThreshold,
    middleAnnotation,
    padding,
    group,
    color: colorProp,
  } = props
  const margins = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  }

  const color = getColorMapper(props)
  const [colorScheme] = useColorContext()
  const primaryGroupLabel = values.length > 0 && values[0][group]

  const labelheight = 18
  const sidePadding = width * 0.01 * padding
  const w = width - margins.left - margins.right - sidePadding
  const height = (w >> 1) + (primaryGroupLabel ? 3 : 2) * labelheight // radius of circle + group label + space for top label/value
  const h = height - margins.top - margins.bottom

  const [primaryVals, secondaryVals] = partition(
    values,
    (v) => v[group] === primaryGroupLabel,
  )
  const secondaryGroupLabel =
    secondaryVals.length > 0 && secondaryVals[0][group]

  const primaryValsTotal = sum(primaryVals, (d) => +d.value)

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
            {...colorScheme.set('stroke', 'text')}
            style={{
              opacity: 0.17,
            }}
          />
          {middleAnnotation && (
            <text
              {...styles.axis}
              {...colorScheme.set('fill', 'textSoft')}
              x={5}
              y={0}
              alignmentBaseline='hanging'
            >
              {middleAnnotation}
            </text>
          )}
        </g>
        <g
          transform={`translate(${(margins.left + sidePadding) >> 1},${
            margins.top
          })`}
        >
          <g transform={`translate(${w >> 1},${hemicycleOffset})`}>
            {primaryAngles.map((d, i) => {
              const datum = primaryVals.find((g) => g.label === d[2])
              const fill = color(datum[colorProp])
              return (
                <path
                  key={`primaryPath${i}`}
                  {...colorScheme.set('fill', fill, 'charts')}
                  d={arc({
                    outerRadius: outerRadiusPrimary,
                    innerRadius: innerRadiusPrimary,
                    startAngle: d[0],
                    endAngle: d[1] + 0.001,
                  })}
                />
              )
            })}
            {primaryAngles
              .filter((d, i) => primaryVals[i].value >= inlineLabelThreshold)
              .map((d, i) => {
                const isMajorParty = Math.abs(d[1] - d[0]) > MAX_ARC / 10
                const datum = primaryVals.find((g) => g.label === d[2])
                const fill = color(datum[colorProp])
                const x =
                  hemicycleHeight *
                  (isMajorParty ? 0.75 : 1.05) *
                  Math.sin((d[0] + d[1]) / 2)
                const y = Math.max(
                  -hemicycleOffset,
                  -hemicycleHeight *
                    (isMajorParty ? 0.78 : 1.15) *
                    Math.cos((d[0] + d[1]) / 2),
                )

                const textAnchor =
                  isMajorParty || Math.abs(d[0] + d[1] / 2) < 0.5
                    ? 'middle'
                    : d[0] < 0
                    ? 'end'
                    : 'start'

                return (
                  <g key={`primaryText${i}`} transform={`translate(${x},${y})`}>
                    <text
                      {...styles.label}
                      x={0}
                      y={0}
                      textAnchor={textAnchor}
                      alignmentBaseline='hanging'
                      fill={getTextColor(fill)}
                    >
                      {d[2]}
                    </text>
                    <text
                      {...styles.label}
                      x={0}
                      y={labelheight * 0.9}
                      textAnchor={textAnchor}
                      alignmentBaseline='hanging'
                      fill={getTextColor(fill)}
                    >
                      {datum.value}
                    </text>
                  </g>
                )
              })}
            {secondaryAngles.map((d, i) => {
              const datum = secondaryVals.find((g) => g.label === d[2])
              const fill = color(datum[colorProp])
              return (
                <path
                  key={`secondaryPath${i}`}
                  {...colorScheme.set('fill', fill, 'charts')}
                  d={arc({
                    outerRadius: outerRadiusSecondary,
                    innerRadius: innerRadiusSecondary,
                    startAngle: d[0],
                    endAngle: d[1] + 0.001,
                  })}
                />
              )
            })}
          </g>
          <text
            {...styles.labelStrong}
            {...colorScheme.set('fill', 'text')}
            x={0}
            y={h}
            textAnchor='start'
          >
            {primaryGroupLabel}
          </text>
          <text
            {...styles.labelStrong}
            {...colorScheme.set('fill', 'text')}
            x={hemicycleWidth * 0.3}
            y={h}
            textAnchor='start'
          >
            {secondaryGroupLabel}
          </text>
          <text
            {...styles.label}
            {...colorScheme.set('fill', 'text')}
            x={hemicycleWidth >> 1}
            y={h - labelheight}
            textAnchor='middle'
          >
            {`${primaryValsTotal} ${unit || ''}`}
          </text>
        </g>
      </svg>
      <div style={{ width, marginTop: 5 }}>
        <ColorLegend
          inline
          values={primaryVals
            .filter((v) => v.value < inlineLabelThreshold)
            .map((v) => ({
              color: color(v[colorProp]),
              label: `${v.label}: ${v.value}`,
            }))}
        />
      </div>
    </div>
  )
}

export const propTypes = {
  width: PropTypes.number.isRequired,
  unit: PropTypes.string,
  padding: PropTypes.number,
  inlineLabelThreshold: PropTypes.number,
  middleAnnotation: PropTypes.string,
  group: PropTypes.string,
  color: PropTypes.string,
  colorMap: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  values: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        .isRequired,
    }),
  ).isRequired,
}

Hemicycle.propTypes = propTypes

Hemicycle.defaultProps = defaultProps.Hemicycle

export default Hemicycle
