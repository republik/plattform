import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { useColorContext } from '../Colors/useColorContext'
import { ChartContext } from './ChartContext'
import LineGroup from './LineGroup'
import XAxis from './XAxis'
import { defaultProps } from './ChartContext'

import { sansSerifRegular12 as LABEL_FONT } from '../Typography/styles'

import { X_UNIT_PADDING } from './Layout.constants'

import { yScales } from './Lines.utils'

import { sortPropType, xAccessor } from './utils'

import ColorLegend from './ColorLegend'

const styles = {
  bandLegend: css({
    ...LABEL_FONT,
    whiteSpace: 'nowrap',
  }),
  bandBar: css({
    display: 'inline-block',
    width: 24,
    height: 11,
    marginBottom: -1,
    borderTopWidth: 4,
    borderBottomWidth: 4,
    borderTopStyle: 'solid',
    borderBottomStyle: 'solid',
  }),
}

const LineChart = (props) => {
  const {
    width,
    mini,
    description,
    band,
    bandLegend,
    area,
    areaOpacity,
    endDy,
    strokeWidth,
    strokeWidthHighlighted,
  } = props

  const [colorScheme] = useColorContext()
  const chartContext = React.useContext(ChartContext)
  const { paddingLeft, paddingRight, yLayout, groupPosition, xAxis, yAxis } =
    chartContext

  const visibleColorLegendValues = []
    .concat(chartContext.colorLegendValues)
    .concat(
      !mini &&
        band &&
        bandLegend && {
          label: (
            <span {...styles.bandLegend} {...colorScheme.set('color', 'text')}>
              <span
                {...styles.bandBar}
                {...colorScheme.set('backgroundColor', 'text')}
                {...colorScheme.set('borderTopColor', 'divider')}
                {...colorScheme.set('borderBottomColor', 'divider')}
              />
              {` ${bandLegend}`}
            </span>
          ),
        },
    )
    .filter(Boolean)

  return (
    <>
      <div style={{ paddingLeft, paddingRight }}>
        <ColorLegend inline values={visibleColorLegendValues} />
      </div>
      <svg
        width={width}
        height={chartContext.height + (props.xUnit ? X_UNIT_PADDING : 0)}
      >
        <desc>{description}</desc>
        {chartContext.groupedData.map(({ values: lines, key }) => {
          const filterByColumn = (d) => !d.column || d.column === key
          const yLines = props.yLines || yAxis.ticks.map((tick) => ({ tick }))
          return (
            <g
              key={key || 1}
              transform={`translate(${
                groupPosition.x(key) + paddingLeft
              },${groupPosition.y(key)})`}
            >
              <LineGroup
                mini={mini}
                title={key}
                lines={lines}
                x={xAxis.scale}
                xAccessor={xAccessor}
                y={yAxis.scale}
                yTicks={yAxis.ticks}
                yLines={yLines.filter(filterByColumn)}
                yAxisFormat={yAxis.axisFormat}
                band={band}
                area={area}
                areaOpacity={areaOpacity}
                yCut={yLayout.yCut}
                yCutHeight={yLayout.yCutHeight}
                yConnectorSize={yLayout.yConnectorSize}
                yNeedsConnectors={yLayout.yNeedsConnectors}
                yAnnotations={chartContext.yAnnotations.filter(filterByColumn)}
                xAnnotations={chartContext.xAnnotations.filter(filterByColumn)}
                endDy={endDy}
                width={chartContext.innerWidth}
                paddingRight={paddingRight}
                strokeWidth={strokeWidth}
                strokeWidthHighlighted={strokeWidthHighlighted}
                xAxisElement={
                  <XAxis
                    xUnit={props.xUnit}
                    lines={props.xLines?.filter(filterByColumn)}
                    type={props.type}
                  />
                }
              />
            </g>
          )
        })}
      </svg>
    </>
  )
}

export const propTypes = {
  values: PropTypes.array.isRequired,
  width: PropTypes.number.isRequired,
  mini: PropTypes.bool,
  x: PropTypes.string.isRequired,
  xUnit: PropTypes.string,
  xScale: PropTypes.oneOf(['time', 'ordinal', 'linear']),
  xNumberFormat: PropTypes.string,
  xSort: sortPropType,
  xTicks: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  ),
  xLines: PropTypes.arrayOf(
    PropTypes.shape({
      column: PropTypes.string,
      tick: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        .isRequired,
      label: PropTypes.string,
      textAnchor: PropTypes.string,
    }).isRequired,
  ),
  yScale: PropTypes.oneOf(Object.keys(yScales)),
  timeParse: PropTypes.string.isRequired,
  timeFormat: PropTypes.string.isRequired,
  column: PropTypes.string,
  columnSort: sortPropType,
  columnFilter: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      test: PropTypes.string.isRequired,
    }),
  ),
  highlight: PropTypes.string,
  stroke: PropTypes.string,
  labelFilter: PropTypes.string,
  color: PropTypes.string,
  colorSort: sortPropType,
  colorRange: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  colorRanges: PropTypes.shape({
    sequential3: PropTypes.array.isRequired,
    discrete: PropTypes.array.isRequired,
  }).isRequired,
  colorMap: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  colorLegend: PropTypes.bool,
  colorLegendValues: PropTypes.arrayOf(PropTypes.string),
  category: PropTypes.string,
  areaOpacity: PropTypes.number,
  area: PropTypes.string,
  band: PropTypes.string,
  bandLegend: PropTypes.string,
  numberFormat: PropTypes.string.isRequired,
  zero: PropTypes.bool.isRequired,
  filter: PropTypes.string,
  startValue: PropTypes.bool.isRequired,
  endLabel: PropTypes.bool.isRequired,
  endLabelWidth: PropTypes.number,
  endDy: PropTypes.string.isRequired,
  minInnerWidth: PropTypes.number.isRequired,
  columns: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  paddingTop: PropTypes.number,
  paddingRight: PropTypes.number,
  paddingLeft: PropTypes.number,
  unit: PropTypes.string,
  yNice: PropTypes.number,
  yTicks: PropTypes.arrayOf(PropTypes.number),
  yLines: PropTypes.arrayOf(
    PropTypes.shape({
      column: PropTypes.string,
      tick: PropTypes.number.isRequired,
      label: PropTypes.string,
      base: PropTypes.bool,
    }).isRequired,
  ),
  yAnnotations: PropTypes.arrayOf(
    PropTypes.shape({
      column: PropTypes.string,
      value: PropTypes.number.isRequired,
      unit: PropTypes.string,
      label: PropTypes.string,
      x: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      dy: PropTypes.string,
      showValue: PropTypes.bool,
    }),
  ),
  xAnnotations: PropTypes.arrayOf(
    PropTypes.shape({
      column: PropTypes.string,
      valuePrefix: PropTypes.string,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        .isRequired,
      unit: PropTypes.string,
      label: PropTypes.string,
      x: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      x1: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      x2: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      position: PropTypes.oneOf(['top', 'bottom']),
      showValue: PropTypes.bool,
    }),
  ),
  tLabel: PropTypes.func.isRequired,
  description: PropTypes.string,
}

LineChart.propTypes = propTypes

export const Line = (props) => <LineChart {...defaultProps.Line} {...props} />

export const Slope = (props) => <LineChart {...defaultProps.Slope} {...props} />

// Additional Info for Docs
// - Slope just has different default props
Slope.base = 'Line'
